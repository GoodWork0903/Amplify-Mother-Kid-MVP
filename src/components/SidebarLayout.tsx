// components/SidebarLayout.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { ReactNode } from "react";

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-100 text-sm text-neutral-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 space-y-4">
        <h1 className="text-lg font-bold">Mother App</h1>
        <nav className="flex flex-col gap-3 text-sm">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/child/create" className="hover:underline">Create Child App</Link>
          <Link href="/users/global" className="hover:underline">Users</Link>
        </nav>

        <div className="mt-8">
          <button
            onClick={handleSignOut}
            className="text-red-600 hover:underline text-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
