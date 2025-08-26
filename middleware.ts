// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { runWithAmplifyServerContext } from '@/utils/amplify-server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
// 
const protectedRoutes = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  if (!protectedRoutes.some(p => url.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const isAuthed = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        return !!session.tokens; // user has valid tokens
      } catch {
        return false;
      }
    },
  });

  if (isAuthed) return response;

  // Not signed in → send to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', url.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
