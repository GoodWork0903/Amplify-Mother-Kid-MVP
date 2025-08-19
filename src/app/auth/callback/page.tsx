"use client";

import { useEffect, useState } from "react";

export default function Callback() {
  const [msg, setMsg] = useState("Finalizing sign-in…");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hash.get("access_token");
    const id_token = hash.get("id_token");
    const expires_in = Number(hash.get("expires_in") || "3600");

    if (!access_token || !id_token) {
      setMsg("Missing tokens. Please sign in again.");
      return;
    }

    // naive decode of id_token payload to pick role/tenant for redirect
    const payload = JSON.parse(atob(id_token.split(".")[1]));
    const groups: string[] = payload["cognito:groups"] || [];
    const tenantId: string | undefined = payload["custom:tenantId"];

    fetch("/api/auth/callback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ access_token, id_token, expires_in, groups, tenantId }),
    })
      .then((r) => r.json())
      .then(({ redirectTo }) => (window.location.href = redirectTo))
      .catch(() => setMsg("Could not store session. Try again."));
  }, []);

  return <p className="p-6 text-center">{msg}</p>;
}
