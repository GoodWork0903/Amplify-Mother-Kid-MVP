export default async function KidSettings({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{tenant} Settings</h1>
      <p className="text-sm text-zinc-600">
        Settings are stubbed for the MVP; branding & members will appear here later.
      </p>
    </div>
  );
}
