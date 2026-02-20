"use client";
import { useState } from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function Dashboard() {
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
      {/* Header with Auth */}
      <header style={{ position: 'absolute', top: '24px', right: '32px', zIndex: 100 }}>
        <SignedIn>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/journal" style={{ textDecoration: 'none' }}>
              <button className="action-btn btn-ghost">
                📖 My Journal
              </button>
            </Link>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '50%', backdropFilter: 'blur(10px)' }}>
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: { width: '36px', height: '36px' } } }} />
            </div>
          </div>
        </SignedIn>
      </header>

      {/* Main Content Area - max width adjusted for wide layout */}
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Input Section */}
        <div className="glass-panel" style={{ padding: '3rem 4rem' }}>
          <h1 className="title">Record a Dream</h1>
          <p className="subtitle">
            Write down what you experienced. The more detail, the better.
          </p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              placeholder="I was walking through an empty house, searching for a locked door..."
              className="dream-input"
            />

            <button
              type="submit"
              disabled={loading || !dream}
              className="submit-btn"
            >
              {loading ? 'Analyzing...' : 'Analyze Dream'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {interpretation && (
          <div className="result-area">

            {/* Image Visualization Section */}
            {imageUrl ? (
              <div className="image-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={interpretation.imageUrl} alt="Dream Visualization" className="dream-image" />
              </div>
            ) : (
              <button
                onClick={handleGenerateImage}
                disabled={imageLoading}
                className="action-btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center', padding: '1.5rem', marginBottom: '2.5rem', fontSize: '1.1rem' }}
              >
                {imageLoading ? 'Generating image...' : '🎨 Generate Image of this Dream'}
              </button>
            )}

            {/* Analysis Header */}
            <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 className="result-title">Analysis</h2>
                  <p className="mood-text">
                    <span style={{ color: '#9ca3af', fontWeight: '500' }}>Atmosphere:</span> {interpretation.mood}
                  </p>
                </div>

                <SignedIn>
                  {!saved ? (
                    <button
                      onClick={handleSaveDream}
                      disabled={saving}
                      className="action-btn btn-ghost"
                    >
                      {saving ? 'Saving...' : '💾 Save to Journal'}
                    </button>
                  ) : (
                    <span style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: '500', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)' }}>✓ Saved</span>
                  )}
                </SignedIn>
              </div>

              <div className="tags-container" style={{ marginTop: '1.5rem', marginBottom: '0' }}>
                {interpretation.tags?.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="analysis-grid">

              <div className="analysis-card">
                <h3>🔍 Symbolic Meaning</h3>
                <p>{interpretation.symbolism}</p>
              </div>

              <div className="analysis-card">
                <h3>🧠 Psychological Perspective</h3>
                <p>{interpretation.psychological_perspective}</p>
              </div>

              <div className="analysis-card highlight" style={{ gridColumn: '1 / -1' }}>
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
