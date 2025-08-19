import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { access_token, id_token, expires_in, groups, tenantId } = await req.json();

  const maxAge = Math.max(60, Number(expires_in || 3600));
  const base = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge };

  const store = await cookies();
  store.set("access_token", access_token, base);
  store.set("id_token", id_token, base);

  // small, non-sensitive helpers for routing (not httpOnly)
  store.set("role", groups?.includes("super_admin") ? "super_admin" : "member", { path: "/", maxAge });
  if (tenantId) store.set("tenantId", tenantId, { path: "/", maxAge });

  const redirectTo = groups?.includes("super_admin") ? "/admin" : tenantId ? `/t/${tenantId}` : "/";

  return NextResponse.json({ redirectTo });
}


