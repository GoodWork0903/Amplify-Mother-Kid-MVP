'use client';
import { Amplify } from 'aws-amplify';

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID!,
        loginWith: {
          oauth: {
            domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
            scopes: ['openid', 'email'],
            redirectSignIn: [
            "http://localhost:3000/",
            "https://main.d32ea1w06mrsmk.amplifyapp.com/login"
            ],
            redirectSignOut: [
                       "http://localhost:3000/",
          "https://main.d32ea1w06mrsmk.amplifyapp.com/"],
            responseType: 'code',
          },
        },
      },
    },
  },
  { ssr: false }
);
