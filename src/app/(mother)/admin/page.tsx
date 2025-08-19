import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listTenants } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/auth/signin");

  const items: Array<{tenantId: string; name: string; createdAt?: number}> =
    await listTenants(token);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tenants</h1>
      <a className="inline-block rounded bg-black px-3 py-2 text-white" href="/admin/create-tenant">
        + Create Tenant
      </a>
      <ul className="divide-y rounded border bg-white">
        {items.map(t => (
          <li key={t.tenantId} className="p-3 flex justify-between">
            <span>{t.name}</span>
            <a className="text-blue-600" href={`/t/${t.tenantId}`} target="_blank">Open kid app</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
