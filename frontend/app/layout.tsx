import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const montserrat = Montserrat({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Кабинет участника - Цифровая система оценивания кулинарного чемпионата "Chef a la Russe"',
  description: 'Цифровая система оценивания кулинарного чемпионата "Chef a la Russe"',
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/logo.svg', type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable} font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
