// build a server-side Amplify config from envs
import { createServerRunner } from "@aws-amplify/adapter-nextjs";

// const region = process.env.NEXT_PUBLIC_REGION!;
const userPoolId = process.env.NEXT_PUBLIC_USER_POOL_ID!;
const userPoolClientId = process.env.NEXT_PUBLIC_APP_CLIENT_ID!;
const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!; // no https://

export const { runWithAmplifyServerContext } = createServerRunner({
  config: {
    Auth: {
      Cognito: {
        // region,
        userPoolId,
        userPoolClientId,
        loginWith: {
          oauth: {
            domain,
            scopes: ["openid", "email", "profile"],
            // redirects are not used on the server but must be present
            redirectSignIn: ["http://localhost:3000/login"],
            redirectSignOut: ["http://localhost:3000/"],
            responseType: "code",
          },
        },
      },
    },
  },
});
