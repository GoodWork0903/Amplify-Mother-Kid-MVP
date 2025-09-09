'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '@/utils/amplify-client';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';

type Form = {
  appname: string;
  subdomain: string;
  createdate: string; // yyyy-mm-dd
  manager: string;
  category: string;
  repoUrl: string;
  repoTokenArn: string;
};

export default function CreateChildAppPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [form, setForm] = useState<Form>({
    appname: '',
    subdomain: '',
    createdate: '',
    manager: '',
    category: 'default',
    repoUrl: '',
    repoTokenArn: '',
  });

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value } as Form));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBase) throw new Error('NEXT_PUBLIC_API_URL is not set');

      const { tokens } = await fetchAuthSession({ forceRefresh: true });

      const jwt =
        tokens?.accessToken?.toString() ??
        tokens?.idToken?.toString();

      if (!jwt) throw new Error('No authenticated session. Please sign in again.');

      const res = await fetch(`${apiBase}/child-apps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `${res.status} ${res.statusText}`);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Failed to create app');
    } finally {
      setPending(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Create Child App</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="App Name">
              <input
                name="appname"
                value={form.appname}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter app name"
              />
            </Field>

            <Field label="Domain">
              <input
                name="subdomain"
                value={form.subdomain}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g. acme"
              />
            </Field>

            <Field label="Create Date">
              <input
                name="createdate"
                value={form.createdate}
                onChange={handleChange}
                required
                type="date"
                className="input"
              />
            </Field>

            <Field label="Manager">
              <input
                name="manager"
                value={form.manager}
                onChange={handleChange}
                required
                className="input"
                placeholder="Manager name"
              />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Creating…' : 'Create'}
            </button>
          </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(212 212 212);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #000;
          box-shadow: 0 0 0 1px #000 inset;
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}
