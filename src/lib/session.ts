import { cookies } from "next/headers";

export async function isSignedIn() {
  return Boolean((await cookies()).get("access_token"));
}

export async function getAccessToken() {
  return (await cookies()).get("access_token")?.value;
}
