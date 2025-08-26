import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// if you don't have '@' alias, use: "../../utils/amplify-server"
import { runWithAmplifyServerContext } from "@/utils/amplify-server";
import { getCurrentUser } from "aws-amplify/auth/server";

export async function GET() {
  try {
    const user = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (ctx) => getCurrentUser(ctx)
    });
    return NextResponse.json({ username: user.username });
  } catch {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
}
