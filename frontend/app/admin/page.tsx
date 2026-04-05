'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAuth } from '@/contexts/AuthContext'
import { api, User } from '@/lib/api'

export default function AdminHome() {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()
  const [stats, setStats] = useState({
    users: 0,
    participants: 0,
    organizers: 0,
    admins: 0,
    teams: 0,
    loading: true,
  })

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role !== 'admin') {
        router.push('/')
      } else {
        loadStats()
      }
    }
  }, [loading, isAuthenticated, user, router])

  const loadStats = async () => {
    try {
      const [users, teams] = await Promise.all([
        api.getAllUsers().catch(() => []),
        api.getOrganizerTeams().catch(() => []),
      ])

      const participants = (users || []).filter((u: User) => u.role === 'participant').length
      const organizers = (users || []).filter((u: User) => u.role === 'organizer').length
      const admins = (users || []).filter((u: User) => u.role === 'admin').length

      setStats({
        users: (users || []).length,
        participants,
        organizers,
        admins,
        teams: (teams || []).length,
        loading: false,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats({ users: 0, participants: 0, organizers: 0, admins: 0, teams: 0, loading: false })
    }
  }

  if (loading || stats.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-[114px] py-6 sm:py-8 md:py-10">
        <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 lg:p-10">
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black mb-1">
                  Панель управления
                </h2>
                <p className="text-sm sm:text-base text-[#71717B]">
                  Обзор системы и быстрый доступ к основным разделам
                </p>
              </div>
            </div>
            {stats.users === 0 && stats.teams === 0 && !stats.loading && (
              <div className="mt-4 p-4 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                <p className="text-sm text-black font-medium mb-2">
                  ⚠️ База данных пуста
                </p>
                <p className="text-xs text-[#71717B]">
                  В системе пока нет пользователей и команд. Это нормально для новой системы.
                  Вы можете создать пользователей через страницу <strong>"Пользователи"</strong> или использовать команду:
                </p>
                <code className="block mt-2 px-3 py-2 bg-white rounded text-xs border border-[#E2E8F0]">
                  npm run create-admin admin@example.com "Пароль123" "Имя Фамилия"
                </code>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 flex flex-col hover:shadow-[0px_6px_20px_rgba(0,0,0,0.25)] transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F1F5F9] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#71717B] mb-2">
                  Всего пользователей
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A]">
                    {stats.users}
                  </p>
                </div>
                <p className="text-xs text-[#71717B]">В системе зарегистрировано</p>
              </div>
            </div>

            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 flex flex-col hover:shadow-[0px_6px_20px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#F1F5F9] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#71717B] mb-2">
                  Участники
                </h3>
                <div className="flex-grow flex items-center mb-4">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A]">
                    {stats.participants}
                  </p>
                </div>
                <Link
                  href="/admin/users?role=participant"
                  className="flex items-center justify-center gap-2 bg-[#F1F5F9] text-black hover:bg-[#0F172A] hover:text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-all group/btn"
                >
                  <span>Перейти</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 flex flex-col hover:shadow-[0px_6px_20px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#F1F5F9] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#71717B] mb-2">
                  Судьи
                </h3>
                <div className="flex-grow flex items-center mb-4">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A]">
                    {stats.organizers}
                  </p>
                </div>
                <Link
                  href="/admin/users?role=organizer"
                  className="flex items-center justify-center gap-2 bg-[#F1F5F9] text-black hover:bg-[#0F172A] hover:text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-all group/btn"
                >
                  <span>Перейти</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 flex flex-col hover:shadow-[0px_6px_20px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#F1F5F9] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#71717B] mb-2">
                  Администраторы
                </h3>
                <div className="flex-grow flex items-center mb-4">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A]">
                    {stats.admins}
                  </p>
                </div>
                <Link
                  href="/admin/users?role=admin"
                  className="flex items-center justify-center gap-2 bg-[#F1F5F9] text-black hover:bg-[#0F172A] hover:text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-all group/btn"
                >
                  <span>Перейти</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 flex flex-col hover:shadow-[0px_6px_20px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#F1F5F9] rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-300"></div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#71717B] mb-2">
                  Команды
                </h3>
                <div className="flex-grow flex items-center mb-4">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A]">
                    {stats.teams}
                  </p>
                </div>
                <Link
                  href="/admin/teams"
                  className="flex items-center justify-center gap-2 bg-[#F1F5F9] text-black hover:bg-[#0F172A] hover:text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-all group/btn"
                >
                  <span>Перейти</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
