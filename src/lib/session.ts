import { cookies } from "next/headers";

export async function isSignedIn() {
  const cookieStore = await cookies();
  return cookieStore.get("id_token") != null;
}
