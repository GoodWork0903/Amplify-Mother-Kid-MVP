import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  const isLocal = hostname === "localhost";
  const isAmplify = hostname.endsWith(".amplifyapp.com");
  const isPreview = isLocal || isAmplify;

  // --- Preview/local helper: allow /t/<tenant>/... as an alias of /<tenant>/...
  if (isPreview) {
    const m = url.pathname.match(/^\/t\/([\w-]+)(\/.*)?$/);
    if (m) {
      const tenant = m[1];
      const rest = m[2] || "";
      url.pathname = `/${tenant}${rest}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // --- Custom domain routing (for when you add a real domain later)
  // admin.<domain> -> /admin...
  if (hostname.startsWith("admin.")) {
    if (!url.pathname.startsWith("/admin")) {
      url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // <tenant>.<domain> -> /<tenant>...
  const [sub] = hostname.split(".");
  if (sub && sub !== "www") {
    if (!url.pathname.startsWith(`/${sub}`)) {
      url.pathname = `/${sub}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

// Run middleware for app routes, skip static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map)).*)",
  ],
};
