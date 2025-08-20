// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, validateToken } from '@/lib/auth'
import { setSessionCookies } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
    }
    
    if (!code) {
      return NextResponse.redirect(new URL('/?error=no_code', request.url))
    }
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)
    
    // Validate and decode the ID token to get user info
    const user = await validateToken(tokens.id_token)
    
    // Set session cookies
    await setSessionCookies({
      user,
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in
    })
    
    // Parse state to get redirect URL
    let redirectUrl = '/'
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state))
        if (stateData.next) {
          redirectUrl = stateData.next
        }
      } catch (e) {
        console.warn('Failed to parse state:', e)
      }
    }
    
    return NextResponse.redirect(new URL(redirectUrl, request.url))
    
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
  }
}
