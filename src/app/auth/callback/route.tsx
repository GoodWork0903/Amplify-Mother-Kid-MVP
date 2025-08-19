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
  return r.json() as Promise<Tokens>;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) return NextResponse.redirect(new URL("/auth/signin", req.url));

  // state tells us which client initiated the flow
  let returnTo = "/";
  let app: "admin" | "tenant" | undefined;
  try {
    if (state) {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      returnTo = decoded.returnTo || "/";
      app = decoded.app;
    }
  } catch {}

  const clientToUse = app === "admin" ? ADMIN_ID : app === "tenant" ? TENANT_ID : undefined;
  // Try the hinted client first, then the other as fallback
  const attemptOrder = clientToUse ? [clientToUse, clientToUse === ADMIN_ID ? TENANT_ID : ADMIN_ID] : [ADMIN_ID, TENANT_ID];

  let tokens: Tokens | null = null;
  for (const cid of attemptOrder) {
    tokens = await exchange(code, cid);
    if (tokens) break;
  }
  if (!tokens) return NextResponse.redirect(new URL("/auth/signin", req.url));

  // (Optional) read claims if you want logic here
  // const [, payloadB64] = tokens.id_token.split(".");
  // const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());

  const res = NextResponse.redirect(new URL(returnTo, req.url));
  res.cookies.set("id_token", tokens.id_token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: tokens.expires_in,
  });
  res.cookies.set("access_token", tokens.access_token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: tokens.expires_in,
  });
  return res;
}
