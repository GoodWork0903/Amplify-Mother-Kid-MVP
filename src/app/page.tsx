'use client';

import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(user => setUsername(user.username))
      .catch(() => setUsername(null));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to Mother App</h1>
      {username ? (
        <>
          <p className="mb-2">Signed in as <b>{username}</b></p>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Sign out
          </button>
        </>
      ) : (
        <a
          href="/login"
          className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Sign in
        </a>
      )}
    </div>
  );
}
