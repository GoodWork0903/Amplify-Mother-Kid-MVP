export default function KidSettings({ params }: { params: { tenant: string } }) {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{params.tenant} Settings</h1>
      <p className="text-sm text-zinc-600">
        Settings are stubbed for the MVP; branding & members will appear here later.
      </p>
    </div>
  );
}
