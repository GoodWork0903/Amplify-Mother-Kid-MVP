"use client";

import "@/utils/amplify-client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

// Super-simple DataTable features: search, sort, pagination (client-side)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""; // e.g., https://abc.execute-api.us-east-1.amazonaws.com

export default function DashboardPage() {
  const router = useRouter();

  // raw data
  type ChildApp = {
    id?: string;
    appname?: string;
    subdomain?: string;
    manager?: string;
    status?: string;
    createdAt?: string | number | Date;
    url?: string;
    [key: string]: unknown;
  };
  const [rows, setRows] = useState<ChildApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // table UI state
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"appname" | "subdomain" | "status" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    async function load() {
      if (!API_BASE) {
        setError("Set NEXT_PUBLIC_API_URL in your env file.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        // Ensure we are signed in and get a fresh token (same as your working Create page)
        await getCurrentUser();
        const { tokens } = await fetchAuthSession({ forceRefresh: true });
        const jwt =
          tokens?.accessToken?.toString() ??
          tokens?.idToken?.toString() ?? "";
        if (!jwt) throw new Error("No authenticated session. Please sign in again.");

        const res = await fetch(`${API_BASE}/child-apps`, {
          method: "GET",
          headers: { Authorization: `Bearer ${jwt}` },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data) ? data : data.items || data.Items || [];
        setRows(list);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Failed to load");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // filter + sort + paginate (client-side)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.appname, r.subdomain, r.manager, r.status]
        .map((v) => (v ?? "").toString().toLowerCase())
        .some((txt) => txt.includes(q))
    );
  }, [rows, query]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = (a?.[sortKey] ?? "").toString();
      const bv = (b?.[sortKey] ?? "").toString();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = sorted.slice(start, end);

  function onSort(col: typeof sortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
  }

  function SortHeader({ label, col }: { label: string; col: typeof sortKey }) {
    const active = sortKey === col;
    const arrow = !active ? "" : sortDir === "asc" ? "▲" : "▼";
    return (
      <button
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 hover:underline ${active ? "text-black" : "text-neutral-700"}`}
        title="Sort"
      >
        <span>{label}</span>
        <span className="text-xs">{arrow}</span>
      </button>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by name, subdomain, status…"
            className="w-64 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring"
          />
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            title="Rows per page"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}/page</option>
            ))}
          </select>
          <button
            onClick={() => router.push("/child/create")}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Create a child app
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Child apps</h3>
          {!loading && (
            <span className="text-xs text-neutral-500">
              {total} result{total === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <thead className="bg-neutral-50">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-semibold [&>th]:text-neutral-700">
                  <th>No</th>
                  <th><SortHeader label="App" col="appname" /></th>
                  <th><SortHeader label="Subdomain" col="subdomain" /></th>
                  <th><SortHeader label="Status" col="status" /></th>
                  <th><SortHeader label="Created" col="createdAt" /></th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-neutral-500">No results.</td>
                  </tr>
                ) : (
                  pageRows.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">{start + i + 1}</td>
                      <td className="px-4 py-3">{r.appname || "-"}</td>
                      <td className="px-4 py-3">{r.subdomain || "-"}</td>
                      <td className="px-4 py-3">{r.status || "REQUESTED"}</td>
                      <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        {r.status === "READY" && r.url ? (
                          <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open</a>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-neutral-600">
              Showing {Math.min(start + 1, total)}–{Math.min(end, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-neutral-300 px-3 py-1 disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {currentPage} / {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                className="rounded-lg border border-neutral-300 px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function formatDate(v: string | number | Date | undefined): string {
  if (!v) return "-";
  try {
    // Accept ISO string or number
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}
