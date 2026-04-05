'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, user } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin')
      } else if (user.role === 'organizer') {
        router.push('/organizer')
      } else {
        router.push('/')
      }
    }
  }, [isAuthenticated, user, router])
  
  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || 'Неверный email или пароль')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[1292px] bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 lg:p-10">
        <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6 sm:p-7 md:p-8 max-w-[800px] mx-auto">
          <div className="max-w-[676px] mx-auto">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-[20.3px] font-semibold text-black mb-4 sm:mb-6 text-center">
              Вход /Регистрация
            </h2>
            
            <div className="relative bg-[#F1F5F9] rounded-[5px] h-[42px] sm:h-[47px] mb-6 sm:mb-8">
              <div className="absolute top-[3px] sm:top-[4px] left-[3px] sm:left-[4px] right-[3px] sm:right-[4px] bottom-[3px] sm:bottom-[4px] flex">
                <button
                  type="button"
                  className="flex-1 rounded-[5px] flex items-center justify-center transition-colors bg-white text-black shadow-sm"
                >
                  <span className="text-xs sm:text-sm md:text-[14.93px] font-medium">Вход</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="flex-1 rounded-[5px] flex items-center justify-center transition-colors text-[#64748B]"
                >
                  <span className="text-xs sm:text-sm md:text-[13.92px] font-medium">Регистрация</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-4 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-3 group"
              disabled={loading}
            >
              <img
                src="/icons/login-icon.png"
                alt="Login"
                width={20}
                height={20}
                className="brightness-0 group-hover:invert transition-all"
              />
              <span>{loading ? 'Вход...' : 'Войти'}</span>
            </Button>
          </form>

          <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-[#0F172A] font-semibold">
              Зарегистрироваться
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  )
}
