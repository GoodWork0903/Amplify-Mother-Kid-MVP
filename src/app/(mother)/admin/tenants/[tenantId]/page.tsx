import Link from "next/link";
import { getTenantById } from "@/lib/mock";

export default function TenantDetails({
  params,
}: {
  params: { tenantId: string };
}) {
  const t = getTenantById(params.tenantId);

  if (!t) {
    return <div className="text-zinc-600">Tenant not found.</div>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t.name}</h2>
          <p className="text-sm text-zinc-500">{t.subdomain}.(demo)</p>
        </div>
        <div className="flex gap-2">
          <Link
            className="rounded-lg border px-3 py-2 hover:bg-zinc-50"
            href={`/${t.subdomain}`}
          >
            Open kid app
          </Link>
          <Link
            className="rounded-lg border px-3 py-2 hover:bg-zinc-50"
            href="/admin"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs uppercase text-zinc-500">Plan</div>
          <div className="mt-1 text-lg font-medium">{t.plan}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs uppercase text-zinc-500">Subdomain</div>
          <div className="mt-1 text-lg font-medium">{t.subdomain}</div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="text-xs uppercase text-zinc-500">Created</div>
          <div className="mt-1 text-lg font-medium">{t.createdAt}</div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <div className="mb-2 text-sm font-semibold">Users</div>
        <p className="text-sm text-zinc-600">
          (Stub) 1 user — invite flow coming soon.
        </p>
      </section>
    </div>
  );
}
