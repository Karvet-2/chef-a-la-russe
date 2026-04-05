import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Кабинет судьи - Цифровая система оценивания кулинарного чемпионата "Chef a la Russe"',
  description: 'Цифровая система оценивания кулинарного чемпионата "Chef a la Russe" - Кабинет судьи',
}

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <div
        className="bg-organizer-page-pattern pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
      />
      {children}
    </div>
  )
}
