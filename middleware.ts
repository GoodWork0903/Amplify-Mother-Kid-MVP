// middleware.ts (at repo root)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = { matcher: "/:path*" };

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  // On Amplify preview URLs and localhost, allow /t/<tenant> → /<tenant>
  const isPreview = host.endsWith(".amplifyapp.com") || host.startsWith("localhost");
  if (isPreview) {
    const m = url.pathname.match(/^\/t\/([\w-]+)(\/.*)?$/);
    if (m) {
      const tenant = m[1];
      const rest = m[2] || "";
      url.pathname = `/${tenant}${rest}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
