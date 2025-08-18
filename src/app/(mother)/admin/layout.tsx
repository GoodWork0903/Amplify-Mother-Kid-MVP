"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active =
    pathname === href || (pathname?.startsWith(href + "/") ?? false);

  return (
    <Link
      href={href}
      className={[
        "block rounded-lg px-3 py-2 text-sm font-medium",
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr] bg-zinc-50">
      {/* Sidebar */}
      <aside className="border-r bg-white p-4">
        <div className="mb-6">
          <Link href="/admin" className="block text-xl font-bold">
            Mother Admin
          </Link>
          <p className="text-xs text-zinc-500">super admin console</p>
        </div>

        <nav className="space-y-1">
          <NavLink href="/admin" label="Tenants" />
          <NavLink href="/admin/metrics" label="Metrics" />
        </nav>

        <div className="mt-6">
          <Link
            href="/admin/create-tenant"
            className="block w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white text-center hover:opacity-90"
          >
            + Create Tenant
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">DashBoard </h1>
        </header>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
