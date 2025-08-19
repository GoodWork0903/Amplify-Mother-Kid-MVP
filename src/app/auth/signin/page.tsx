"use client";

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
const REDIRECT_URI = encodeURIComponent(process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!);
const SCOPE = encodeURIComponent("openid email profile");

const ADMIN_CLIENT = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_ADMIN!;
const TENANT_CLIENT = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_TENANT!;

function buildAuthorizeUrl(clientId: string, returnTo: string, app: "admin" | "tenant") {
  const state = encodeURIComponent(
    btoa(JSON.stringify({ returnTo, app })) // tells callback which client/where to go
  );
  return `${COGNITO_DOMAIN}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&state=${state}`;
}

export default function SignIn() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-sm w-full space-y-3 rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <button
          className="w-full rounded-md bg-black text-white py-2"
          onClick={() =>
            (window.location.href = buildAuthorizeUrl(ADMIN_CLIENT, "/admin", "admin"))
          }
        >
          Sign in as Super Admin
        </button>
        <button
          className="w-full rounded-md border py-2"
          onClick={() =>
            (window.location.href = buildAuthorizeUrl(TENANT_CLIENT, "/t/acme", "tenant"))
          }
        >
          Sign in to Kid App (Acme)
        </button>
        <p className="text-xs text-zinc-500">
          MVP: tenant button targets <code>/t/acme</code>. We’ll compute this from JWT later.
        </p>
      </div>
    </div>
  );
}
