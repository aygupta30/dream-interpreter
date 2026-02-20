"use client";
import { useEffect, useState } from 'react';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Link from 'next/link';
import html2canvas from 'html2canvas';

const modalStyles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        padding: '2rem'
    },
    content: {
        background: '#0f1115', border: '1px solid #272a33', borderRadius: '16px',
        width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
        position: 'relative', padding: '0'
    },
    closeBtn: {
        position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)',
        border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%',
        cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem'
    }
};

export default function JournalPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState('entries');
    const [selectedDream, setSelectedDream] = useState(null);
    const [exporting, setExporting] = useState(false);

    // Analytics State
    const [analytics, setAnalytics] = useState({
        totalDreams: 0,
        topMoods: [],
        topSymbols: []
    });

    useEffect(() => {
        if (isSignedIn) {
            fetch('/api/journal')
                .then(res => res.json())
                .then(data => {
                    if (data.dreams) {
                        setDreams(data.dreams);
                        calculateAnalytics(data.dreams);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isSignedIn]);

    const calculateAnalytics = (dreamData) => {
        const totalDreams = dreamData.length;

        // Count Moods
        const moodCounts = {};
        dreamData.forEach(d => {
            const mood = d.interpretation?.mood;
            if (mood) {
                moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            }
        });

        // Sort Moods by frequency (top 5)
        const topMoods = Object.entries(moodCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Count Symbols (Tags)
        const symbolCounts = {};
        dreamData.forEach(d => {
            const tags = d.interpretation?.tags || [];
            tags.forEach(tag => {
                symbolCounts[tag] = (symbolCounts[tag] || 0) + 1;
            });
        });

        // Sort Symbols by frequency (top 15)
        const topSymbols = Object.entries(symbolCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        setAnalytics({
            totalDreams,
            topMoods,
            topSymbols
        });
    };

    const handleExportImage = async () => {
        if (!selectedDream) return;
        setExporting(true);
        try {
            const element = document.getElementById('export-card');
            if (!element) return;

            // Wait for images to load if necessary
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                backgroundColor: '#0f1115',
                useCORS: true,
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `dream-journal-${new Date(selectedDream.created_at).toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export image. Please try again.");
        } finally {
            setExporting(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ color: '#a78bfa', fontSize: '1.2rem', animation: 'pulse 2s infinite' }}>Accessing your archives...</div>
            </div>
        );
    }

    return (
        <main className="container" style={{ alignItems: 'center', paddingTop: '6rem', paddingBottom: '6rem' }}>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
                <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Header */}
                    <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', padding: '2rem 3rem' }}>
                        <div>
                            <h1 className="title" style={{ fontSize: '3rem', textAlign: 'left', marginBottom: '0.5rem' }}>Journal Archives</h1>
                            <p className="subtitle" style={{ marginBottom: 0, textAlign: 'left', fontSize: '1.1rem' }}>
                                A record of your past dreams and their meanings.
                            </p>
                        </div>
                        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                            <button className="submit-btn" style={{ width: 'auto', padding: '1rem 2rem', marginTop: 0 }}>
                                + Record New Dream
                            </button>
                        </Link>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#a1a1aa' }}>Loading your archives...</div>
                    ) : dreams.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                            <p style={{ fontSize: '1.3rem', color: '#d4d4d8', marginBottom: '2rem' }}>Your archives are empty. Start recording to build your journal.</p>
                            <Link href="/dashboard">
                                <button className="submit-btn" style={{ width: 'auto', padding: '1.2rem 3rem' }}>Record a Dream</button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #272a33', paddingBottom: '1rem' }}>
                                <button
                                    onClick={() => setActiveTab('entries')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: activeTab === 'entries' ? '#ffffff' : '#9ca3af',
                                        fontSize: '1.1rem',
                                        fontWeight: activeTab === 'entries' ? '600' : '400',
                                        cursor: 'pointer',
                                        padding: '0.5rem 1rem',
                                        position: 'relative'
                                    }}
                                >
                                    Entries
                                    {activeTab === 'entries' && (
                                        <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '2px', background: '#ffffff' }} />
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('insights')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: activeTab === 'insights' ? '#ffffff' : '#9ca3af',
                                        fontSize: '1.1rem',
                                        fontWeight: activeTab === 'insights' ? '600' : '400',
                                        cursor: 'pointer',
                                        padding: '0.5rem 1rem',
                                        position: 'relative'
                                    }}
                                >
                                    Insights
                                    {activeTab === 'insights' && (
                                        <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '2px', background: '#ffffff' }} />
                                    )}
                                </button>
                            </div>

                            {/* View Switcher */}
                            {activeTab === 'entries' ? (
                                <div className="journal-grid">
                                    {dreams.map(dream => (
                                        <div key={dream.id} onClick={() => setSelectedDream(dream)} className="analysis-card journal-card" style={{ padding: 0, overflow: 'hidden' }}>

                                            {dream.image_url ? (
                                                <div className="journal-image-wrapper">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={dream.image_url} alt="Dream visualization" />
                                                </div>
                                            ) : (
                                                <div className="journal-image-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#374151' }}>
                                                    <span style={{ fontSize: '3rem', opacity: 0.5 }}>🌙</span>
                                                </div>
                                            )}

                                            <div className="journal-content">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <span className="journal-date">
                                                        {new Date(dream.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: '500' }}>
                                                        {dream.interpretation.mood}
                                                    </span>
                                                </div>

                                                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#f4f4f5', fontWeight: '600', lineHeight: '1.4' }}>
                                                    {dream.interpretation.dream_summary}
                                                </h3>

                                                <p className="journal-preview">
                                                    &quot;{dream.dream_text}&quot;
                                                </p>

                                                <div className="tags-container" style={{ marginTop: 'auto', marginBottom: 0, gap: '0.4rem' }}>
                                                    {dream.interpretation.tags.slice(0, 3).map((tag, i) => (
                                                        <span key={i} className="tag" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>{tag}</span>
                                                    ))}
                                                    {dream.interpretation.tags.length > 3 && (
                                                        <span className="tag" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', background: 'transparent' }}>+{dream.interpretation.tags.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="analysis-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                                    {/* Stats Overview */}
                                    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gridColumn: '1 / -1' }}>
                                        <h3 style={{ color: '#9ca3af', margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>Total Dreams Logged</h3>
                                        <p style={{ fontSize: '4rem', fontWeight: '700', margin: '0.5rem 0', color: '#ffffff' }}>{analytics.totalDreams}</p>
                                    </div>

                                    {/* Mood Frequencies */}
                                    <div className="glass-panel" style={{ padding: '2rem' }}>
                                        <h3 style={{ color: '#ffffff', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '600', borderBottom: '1px solid #272a33', paddingBottom: '1rem' }}>Dominant Moods</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {analytics.topMoods.map((mood, idx) => {
                                                const percentage = ((mood[1] / analytics.totalDreams) * 100).toFixed(0);
                                                return (
                                                    <div key={idx}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                                                            <span>{mood[0]}</span>
                                                            <span style={{ color: '#9ca3af' }}>{mood[1]} ({percentage}%)</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '8px', background: '#374151', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${percentage}%`, height: '100%', background: '#60a5fa', borderRadius: '4px' }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {analytics.topMoods.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Not enough data yet.</p>}
                                        </div>
                                    </div>

                                    {/* Top Symbols */}
                                    <div className="glass-panel" style={{ padding: '2rem' }}>
                                        <h3 style={{ color: '#ffffff', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '600', borderBottom: '1px solid #272a33', paddingBottom: '1rem' }}>Recurring Symbols</h3>
                                        <div className="tags-container" style={{ gap: '0.6rem' }}>
                                            {analytics.topSymbols.map((symbol, idx) => (
                                                <div key={idx} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <span style={{ color: '#ffffff' }}>{symbol[0]}</span>
                                                    <span style={{ background: '#374151', color: '#9ca3af', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.75rem' }}>{symbol[1]}</span>
                                                </div>
                                            ))}
                                            {analytics.topSymbols.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Not enough data yet.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Dream Detail Modal */}
                    {selectedDream && (
                        <div style={modalStyles.overlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedDream(null) }}>
                            <div style={modalStyles.content}>
                                <button style={modalStyles.closeBtn} onClick={() => setSelectedDream(null)}>✕</button>

                                {/* Modal Content - Scrollable */}
                                <div style={{ padding: '3rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                        <div>
                                            <div style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                                {new Date(selectedDream.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                            <h2 style={{ fontSize: '2rem', margin: 0, color: '#ffffff' }}>{selectedDream.interpretation.dream_summary}</h2>
                                        </div>
                                        <button
                                            onClick={handleExportImage}
                                            disabled={exporting}
                                            className="action-btn btn-ghost"
                                            style={{ padding: '0.8rem 1.2rem' }}
                                        >
                                            {exporting ? 'Exporting...' : '📸 Export as Image'}
                                        </button>
                                    </div>

                                    {selectedDream.image_url && (
                                        <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={selectedDream.image_url} alt="Dream visualization" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}

                                    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: '#9ca3af', marginBottom: '1rem', fontWeight: '500' }}>The Dream</h3>
                                        <p style={{ color: '#e5e7eb', lineHeight: '1.7', fontSize: '1.1rem' }}>{selectedDream.dream_text}</p>
                                    </div>

                                    <div className="analysis-grid" style={{ gridTemplateColumns: '1fr', marginTop: 0 }}>
                                        <div className="analysis-card" style={{ background: 'transparent', border: '1px solid #272a33' }}>
                                            <h3>🔍 Interpretation</h3>
                                            <p style={{ marginBottom: '1.5rem' }}>{selectedDream.interpretation.symbolism}</p>
                                            <h3>🧠 Psychological Perspective</h3>
                                            <p>{selectedDream.interpretation.psychological_perspective}</p>
                                        </div>
                                    </div>

                                    <div className="tags-container" style={{ marginTop: '2rem', gap: '0.5rem' }}>
                                        <span className="tag" style={{ background: '#374151', color: '#ffffff', border: 'none' }}>Mood: {selectedDream.interpretation.mood}</span>
                                        {selectedDream.interpretation.tags.map((tag, i) => (
                                            <span key={i} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hidden Export Component (The "Polaroid") */}
                    {selectedDream && (
                        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                            <div id="export-card" style={{
                                width: '800px',
                                background: '#0f1115',
                                padding: '40px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: '#f3f4f6'
                            }}>
                                <div style={{ border: '1px solid #272a33', borderRadius: '16px', overflow: 'hidden', background: '#181b21' }}>
                                    {selectedDream.image_url && (
                                        <div style={{ width: '100%', height: '450px' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={selectedDream.image_url} alt="Dream" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                                        </div>
                                    )}
                                    <div style={{ padding: '40px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <h1 style={{ fontSize: '28px', color: '#ffffff', margin: 0, fontWeight: '700' }}>{selectedDream.interpretation.dream_summary}</h1>
                                            <span style={{ fontSize: '16px', color: '#9ca3af' }}>{new Date(selectedDream.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <p style={{ fontSize: '18px', color: '#d1d5db', lineHeight: '1.6', marginBottom: '30px', fontStyle: 'italic', paddingLeft: '20px', borderLeft: '3px solid #374151' }}>
                                            &quot;{selectedDream.dream_text}&quot;
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            <span style={{ padding: '6px 14px', background: '#374151', color: '#ffffff', borderRadius: '20px', fontSize: '14px', fontWeight: '500' }}>{selectedDream.interpretation.mood}</span>
                                            {selectedDream.interpretation.tags.map((tag, i) => (
                                                <span key={i} style={{ padding: '6px 14px', background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151', borderRadius: '20px', fontSize: '14px' }}>{tag}</span>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #272a33', textAlign: 'center', color: '#6b7280', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                            Dream Journal
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SignedIn>
        </main>
    );
}
