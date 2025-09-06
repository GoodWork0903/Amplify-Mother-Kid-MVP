'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to Mother App</h1>
      {isAuthenticated ? (
        <>
          <p className="mb-2">Signed in as <b>{user?.username}</b></p>
          <button
            onClick={signOut}
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
