'use client'

import { useState } from 'react'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setResetLink(null)
    setLoading(true)
    try {
      const data = await api.requestPasswordReset(email)
      setMessage(data.message || 'Готово.')
      if (data.resetLink) setResetLink(data.resetLink)
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
            <div className="flex justify-center mb-4 sm:mb-5">
              <Link href="/" className="inline-flex" aria-label="Chef a la Russe">
                <img
                  src="/logo.svg"
                  alt=""
                  width={240}
                  height={80}
                  className="h-16 sm:h-20 w-auto max-w-[240px] object-contain"
                />
              </Link>
            </div>
            <h2 className="chef-login-title mb-6">Сброс пароля</h2>
            <p className="text-sm text-[#64748B] mb-6 text-center">
              Укажите email — мы отправим ссылку для нового пароля (или проверьте лог сервера, если почта не
              настроена).
            </p>

            {error && (
              <div className="chef-login-error mb-4">
                <p className="chef-login-error-text">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                {message}
              </div>
            )}

            {resetLink && (
              <p className="mb-4 text-center text-sm break-all">
                <Link href={resetLink} className="text-[#0F172A] font-semibold underline">
                  Открыть ссылку сброса
                </Link>
              </p>
            )}

            <form className="chef-login-form" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Button type="submit" className="chef-login-submit" disabled={loading}>
                <span>{loading ? 'Отправка...' : 'Отправить'}</span>
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
