export async function fetchTenantCurrent(accessToken: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE!;
    const r = await fetch(`${base}/v1/tenant-current`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return r.json();
  }
  