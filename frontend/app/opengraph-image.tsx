import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Pet Tome - Wizard101 Pet Stats Calculator';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #0a0a12, #1a1a2e)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'serif',
                    border: '20px solid #ffd700',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <span style={{ fontSize: 100, marginRight: 20 }}>📖</span>
                </div>
                <h1
                    style={{
                        fontSize: 120,
                        color: '#ffd700',
                        margin: 0,
                        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                        fontWeight: 'bold',
                    }}
                >
                    Pet Tome
                </h1>
                <p
                    style={{
                        fontSize: 40,
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginTop: 20,
                        textAlign: 'center',
                        maxWidth: '800px',
                    }}
                >
                    Wizard101 Stats Calculator & Marketplace
                </p>
                <div
                    style={{
                        display: 'flex',
                        marginTop: 40,
                        gap: '20px',
                    }}
                >
                    <div style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: '10px', fontSize: 24 }}>
                        Calculate Stats
                    </div>
                    <div style={{ padding: '10px 20px', background: '#ffd700', color: 'black', borderRadius: '10px', fontSize: 24 }}>
                        Trade Pets
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
