import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'The Commons | Wizard101 Community Hub',
        short_name: 'The Commons',
        description: 'The permanent home for Wizard101 guilds, trading, and lore.',
        start_url: '/',
        display: 'standalone',
        background_color: '#002b36',
        theme_color: '#b58900',
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
