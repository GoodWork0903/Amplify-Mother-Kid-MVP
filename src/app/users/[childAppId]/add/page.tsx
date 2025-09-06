"use client";
import { useState } from "react";
// import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function AddUserPage() {
  const { childAppId } = useParams();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      await getCurrentUser();
      const { tokens } = await fetchAuthSession({ forceRefresh: true });
      const jwt = tokens?.accessToken?.toString() ?? "";

      const res = await fetch(`${API_BASE}/childusers/${childAppId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setSuccess(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message || "Failed to add user");
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:opacity-90"
        >
          Add User
        </button>
      </form>

      {success && <p className="text-green-600 mt-3">User added successfully!</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </main>
  );
}
