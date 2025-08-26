'use client';
import '../utils/amplify-client';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';

export function UserWidget() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(u => setUsername(u?.username)).catch(() => setUsername(null));
  }, []);

  return (
    <div>
      {username ? (
        <>
          <span>Signed in as {username}</span>{' '}
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <a href="/login">Sign in</a>
      )}
    </div>
  );
}
