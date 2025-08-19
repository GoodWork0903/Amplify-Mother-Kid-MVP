import Link from "next/link";

function authUrl(clientId: string) {
  const p = new URLSearchParams({
    client_id: clientId,
    redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
    response_type: "token",                // MVP: implicit flow (no secret)
    scope: "openid email profile",
  });
  return `${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/authorize?${p}`;
}

export default function SignIn() {
  return (
    <div className="grid place-items-center h-[70vh]">
      <div className="rounded-xl border p-6 w-[360px] space-y-3">
        <h2 className="text-xl font-semibold">Sign in</h2>
        <Link
          className="block rounded bg-black text-white text-center py-2"
          href={authUrl(process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_ADMIN!)}
        >
          Sign in as Super Admin
        </Link>
        <Link
          className="block rounded border text-center py-2"
          href={authUrl(process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID_TENANT!)}
        >
          Sign in to Kid App
        </Link>
      </div>
    </div>
  );
}
