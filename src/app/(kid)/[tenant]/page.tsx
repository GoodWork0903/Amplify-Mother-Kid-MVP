// app/(kid)/[tenant]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchTenantCurrent } from "@/lib/api";

export const dynamic = "force-dynamic"; // ensure this page runs server-side each request

type Props = { params: { tenant: string } };

export default async function KidHome({ params }: Props) {
  const tenantFromUrl = params.tenant;

  // Read the Cognito access token we set in the callback route
  const cookieStore = cookies();
  const token = cookies().get("access_token")?.value;
  if (!token) redirect("/auth/signin");

  // Call the protected API (API Gateway → Lambda)
  let tenant: { tenantId: string; name: string; branding?: any };
  try {
    tenant = await fetchTenantCurrent(token);
  } catch {
    // If token is invalid/expired the API returns 401, send user to sign-in
    redirect("/auth/signin");
  }

  // Optional: keep the URL in sync with the tenant we got from the token
  if (tenant?.tenantId && tenant.tenantId !== tenantFromUrl) {
    redirect(`/t/${tenant.tenantId}`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Welcome, {tenant.name}!</h1>
      <p className="text-sm text-zinc-600">Tenant ID: {tenant.tenantId}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-semibold">Getting started</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-600">
            <li>Invite your team (coming soon)</li>
            <li>Customize branding (coming soon)</li>
            <li>View usage (coming soon)</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-semibold">Status</div>
          <p className="mt-2 text-sm text-zinc-600">All systems nominal.</p>
        </div>
      </div>
    </div>
  );
}
