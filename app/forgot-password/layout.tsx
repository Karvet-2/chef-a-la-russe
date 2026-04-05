import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Сброс пароля',
  description: 'Восстановление доступа к аккаунту Chef a la Russe',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
