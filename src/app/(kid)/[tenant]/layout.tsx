import type { ReactNode } from "react";
import { getTenantBySubdomain } from "@/lib/mock";

export default function KidLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { tenant: string };
}) {
  const t = getTenantBySubdomain(params.tenant);
  const color = t?.branding.primaryColor ?? "#0EA5E9";

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="shadow-sm" style={{ background: color, color: "white" }}>
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">{t ? t.name : params.tenant}</div>
          <nav className="text-sm">
            <a href={`/${params.tenant}`} className="mr-4 underline">Dashboard</a>
            <a href={`/${params.tenant}/settings`} className="underline">Settings</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
