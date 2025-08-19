export async function fetchTenantCurrent(accessToken: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE!;
    const r = await fetch(`${base}/v1/tenant-current`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`API ${r.status}`);
    return r.json();
  }
export async function listTenants(accessToken: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE!;
    const res = await fetch(`${base}/v1/tenants`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }
  
export async function createTenant(accessToken: string, name: string) {
    const base = process.env.NEXT_PUBLIC_API_BASE!;
    const res = await fetch(`${base}/v1/tenants`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }
  