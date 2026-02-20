"use client";
import { SignInButton, SignedOut } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Optionally show a loading state while Clerk is checking auth
  if (!isLoaded) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: '#9ca3af', fontSize: '1.2rem' }}>Loading...</div>
      </div>
    );
  }

  // Only show the landing page if not signed in
  if (isSignedIn) return null;

  return (
    <main className="container">

      <header style={{ position: 'absolute', top: '24px', right: '32px', zIndex: 100 }}>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="action-btn btn-ghost">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem', position: 'relative', zIndex: 10 }}>
        <h1 className="title" style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>
          Dream Journal
        </h1>

        <p className="subtitle" style={{ fontSize: '1.4rem', marginBottom: '4rem', maxWidth: '650px', margin: '0 auto 4rem auto' }}>
          A private, minimalist workspace to record, explore, and reflect on your nocturnal thoughts.
        </p>

        <div className="glass-panel" style={{ marginBottom: '4rem', padding: '2.5rem', textAlign: 'left', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1.5rem', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span>📝</span> Explore and understand your dreams.
          </h3>
          <p style={{ color: '#d1d5db', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Reflect on what you've seen with:
          </p>
          <ul style={{ color: '#e5e7eb', display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '0', listStyle: 'none' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ fontSize: '1.2rem' }}>🔍</span> Symbolic interpretation</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ fontSize: '1.2rem' }}>🧠</span> Psychological perspectives</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ fontSize: '1.2rem' }}>🤔</span> Guided reflective prompts</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ fontSize: '1.2rem' }}>📖</span> A private, secure database</li>
          </ul>
        </div>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="submit-btn" style={{ fontSize: '1.2rem', padding: '1.2rem 3rem', width: 'auto', borderRadius: '12px' }}>
              Start Journaling
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </main>
  );
}
