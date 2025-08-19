import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  // clear local cookies
  const store = await cookies();
  ["access_token", "id_token", "role", "tenantId"].forEach((n) => {
    store.set(n, "", { path: "/", maxAge: 0 });
  });

  // bounce to Cognito logout so its session is cleared too
  const url = new URL(`${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/logout`);
  url.searchParams.set("client_id", process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_TENANT!);
  url.searchParams.set("logout_uri", process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI!);

  return NextResponse.redirect(url.toString());
}
