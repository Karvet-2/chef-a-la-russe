'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

export default function AdminStatisticsPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalTeams: 0,
    totalResults: 0,
    usersByRole: {},
    usersByStatus: {},
    teamsByStatus: {},
    teamsByCategory: {},
    avgTeamScore: 0,
    topTeams: [],
    loading: true,
  })
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role !== 'admin') {
        router.push('/')
      } else {
        loadStatistics()
      }
    }
  }, [loading, isAuthenticated, user, router])

  const loadStatistics = async () => {
    try {
      const [users, teams, results] = await Promise.all([
        api.getAllUsers().catch((err) => {
          console.error('Error loading users:', err)
          return []
        }),
        api.getOrganizerTeams().catch((err) => {
          console.error('Error loading teams:', err)
          return []
        }),
        api.getOrganizerResults().catch((err) => {
          console.error('Error loading results:', err)
          return []
        }),
      ])
      
      const usersByRole = {
        participant: (users || []).filter((u: any) => u.role === 'participant').length,
        organizer: (users || []).filter((u: any) => u.role === 'organizer').length,
        admin: (users || []).filter((u: any) => u.role === 'admin').length,
      }

      const usersByStatus = {
        confirmed: (users || []).filter((u: any) => u.status === 'confirmed').length,
        pending: (users || []).filter((u: any) => u.status === 'pending').length,
      }

      const teamsByStatus = {
        confirmed: (teams || []).filter((t: any) => t.status === 'confirmed').length,
        pending: (teams || []).filter((t: any) => t.status === 'pending').length,
      }

      const categoryCount: any = {}
      ;(teams || []).forEach((t: any) => {
        categoryCount[t.category] = (categoryCount[t.category] || 0) + 1
      })
      const teamsByCategory = categoryCount

      let avgTeamScore = 0
      if (results && results.length > 0) {
        const totalScore = results.reduce((sum: number, r: any) => sum + (r.avgScore || 0), 0)
        avgTeamScore = totalScore / results.length
      }

      const topTeams = (results || []).slice(0, 5)

      setStats({
        totalUsers: (users || []).length,
        totalTeams: (teams || []).length,
        totalResults: (teams || []).reduce((sum: number, t: any) => sum + (t.results?.length || 0), 0),
        usersByRole,
        usersByStatus,
        teamsByStatus,
        teamsByCategory,
        avgTeamScore: avgTeamScore.toFixed(2),
        topTeams,
        loading: false,
      })
    } catch (error) {
      console.error('Error loading statistics:', error)
      setStats({ ...stats, loading: false })
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
      
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-[110px] py-6 sm:py-8 md:py-10">
        <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 lg:p-10">
          <div className="mb-6">
            <h1 className="text-lg sm:text-xl md:text-[23px] font-semibold text-black mb-2">
              Детальная статистика
            </h1>
            <p className="text-sm text-[#71717B]">
              Подробная аналитика и распределение данных системы
            </p>
            {stats.totalUsers === 0 && stats.totalTeams === 0 && !stats.loading && (
              <div className="mt-4 p-4 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg">
                <p className="text-sm text-black font-medium mb-2">
                  ⚠️ База данных пуста
                </p>
                <p className="text-xs text-[#71717B] mb-2">
                  В системе пока нет пользователей и команд. Это нормально для новой системы.
                </p>
                <p className="text-xs text-[#71717B]">
                  💡 <strong>Как добавить данные:</strong>
                </p>
                <ul className="text-xs text-[#71717B] mt-2 ml-4 list-disc space-y-1">
                  <li>Перейдите на страницу <strong>"Пользователи"</strong> и создайте пользователей через интерфейс</li>
                  <li>Или используйте команду: <code className="bg-white px-2 py-1 rounded border border-[#E2E8F0]">npm run create-admin email@example.com "Пароль" "Имя"</code></li>
                  <li>Участники могут зарегистрироваться самостоятельно на странице регистрации</li>
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Всего пользователей</h3>
              <p className="text-3xl font-bold text-[#0F172A]">{stats.totalUsers}</p>
            </div>

            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Всего команд</h3>
              <p className="text-3xl font-bold text-[#0F172A]">{stats.totalTeams}</p>
            </div>

            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Всего оценок</h3>
              <p className="text-3xl font-bold text-[#0F172A]">{stats.totalResults}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Пользователи по ролям</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#71717B]">Участники</span>
                  <span className="text-lg font-semibold text-black">{stats.usersByRole.participant || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#71717B]">Судьи</span>
                  <span className="text-lg font-semibold text-black">{stats.usersByRole.organizer || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#71717B]">Администраторы</span>
                  <span className="text-lg font-semibold text-black">{stats.usersByRole.admin || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Пользователи по статусам</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#71717B]">Подтверждены</span>
                  <span className="text-lg font-semibold text-black">{stats.usersByStatus?.confirmed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#71717B]">На проверке</span>
                  <span className="text-lg font-semibold text-black">{stats.usersByStatus?.pending || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Команды по статусам</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#71717B]">Подтверждены</span>
                  <span className="text-lg font-semibold text-black">{stats.teamsByStatus.confirmed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#71717B]">На проверке</span>
                  <span className="text-lg font-semibold text-black">{stats.teamsByStatus.pending || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Средняя оценка команд</h3>
              <p className="text-3xl font-bold text-black">{stats.avgTeamScore || '0.00'}</p>
              <p className="text-sm text-[#71717B] mt-2">
                {stats.totalTeams > 0 ? `На основе ${stats.totalTeams} команд` : 'Нет данных'}
              </p>
            </div>

            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Команды по категориям</h3>
              <div className="space-y-3">
                {Object.keys(stats.teamsByCategory || {}).length > 0 ? (
                  Object.entries(stats.teamsByCategory || {}).map(([category, count]: [string, any]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-[#71717B]">{category}</span>
                      <span className="text-lg font-semibold text-black">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#71717B]">Нет данных</p>
                )}
              </div>
            </div>
          </div>

          {stats.topTeams && stats.topTeams.length > 0 && (
            <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Топ-5 команд по оценкам</h3>
              <div className="space-y-3">
                {stats.topTeams.map((team: any, index: number) => (
                  <div key={team.id} className="flex justify-between items-center py-2 border-b border-[#E9EEF4] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#71717B] w-6">{index + 1}.</span>
                      <div>
                        <p className="text-sm font-semibold text-black">{team.name}</p>
                        <p className="text-xs text-[#71717B]">{team.category}</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-black">
                      {parseFloat(team.avgScore || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
