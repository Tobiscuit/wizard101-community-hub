import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
    width: 180,
    height: 180,
};

export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#002b36', // Solarized Base03 (Deep Blue)
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '20%', // iOSish squircle hint, but iOS will crop it anyway
                }}
            >
                {/* The Golden Spiral / Knot Abstraction (Ring) */}
                <div
                    style={{
                        width: '100px',
                        height: '100px',
                        border: '12px solid #b58900', // Solarized Yellow/Gold
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Inner Knot Detail */}
                     <div
                        style={{
                            width: '50px',
                            height: '50px',
                            border: '6px solid #b58900',
                            borderRadius: '50%',
                        }}
                    />
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
