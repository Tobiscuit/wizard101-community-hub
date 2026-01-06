import { ImageResponse } from 'next/og';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { Wizard } from '@/types/firestore';

// Force request to be cached for performance
export const runtime = 'nodejs'; // Use nodejs because firebase-admin requires it
export const revalidate = 3600; // Cache for 1 hour

export const alt = 'Wizard Profile Social Card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SCHOOL_COLORS: Record<string, string> = {
    'Fire': '#ef4444',    // red-500
    'Ice': '#06b6d4',     // cyan-500
    'Storm': '#a855f7',   // purple-500
    'Myth': '#eab308',    // yellow-500
    'Life': '#22c55e',    // green-500
    'Death': '#64748b',   // slate-500
    'Balance': '#f97316', // orange-500
};

export default async function Image({ params }: { params: { username: string; wizardSlug: string } }) {
    // 1. Fetch Data
    const db = getAdminFirestore();
    const decodedUsername = decodeURIComponent(params.username).replace('@', '');
    const decodedSlug = decodeURIComponent(params.wizardSlug).toLowerCase();

    // Find User
    const usersSnap = await db.collection('users')
        .where('displayName', '==', decodedUsername)
        .limit(1)
        .get();

    if (usersSnap.empty) {
        return new ImageResponse(
            (
                <div style={{
                    fontSize: 60, background: '#0f172a', color: 'white',
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    Wizard Not Found
                </div>
            )
        );
    }
    
    // Find Wizard
    const userId = usersSnap.docs[0].id;
    const wizardsSnap = await db.collection('wizards')
        .where('userId', '==', userId)
        .get();

    const wizardDoc = wizardsSnap.docs.find(doc => {
        const w = doc.data() as Wizard;
        const s = w.name.toLowerCase().replace(/\s+/g, '-');
        return s === decodedSlug;
    });

    if (!wizardDoc) {
        return new ImageResponse(
            (
                 <div style={{
                    fontSize: 48, background: '#0f172a', color: 'white',
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                   Wizard Profile Not Found
                </div>
            )
        );
    }

    const wizard = wizardDoc.data() as Wizard;
    const schoolColor = SCHOOL_COLORS[wizard.school] || '#64748b';

    // 2. Render Image
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#020617', // slate-950
                    backgroundImage: `radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)`,
                    backgroundSize: '100px 100px',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Glow Effect */}
                <div style={{
                    position: 'absolute',
                    top: '-200px',
                    left: '-200px',
                    width: '800px',
                    height: '800px',
                    background: schoolColor,
                    filter: 'blur(200px)',
                    opacity: 0.2,
                    borderRadius: '50%',
                }}></div>

                {/* Card Container */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '1000px',
                    height: '400px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)', // card bg
                    borderRadius: '24px',
                    border: '2px solid rgba(255,255,255,0.1)',
                    padding: '48px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}>
                    {/* Left: Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                padding: '8px 24px',
                                borderRadius: '999px',
                                border: `2px solid ${schoolColor}`,
                                color: schoolColor,
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>
                                Level {wizard.level}
                            </div>
                            <div style={{ fontSize: '24px', color: '#94a3b8' }}>@{decodedUsername}</div>
                        </div>
                        
                        <div style={{ fontSize: '72px', fontWeight: 'bold', lineHeight: 1 }}>
                            {wizard.name}
                        </div>
                        
                        <div style={{ fontSize: '32px', color: schoolColor, fontWeight: 'bold' }}>
                            {wizard.school} School
                        </div>
                    </div>

                    {/* Right: Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '24px' }}>
                        {wizard.verifiedStats ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '24px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>Damage</span>
                                    <span style={{ fontSize: '48px', fontWeight: 'bold' }}>{wizard.verifiedStats.damage}%</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '24px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>Resist</span>
                                    <span style={{ fontSize: '48px', fontWeight: 'bold' }}>{wizard.verifiedStats.resist}%</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '24px', color: '#94a3b8', fontStyle: 'italic' }}>
                                Stats Not Verified
                            </div>
                        )}
                        
                        <div style={{ marginTop: '24px', fontSize: '20px', color: '#475569' }}>
                            commons.jrcodex.dev
                        </div>
                    </div>
                </div>
            </div>
        )
    );
}
