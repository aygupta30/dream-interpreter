"use client";
import { useState } from 'react';

export default function Home() {
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);

  // Image Generation State
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dream) return;
    setLoading(true);
    setInterpretation('');
    setImageUrl(''); // Reset image on new dream

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

  return (
    <main className="container">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

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
              <h2 className="result-title">Dream Analysis</h2>

              {imageUrl ? (
                <div className="image-container">
                  <img src={imageUrl} alt="Dream Visualization" className="dream-image" />
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
