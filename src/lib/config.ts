export const config = {
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    clientId: process.env.COGNITO_CLIENT_ID!,
    clientSecret: process.env.COGNITO_CLIENT_SECRET!,
    domain: process.env.COGNITO_DOMAIN!,
    region: process.env.COGNITO_REGION!,
    redirectUri: process.env.COGNITO_REDIRECT_URI!,
    logoutUri: process.env.COGNITO_LOGOUT_URI!
  },
  api: {
    baseUrl: process.env.API_BASE_URL!,
    proxyUrl: '/api/proxy'
  },
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL!
  }
}
  