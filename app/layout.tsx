import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const useTailwindPlayCdn =
  process.env.NODE_ENV === 'production' &&
  process.env.TAILWIND_PLAY_CDN !== '0' &&
  process.env.TAILWIND_PLAY_CDN !== 'false'

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Chef a la Russe',
    template: '%s · Chef a la Russe',
  },
  description:
    'Цифровая система оценивания кулинарного чемпионата Chef a la Russe',
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/logo.svg', type: 'image/svg+xml' }],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body
        className={`${montserrat.variable} font-sans antialiased min-h-screen bg-white text-slate-900`}
      >
        {useTailwindPlayCdn ? (
          <Script
            src="https://cdn.tailwindcss.com"
            strategy="beforeInteractive"
          />
        ) : null}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
