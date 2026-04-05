'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Пароль не короче 6 символов')
      return
    }
    if (password !== password2) {
      setError('Пароли не совпадают')
      return
    }
    if (!token) {
      setError('Нет токена в ссылке. Запросите сброс пароля снова.')
      return
    }
    setLoading(true)
    try {
      await api.resetPassword(token, password)
      router.push('/login?reset=ok')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chef-login-root">
      <div className="chef-login-card-outer">
        <div className="chef-login-card-inner">
          <div className="chef-login-content max-w-[480px]">
            <h2 className="chef-login-title mb-6">Новый пароль</h2>

            {error && (
              <div className="chef-login-error mb-4">
                <p className="chef-login-error-text">{error}</p>
              </div>
            )}

            <form className="chef-login-form" onSubmit={handleSubmit}>
              <Input
                label="Новый пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                label="Повторите пароль"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                disabled={loading}
              />
              <Button type="submit" className="chef-login-submit" disabled={loading}>
                <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
              </Button>
            </form>

            <p className="chef-login-footer">
              <Link href="/login" className="chef-login-register-link">
                ← Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="chef-login-root p-8 text-center">Загрузка…</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
