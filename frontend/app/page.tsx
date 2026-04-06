import type { Metadata } from 'next'
import HomePage from './home-page'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chef-a-la-russe.ru'

export const metadata: Metadata = {
  title: 'Кабинет участника',
  description:
    'Личный кабинет участника чемпионата Chef a la Russe: статус регистрации, команда, загрузка технологических карт и фото блюд, результаты судей.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName: 'Chef a la Russe',
    title: 'Кабинет участника · Chef a la Russe',
    description:
      'Цифровая система оценивания кулинарного чемпионата: команда, материалы, баллы судей.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Page() {
  return <HomePage />
}
