// middleware.ts (at repo root)
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export const config = { matcher: "/:path*" };

// export function middleware(req: NextRequest) {
//   const url = req.nextUrl.clone();
//   const host = req.headers.get("host") || "";

//   // On Amplify preview URLs and localhost, allow /t/<tenant> → /<tenant>
//   const isPreview = host.endsWith(".amplifyapp.com") || host.startsWith("localhost");
//   if (isPreview) {
//     const m = url.pathname.match(/^\/t\/([\w-]+)(\/.*)?$/);
//     if (m) {
//       const tenant = m[1];
//       const rest = m[2] || "";
//       url.pathname = `/${tenant}${rest}`;
//       return NextResponse.rewrite(url);
//     }
//   }

//   return NextResponse.next();
// }

// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let auth, API and static assets pass through untouched
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") // files like /logo.png
  ) {
    return NextResponse.next();
  }

  // Optional: support pretty tenant URL /t/<tenant> -> /<tenant>
  if (pathname.startsWith("/t/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/t\//, "/");
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

