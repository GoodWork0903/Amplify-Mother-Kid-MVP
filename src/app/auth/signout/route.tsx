import { NextRequest, NextResponse } from "next/server";

const DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
const ADMIN_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_ADMIN!;
const TENANT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_TENANT!;
const LOGOUT_URI = process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI!;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const app = url.searchParams.get("app") === "admin" ? "admin" : "tenant";
  const client = app === "admin" ? ADMIN_ID : TENANT_ID;

  const res = NextResponse.redirect(
    `${DOMAIN}/logout?client_id=${encodeURIComponent(client)}&logout_uri=${encodeURIComponent(LOGOUT_URI)}`
  );

  // remove cookies locally
  res.cookies.set("id_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("access_token", "", { path: "/", maxAge: 0 });
  return res;
}
