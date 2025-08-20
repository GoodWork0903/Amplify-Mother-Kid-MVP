// src/lib/auth.ts
import { jwtVerify } from 'jose'
import { config } from './config'

export interface CognitoTokens {
  access_token: string
  id_token: string
  refresh_token: string
  expires_in: number
}

export interface CognitoUser {
  sub: string
  email: string
  email_verified: boolean
  name?: string
  groups?: string[]
}

export async function exchangeCodeForTokens(code: string): Promise<CognitoTokens> {
  const tokenEndpoint = `https://${config.cognito.domain}/oauth2/token`
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.cognito.clientId,
      client_secret: config.cognito.clientSecret,
      code,
      redirect_uri: config.cognito.redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens')
  }

  return response.json()
}

export async function validateToken(token: string): Promise<CognitoUser> {
  try {
    const jwksUrl = `https://cognito-idp.${config.cognito.region}.amazonaws.com/${config.cognito.userPoolId}/.well-known/jwks.json`
    
    const { payload } = await jwtVerify(token, async (header) => {
      const jwksResponse = await fetch(jwksUrl)
      const jwks = await jwksResponse.json()
      const key = jwks.keys.find((k: { kid: string }) => k.kid === header.kid)
      
      if (!key) {
        throw new Error('No matching key found')
      }
      
      return key
    })

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      email_verified: payload.email_verified as boolean,
      name: payload.name as string,
      groups: payload['cognito:groups'] as string[]
    }
  } catch {
    throw new Error('Invalid token')
  }
}

export function getCognitoLoginUrl(state?: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.cognito.clientId,
    redirect_uri: config.cognito.redirectUri,
    scope: 'openid email profile',
    state: state || ''
  })
  
  return `https://${config.cognito.domain}/oauth2/authorize?${params.toString()}`
}

export function getCognitoLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: config.cognito.clientId,
    logout_uri: config.cognito.logoutUri
  })
  
  return `https://${config.cognito.domain}/logout?${params.toString()}`
}
