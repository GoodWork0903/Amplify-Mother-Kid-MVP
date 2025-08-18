export default async function KidDashboard({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Welcome, {tenant}!</h1>

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
