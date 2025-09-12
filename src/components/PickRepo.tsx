"use client";
// components/PickRepo.tsx
import { useState, useEffect } from "react";
import "@/utils/amplify-client";
import { fetchAuthSession } from "aws-amplify/auth";

interface Repo {
  repo: string;
  branches: string[];
}

export default function PickRepo() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [status, setStatus] = useState("");
  const [url, setUrl] = useState("");
  const [appId, setAppId] = useState("");
  const [loading, setLoading] = useState(false);
  const [adoptError, setAdoptError] = useState("");

  // Load repos after GitHub is connected
  useEffect(() => {
    async function loadRepos() {
      setReposLoading(true);
      setReposError("");
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL;
        const { tokens } = await fetchAuthSession({ forceRefresh: true });
        const jwt = tokens?.accessToken?.toString() ?? tokens?.idToken?.toString();
        if (!jwt) throw new Error("Not authenticated");
        const res = await fetch(`${apiBase}/github/repos`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!res.ok) throw new Error(`Failed to load repos (${res.status})`);
        const data = await res.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        console.error("Failed to load repos", err);
        setReposError(err instanceof Error ? err.message : "Failed to load repositories");
      } finally {
        setReposLoading(false);
      }
    }
    loadRepos();
  }, []);

  // Poll status
  useEffect(() => {
    if (!appId) return;
    let cancelled = false;
    let failures = 0;
    const terminalStatuses = new Set(["DEPLOYED", "FAILED", "ERROR"]);
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    const poll = async () => {
      try {
        const { tokens } = await fetchAuthSession({ forceRefresh: false });
        const jwt = tokens?.accessToken?.toString() ?? tokens?.idToken?.toString();
        if (!apiBase || !jwt) return;
        const res = await fetch(`${apiBase}/apps/${appId}/status`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (!res.ok) throw new Error(`Status polling error ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        if (data?.status) setStatus(data.status);
        if (data?.deploymentUrl) setUrl(data.deploymentUrl);
        if (data?.deploymentUrl || (data?.status && terminalStatuses.has(data.status))) {
          clearInterval(interval);
        }
        failures = 0;
      } catch (e) {
        failures += 1;
        if (failures >= 3) {
          clearInterval(interval);
        }
      }
    };
    const interval = setInterval(poll, 10000);
    // fire immediately too
    poll();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [appId]);

  async function handleAdopt() {
    setLoading(true);
    setAdoptError("");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBase) throw new Error("NEXT_PUBLIC_API_URL is not set");
      const { tokens } = await fetchAuthSession({ forceRefresh: true });
      const jwt = tokens?.accessToken?.toString() ?? tokens?.idToken?.toString();
      if (!jwt) throw new Error("Not authenticated");
      const res = await fetch(`${apiBase}/apps/adopt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ repo: selectedRepo, branch: selectedBranch }),
      });
      if (!res.ok) throw new Error(`Adopt failed (${res.status})`);
      const data = await res.json();
      if (data?.appId) setAppId(data.appId);
      if (data?.status) setStatus(data.status);
      if (data?.deploymentUrl) setUrl(data.deploymentUrl);
    } catch (err: unknown) {
      console.error("Adopt error", err);
      setAdoptError(err instanceof Error ? err.message : "Failed to adopt app");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Select a Repo to Adopt</h2>

      {/* Repo dropdown */}
      <select
        className="border p-2 rounded mb-2"
        value={selectedRepo}
        onChange={(e) => {
          const value = e.target.value;
          setSelectedRepo(value);
          setSelectedBranch("");
        }}
        disabled={reposLoading}
      >
        <option value="">-- Select Repo --</option>
        {repos.map((r) => (
          <option key={r.repo} value={r.repo}>
            {r.repo}
          </option>
        ))}
      </select>
      {reposLoading && <span className="ml-2 text-gray-500">Loading...</span>}
      {reposError && <div className="text-red-600 mt-1">{reposError}</div>}

      {/* Branch dropdown */}
      {selectedRepo && (
        <select
          className="border p-2 rounded mb-2 ml-2"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          disabled={reposLoading}
        >
          <option value="">-- Select Branch --</option>
          {repos
            .find((r) => r.repo === selectedRepo)
            ?.branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
        </select>
      )}

      {/* Deploy button */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
        disabled={!selectedRepo || !selectedBranch || loading}
        onClick={handleAdopt}
      >
        {loading ? "Deploying..." : "Adopt App"}
      </button>
      {adoptError && <div className="text-red-600 mt-2">{adoptError}</div>}

      {/* Status + URL */}
      {status && (
        <div className="mt-4">
          <p>Status: {status}</p>
          {url && (
            <a href={url} target="_blank" className="text-blue-600 underline">
              {url}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
