'use client';

import '@/utils/amplify-client';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function RedirectOnAuth() {
  const router = useRouter();
  const { authStatus } = useAuthenticator();

  useEffect(() => {
    if (authStatus === 'authenticated') {
      const next = new URLSearchParams(window.location.search).get('next') || '/dashboard';
      router.replace(next);
    }
  }, [authStatus, router]);

  return null; // no UI, just redirects when signed in
}

export default function LoginPage() {
  return (
    <div style={{ maxWidth: 420, margin: '3rem auto' }}>
      <Authenticator
        signUpAttributes={[
           'email', 
           'name']}
        formFields={{
          signUp: {
            name: { label: 'First name', placeholder: 'Jane', isRequired: true, order: 1 },
            email: { order: 3 },
          },
        }}
      >
        <RedirectOnAuth />
      </Authenticator>
    </div>
  );
}
