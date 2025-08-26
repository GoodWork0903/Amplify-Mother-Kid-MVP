// src/app/api/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { runWithAmplifyServerContext } from '@/utils/amplify-server';
import { getCurrentUser } from 'aws-amplify/auth/server';

export async function GET() {
  try {
    const user = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (ctx) => getCurrentUser(ctx),
    });

    return NextResponse.json({ username: user.username });
  } catch {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
}
