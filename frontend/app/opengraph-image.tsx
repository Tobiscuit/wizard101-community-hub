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
                    background: '#073642', // Solarized Base02 (Deep Teal)
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Vector Grid Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'linear-gradient(#b58900 1px, transparent 1px), linear-gradient(90deg, #b58900 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    opacity: 0.1,
                }} />

                {/* Central "Node" Graphic (CSS Vector) */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '40px',
                    position: 'relative',
                }}>
                    {/* Outer Ring */}
                    <div style={{
                        width: '150px',
                        height: '150px',
                        border: '4px solid #b58900',
                        borderRadius: '50%',
                        position: 'absolute',
                        opacity: 0.5,
                    }} />
                    {/* Inner Ring */}
                    <div style={{
                        width: '120px',
                        height: '120px',
                        border: '8px solid #b58900',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: 60 }}>🦉</span>
                    </div>
                </div>

                <h1
                    style={{
                        fontSize: 90,
                        color: '#fdf6e3', // Solarized Base3 (Light Cream)
                        margin: 0,
                        fontWeight: 'bold',
                        letterSpacing: '-0.05em',
                        textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        zIndex: 10,
                    }}
                >
                    The Commons
                </h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                     <div style={{ width: '40px', height: '2px', background: '#b58900' }} />
                     <p
                        style={{
                            fontSize: 32,
                            color: '#b58900', // Yellow
                            margin: 0,
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        Wizard101 Community Hub
                    </p>
                    <div style={{ width: '40px', height: '2px', background: '#b58900' }} />
                </div>

                 <div
                    style={{
                        display: 'flex',
                        marginTop: 60,
                        gap: '40px',
                        opacity: 0.9,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#2aa198', borderRadius: '50%' }} />
                        <span style={{ color: '#eee8d5', fontSize: 24 }}>Stat Calculator</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#2aa198', borderRadius: '50%' }} />
                        <span style={{ color: '#eee8d5', fontSize: 24 }}>Marketplace</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#2aa198', borderRadius: '50%' }} />
                        <span style={{ color: '#eee8d5', fontSize: 24 }}>Guilds</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#2aa198', borderRadius: '50%' }} />
                        <span style={{ color: '#eee8d5', fontSize: 24 }}>Gamma AI</span>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
