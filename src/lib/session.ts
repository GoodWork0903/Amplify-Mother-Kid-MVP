import { cookies } from 'next/headers'
import { CognitoUser } from './auth'

export interface Session {
  user: CognitoUser
  accessToken: string
  idToken: string
  refreshToken: string
  expiresAt: number
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  
  const accessToken = cookieStore.get('access_token')?.value
  const idToken = cookieStore.get('id_token')?.value
  const refreshToken = cookieStore.get('refresh_token')?.value
  const expiresAt = cookieStore.get('expires_at')?.value
  const userData = cookieStore.get('user_data')?.value
  
  if (!accessToken || !idToken || !refreshToken || !expiresAt || !userData) {
    return null
  }
  
  // Check if token is expired
  if (Date.now() > parseInt(expiresAt)) {
    return null
  }
  
  try {
    const user = JSON.parse(userData) as CognitoUser
    return {
      user,
      accessToken,
      idToken,
      refreshToken,
      expiresAt: parseInt(expiresAt)
    }
  } catch {
    return null
  }
}

export async function setSessionCookies(session: Omit<Session, 'expiresAt'> & { expiresIn: number }) {
  const cookieStore = await cookies()
  const expiresAt = Date.now() + (session.expiresIn * 1000)
  
  // Set httpOnly cookies
  cookieStore.set('access_token', session.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: session.expiresIn,
    path: '/'
  })
  
  cookieStore.set('id_token', session.idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: session.expiresIn,
    path: '/'
  })
  
  cookieStore.set('refresh_token', session.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/'
  })
  
  cookieStore.set('expires_at', expiresAt.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: session.expiresIn,
    path: '/'
  })
  
  cookieStore.set('user_data', JSON.stringify(session.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: session.expiresIn,
    path: '/'
  })
}

export async function clearSessionCookies() {
  const cookieStore = await cookies()
  
  cookieStore.delete('access_token')
  cookieStore.delete('id_token')
  cookieStore.delete('refresh_token')
  cookieStore.delete('expires_at')
  cookieStore.delete('user_data')
}
