import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ServiceWorkerRegistration } from '@/components/sw-registration'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dashboard CAT',
  description: 'Painel executivo para gestão de processos trabalhistas e análise de risco jurídico',
  generator: 'v0.app',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Dashboard CAT',
  },
  icons: {
    icon: [
      {
        url: '/caterpillar-logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/pwa-icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F6D000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased overflow-x-hidden">
        {children}
        <ServiceWorkerRegistration />
        <Analytics />
      </body>
    </html>
  )
}
