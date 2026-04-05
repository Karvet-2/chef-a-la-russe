'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { api, User, Document, Result } from '@/lib/api'
import { getToken } from '@/lib/api'

interface TeamData {
  id: string
  name: string
  category: string
  status: string
  members: Array<{
    id: string
    user: User
    status: string
  }>
  results: Result[]
}

export default function AdminTeamDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = params.id as string
  const { isAuthenticated, loading, user } = useAuth()
  const [team, setTeam] = useState<TeamData | null>(null)
  const [teamDocuments, setTeamDocuments] = useState<Array<Document & { user: User }>>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'members' | 'scores' | 'documents'>('members')
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role !== 'admin') {
        router.push('/')
      } else if (teamId) {
        loadTeamData()
      }
    }
  }, [loading, isAuthenticated, user, router, teamId])

  const loadTeamData = async () => {
    try {
      const teamData = await api.getOrganizerTeam(teamId)
      setTeam(teamData)
      
      const memberIds = teamData.members.map(m => m.user.id)
      const allDocumentsPromises = memberIds.map(memberId => 
        api.getParticipantDocuments(memberId).catch(() => [])
      )
      const allDocumentsArrays = await Promise.all(allDocumentsPromises)
      const allDocuments = allDocumentsArrays.flat()
      
      const filteredDocuments = allDocuments.filter((doc: any) => 
        memberIds.includes(doc.user?.id)
      )
      
      setTeamDocuments(filteredDocuments)
    } catch (error) {
      console.error('Error loading team data:', error)
      setTeam(null)
      setTeamDocuments([])
    } finally {
      setDataLoading(false)
    }
  }

  const getTeamAverageScore = () => {
    if (!team || !team.results || team.results.length === 0) return 0
    const total = team.results.reduce((sum, r) => sum + (r.total || 0), 0)
    return total / team.results.length
  }

  const getTotalScore = () => {
    if (!team || !team.results) return 0
    return team.results.reduce((sum, r) => sum + (r.total || 0), 0)
  }

  const handleDownload = async (documentId: string) => {
    try {
      const token = getToken()
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'document'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      alert(error.message || 'Ошибка скачивания документа')
    }
  }

  const handleView = async (documentId: string) => {
    try {
      const token = getToken()
      const response = await fetch(`/api/documents/${documentId}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!response.ok) throw new Error('View failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error: any) {
      alert(error.message || 'Ошибка открытия документа')
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    )
  }
  
  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-white">
        <AdminHeader />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-[110px] py-6 sm:py-8 md:py-10">
          <div className="text-center py-12">
            <p className="text-[#71717B]">Команда не найдена</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-[110px] py-6 sm:py-8 md:py-10">
        <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 lg:p-10 mx-auto max-w-[1220px]">
          <div className="mb-6">
            <Link
              href="/admin/teams"
              className="text-[#71717B] text-sm hover:text-black mb-4 inline-block"
            >
              ← Назад к командам
            </Link>
            <h1 className="text-[23px] font-semibold text-black mb-2">
              {team.name}
            </h1>
            <p className="text-[#71717B] text-sm mb-4">
              {team.category}
            </p>
            <div className="flex gap-4 text-sm">
              <span className="text-[#71717B]">
                Участников: {team.members?.length || 0}
              </span>
              <span className="text-[#71717B]">
                Средний балл: {getTeamAverageScore().toFixed(2)}
              </span>
              <span className="text-[#71717B]">
                Общий балл: {getTotalScore().toFixed(2)}
              </span>
            </div>
          </div>

          <div className="border-b border-[#E9EEF4] mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('members')}
                className={`pb-3 px-2 text-sm font-semibold transition-colors ${
                  activeTab === 'members'
                    ? 'text-black border-b-2 border-black'
                    : 'text-[#71717B] hover:text-black'
                }`}
              >
                Состав команды
              </button>
              <button
                onClick={() => setActiveTab('scores')}
                className={`pb-3 px-2 text-sm font-semibold transition-colors ${
                  activeTab === 'scores'
                    ? 'text-black border-b-2 border-black'
                    : 'text-[#71717B] hover:text-black'
                }`}
              >
                Баллы команды
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`pb-3 px-2 text-sm font-semibold transition-colors ${
                  activeTab === 'documents'
                    ? 'text-black border-b-2 border-black'
                    : 'text-[#71717B] hover:text-black'
                }`}
              >
                Документы команды
              </button>
            </div>
          </div>

          {activeTab === 'members' && (
            <div className="space-y-4">
              {team.members && team.members.length > 0 ? (
                team.members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[16px] font-semibold text-black mb-1">
                          {member.user.fio}
                        </h3>
                        <p className="text-[13px] font-medium text-[#71717B]">
                          {member.user.email}
                        </p>
                        {member.user.phone && (
                          <p className="text-[13px] font-medium text-[#71717B]">
                            Телефон: {member.user.phone}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        member.user.status === 'confirmed'
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-[#71717B] text-white'
                      }`}>
                        {member.user.status === 'confirmed' ? 'Подтвержден' : 'На проверке'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-[#71717B]">В команде пока нет участников</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scores' && (
            <div className="space-y-4">
              {team.results && team.results.length > 0 ? (
                <div>
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-[#71717B]">Общий балл:</span>
                        <span className="ml-2 font-semibold text-black">{getTotalScore().toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[#71717B]">Средний балл:</span>
                        <span className="ml-2 font-semibold text-black">{getTeamAverageScore().toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[#71717B]">Всего оценок:</span>
                        <span className="ml-2 font-semibold text-black">{team.results.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {team.results.map((result, index) => (
                      <div
                        key={result.id || index}
                        className="bg-white rounded-lg border border-[#E9EEF4] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-black">
                              Блюдо {result.dishNumber}
                            </p>
                            <p className="text-xs text-[#71717B] mt-1">
                              Вкус: {result.taste} | Презентация: {result.presentation} | 
                              Навыки: {result.workSkills} | Гигиена: {result.hygiene} | 
                              Организация: {result.miseEnPlace}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-black">
                              {result.total?.toFixed(2) || '0.00'}
                            </p>
                            {result.penalties > 0 && (
                              <p className="text-xs text-red-600 mt-1">
                                Штрафы: -{result.penalties}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[#71717B]">Пока нет оценок для этой команды</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              {teamDocuments.length > 0 ? (
                teamDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-[16px] font-semibold text-black mb-1">
                          {doc.name}
                        </h3>
                        <p className="text-[13px] font-medium text-[#71717B] mb-2">
                          Участник: {(doc as any).user?.fio || 'Неизвестно'}
                        </p>
                        <p className="text-xs text-[#71717B]">
                          Размер: {(doc.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          doc.status === 'confirmed'
                            ? 'bg-[#0F172A] text-white'
                            : doc.status === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-[#71717B] text-white'
                        }`}>
                          {doc.status === 'confirmed' ? 'Подтвержден' : 
                           doc.status === 'rejected' ? 'Отклонен' : 'На проверке'}
                        </span>
                        <button
                          onClick={() => handleView(doc.id)}
                          className="px-3 py-1 bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black rounded text-xs font-semibold transition-colors"
                        >
                          Просмотр
                        </button>
                        <button
                          onClick={() => handleDownload(doc.id)}
                          className="px-3 py-1 bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black rounded text-xs font-semibold transition-colors"
                        >
                          Скачать
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-[#71717B]">Документы участников команды не найдены</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
