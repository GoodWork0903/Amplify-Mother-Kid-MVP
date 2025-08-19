import { NextRequest, NextResponse } from "next/server";

const DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
const ADMIN_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_ADMIN!;
const TENANT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_TENANT!;
const REDIRECT = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!;

type Tokens = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
};

async function exchange(code: string, clientId: string): Promise<Tokens | null> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: REDIRECT,
  });

  const r = await fetch(`${DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!r.ok) return null;
  return (await r.json()) as Tokens;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) return NextResponse.redirect(new URL("/auth/signin", req.url));

  // Parse state (which button was clicked)
  let hintedApp: "admin" | "tenant" | undefined = undefined;
  let hintedReturnTo = "";
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64").toString());
      hintedApp = parsed.app;
      hintedReturnTo = parsed.returnTo || "";
    } catch {}
  }

  // Try hinted client first, then the other as fallback
  const tryFirst = hintedApp === "admin" ? ADMIN_ID : hintedApp === "tenant" ? TENANT_ID : ADMIN_ID;
  const trySecond = tryFirst === ADMIN_ID ? TENANT_ID : ADMIN_ID;

  let tokens: Tokens | null = await exchange(code, tryFirst);
  if (!tokens) tokens = await exchange(code, trySecond);
  if (!tokens) return NextResponse.redirect(new URL("/auth/signin", req.url));

  // --- decode the ID token payload (no verification yet for MVP) ---
  const [, payloadB64] = tokens.id_token.split(".");
  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

  const groups: string[] = payload["cognito:groups"] || [];
  const tenantId: string | undefined = payload["custom:tenantId"];

  // Decide destination:
  // - If state included a returnTo and user is super_admin, use it.
  // - Else pick by group/tenantId.
  let redirectTo = "/";
  if (groups.includes("super_admin")) {
    redirectTo = hintedReturnTo || "/admin";
  } else if (tenantId) {
    redirectTo = `/t/${tenantId}`;
  } else {
    // no tenantId → bounce to signin
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // Set httpOnly cookies and go
  const res = NextResponse.redirect(new URL(redirectTo, req.url));
  res.cookies.set("id_token", tokens.id_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in,
  });
  res.cookies.set("access_token", tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: tokens.expires_in,
  });
  return res;
}
