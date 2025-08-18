export type Tenant = {
  id: string;
  name: string;
  subdomain: string;
  plan: "Starter" | "Pro";
  createdAt: string;
  branding: { primaryColor: string };
};

export const tenants: Tenant[] = [
  {
    id: "acme-1",
    name: "Acme",
    subdomain: "acme",
    plan: "Starter",
    createdAt: "2025-08-16",
    branding: { primaryColor: "#0EA5E9" },
  },
];
export const getTenantById = (id: string) =>
  tenants.find((t) => t.id === id);

export const getTenantBySubdomain = (subdomain: string) =>
  tenants.find((t) => t.subdomain === subdomain);