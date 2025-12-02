import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Wizard101 Pet Tome',
        short_name: 'Pet Tome',
        description: 'The ultimate Wizard101 pet stats calculator and manager.',
        start_url: '/',
        display: 'standalone',
        background_color: '#1a1625',
        theme_color: '#ffd700',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
