"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateTenantPage() {
  const r = useRouter();
  const [name, setName] = useState("");
  const [sub, setSub] = useState("");
  const [plan, setPlan] = useState<"Starter" | "Pro">("Starter");

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-xl font-semibold">Create Tenant (stub)</h2>

      <label className="block">
        <span className="text-sm text-zinc-600">Tenant name</span>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!sub) setSub(e.target.value.toLowerCase().replace(/\s+/g, ""));
          }}
          placeholder="Acme"
        />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-600">Subdomain</span>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={sub}
          onChange={(e) => setSub(e.target.value)}
          placeholder="acme"
        />
      </label>

      <label className="block">
        <span className="text-sm text-zinc-600">Plan</span>
        <select
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={plan}
          onChange={(e) => setPlan(e.target.value as any)}
        >
          <option>Starter</option>
          <option>Pro</option>
        </select>
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => {
            alert(
              `Stub only: would create tenant { name: ${name}, subdomain: ${sub}, plan: ${plan} }`
            );
            r.push("/admin");
          }}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Create
        </button>
        <button
          onClick={() => r.back()}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
