"use client";
import { useEffect, useState } from 'react';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function JournalPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isSignedIn) {
            fetch('/api/journal')
                .then(res => res.json())
                .then(data => {
                    if (data.dreams) setDreams(data.dreams);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isSignedIn]);

    if (!isLoaded) return <div className="container text-white">Loading...</div>;

    return (
        <main className="container" style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 className="title" style={{ fontSize: '2.5rem', textAlign: 'left' }}>My Dream Journal</h1>
                        <Link href="/">
                            <button className="submit-btn" style={{ width: 'auto', padding: '0.5rem 1.5rem', marginTop: 0 }}>
                                + New Dream
                            </button>
                        </Link>
                    </div>

                    {loading ? (
                        <p style={{ color: '#ccc' }}>Accessing archives...</p>
                    ) : dreams.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
                            <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '1rem' }}>No dreams recorded yet.</p>
                            <Link href="/">
                                <button className="submit-btn" style={{ width: 'auto' }}>Record your first dream</button>
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {dreams.map(dream => (
                                <div key={dream.id} className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.5s ease' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                                        <span style={{ color: '#8ec5fc', fontSize: '0.9rem' }}>
                                            {new Date(dream.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        <span style={{ color: '#e0c3fc', fontWeight: 'bold' }}>{dream.interpretation.mood}</span>
                                    </div>

                                    {dream.image_url && (
                                        <div className="image-container" style={{ maxHeight: '200px', marginBottom: '1rem' }}>
                                            <img src={dream.image_url} alt="Dream" className="dream-image" />
                                        </div>
                                    )}

                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>{dream.interpretation.dream_summary}</h3>
                                    <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                        &quot;{dream.dream_text.length > 150 ? dream.dream_text.substring(0, 150) + '...' : dream.dream_text}&quot;
                                    </p>

                                    <div className="tags-container">
                                        {dream.interpretation.tags.map((tag, i) => (
                                            <span key={i} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SignedIn>
        </main>
    );
}
