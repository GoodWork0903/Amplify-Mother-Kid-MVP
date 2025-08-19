import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createTenant } from "@/lib/api";

export default function CreateTenantPage() {
  async function action(formData: FormData) {
    "use server";
    const token = (await cookies()).get("access_token")?.value;
    if (!token) redirect("/auth/signin");
    const name = String(formData.get("name") || "").trim();
    await createTenant(token, name);
    redirect(`/admin`);
  }

  return (
    <form action={action} className="space-y-4 max-w-md">
      <h1 className="text-xl font-semibold">Create Tenant</h1>
      <input
        name="name"
        placeholder="Tenant name (e.g. Acme, Inc.)"
        className="w-full rounded border p-2"
        required
      />
      <button className="rounded bg-black px-4 py-2 text-white">Create</button>
    </form>
  );
}
