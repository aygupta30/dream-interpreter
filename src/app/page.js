"use client";
import { useState } from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);

  // Image Generation State
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  // Journal State
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dream) return;
    setLoading(true);
    setInterpretation('');
    setImageUrl('');
    setSaved(false); // Reset saved state

    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream }),
      });
      const data = await res.json();
      if (data.interpretation) {
        setInterpretation(data.interpretation);
      } else if (data.error) {
        setInterpretation(`Error: ${data.error} ${data.details ? `(${data.details})` : ''}`);
      }
    } catch (error) {
      console.error(error);
      setInterpretation(`Something went wrong. Please check your console logs or ensure your API key is correct. Details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!interpretation) return;
    setImageLoading(true);
    try {
      const description = `${interpretation.dream_summary} ${interpretation.tags?.join(", ")}`;
      const res = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      }
    } catch (error) {
      console.error("Image generation failed", error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleSaveDream = async () => {
    if (!isSignedIn || !interpretation) return;
    setSaving(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dream_text: dream,
          interpretation: interpretation,
          image_url: imageUrl || null
        })
      });

      // Always parse the JSON to get the error message
      const data = await res.json();
      console.log("Journal Save Response:", data);

      if (res.ok && data.success) {
        setSaved(true);
      } else {
        console.error("Journal Save Failed:", data);
        alert(`Failed to save: ${data.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error("Network Custom Error:", e);
      alert(`Error saving dream: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Header with Auth */}
      <header style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="submit-btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', marginTop: 0 }}>
              Sign In to Save Dreams
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/journal">
              <button className="submit-btn" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', marginTop: 0, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                My Journal 📖
              </button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </header>

      <div className="glass-panel">
        <h1 className="title">Dream Interpreter</h1>
        <p className="subtitle">
          Unlock the secrets of your subconscious. Describe your dream below.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="I was flying over a golden ocean..."
            className="dream-input"
          />

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Consulting the Oracles...' : 'Interpret My Dream'}
          </button>
        </form>

        {interpretation && (
          <div className="result-area">
            {/* Header Section: Summary, Mood, Tags */}
            <div className="mb-6 border-b border-white/10 pb-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="result-title">Dream Analysis</h2>
                <SignedIn>
                  {!saved ? (
                    <button
                      onClick={handleSaveDream}
                      disabled={saving}
                      style={{ background: 'transparent', border: '1px solid #8ec5fc', color: '#8ec5fc', padding: '0.3rem 0.8rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(142, 197, 252, 0.1)'}
                      onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                      {saving ? 'Saving...' : '💾 Save to Journal'}
                    </button>
                  ) : (
                    <span style={{ color: '#4ade80', fontSize: '0.9rem' }}>✅ Saved</span>
                  )}
                </SignedIn>
              </div>

              {imageUrl ? (
                <div className="image-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={interpretation.imageUrl} alt="Dream Visualization" className="dream-image" />
                </div>
              ) : (
                <button
                  onClick={handleGenerateImage}
                  disabled={imageLoading}
                  className="w-full py-3 mb-6 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all text-sm text-purple-200 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ border: '1px dashed rgba(255,255,255,0.3)', width: '100%', padding: '1rem', marginTop: '1rem', marginBottom: '2rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#e0c3fc' }}
                >
                  {imageLoading ? 'Painting your dream...' : '✨ Visualize This Dream (Generate Image)'}
                </button>
              )}

              <p className="mood-text"><strong>Mood:</strong> {interpretation.mood}</p>
              <div className="tags-container">
                {interpretation.tags?.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="analysis-grid">

              <div className="analysis-card">
                <h3>🔮 Symbolism</h3>
                <p>{interpretation.symbolism}</p>
              </div>

              <div className="analysis-card">
                <h3>🧠 Psychological View</h3>
                <p>{interpretation.psychological_perspective}</p>
              </div>

              <div className="analysis-card highlight">
                <h3>🤔 Reflective Prompts</h3>
                <ul>
                  {interpretation.reflective_prompts?.map((prompt, idx) => (
                    <li key={idx}>{prompt}</li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
