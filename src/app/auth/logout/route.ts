import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookies } from '@/lib/session'
import { getCognitoLogoutUrl } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Clear session cookies
    await clearSessionCookies()
    
    // Get Cognito logout URL
    const logoutUrl = getCognitoLogoutUrl()
    
    // Redirect to Cognito logout
    return NextResponse.redirect(logoutUrl)
    
  } catch (error) {
    console.error('Logout error:', error)
    // Even if there's an error, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }
}
