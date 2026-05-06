import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Labor Hub | Caterpillar',
    short_name: 'Labor Hub',
    description: 'Painel executivo para gestão de processos trabalhistas e análise de risco jurídico',
    start_url: '/',
    display: 'standalone',
    background_color: '#111111',
    theme_color: '#F6D000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/pwa-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
