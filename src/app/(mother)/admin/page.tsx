// export default function Page() {
//   return (
//     <main style={{padding:20}}>
//       <h1>Mother Admin</h1>
//       <p>Tenants (demo):</p>
//       <ul>
//         <li><a href="/acme">Open kid app: acme</a></li>
//       </ul>
//     </main>
//   );
// }
// app/(mother)/admin/page.tsx

// app/(kid)/[tenant]/page.tsx
import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/session";
import Link from "next/link";
import { tenants } from "@/lib/mock";

export default function AdminPage() {
  if(!isSignedIn()) redirect("/auth/signin");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tenants</h2>
        <Link
          href="/admin/create-tenant"
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          + Create Tenant
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 text-left">Tenant</th>
              <th className="px-4 py-3 text-left">Subdomain</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3">{t.subdomain}</td>
                <td className="px-4 py-3">{t.plan}</td>
                <td className="px-4 py-3">{t.createdAt}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    className="rounded-lg border px-3 py-1.5 hover:bg-zinc-50"
                    href={`/${t.subdomain}`}
                  >
                    Open kid app
                  </Link>
                  {/* NOTE: The Tenant Details "Open" link comes in step 2.3 */}
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-500" colSpan={5}>
                  No tenants yet — click “Create Tenant”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
