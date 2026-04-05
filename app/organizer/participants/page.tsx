'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import OrganizerHeader from '@/components/organizer/OrganizerHeader'
import { useAuth } from '@/contexts/AuthContext'
import { api, User } from '@/lib/api'

interface ParticipantWithDocs extends User {
  documents?: { id: string; name: string; status: string }[]
  uploads?: { id: string; dishNumber: number; fileType: string; status: string }[]
}

export default function OrganizerParticipantsPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()
  const [participants, setParticipants] = useState<ParticipantWithDocs[]>([])
  const [judges, setJudges] = useState<User[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role !== 'organizer') {
        router.push('/')
      } else {
        loadData()
      }
    }
  }, [loading, isAuthenticated, user, router])

  const loadData = async () => {
    try {
      const [participantsData, judgesData] = await Promise.all([
        api.getOrganizerParticipants(),
        api.getOrganizerJudges(),
      ])
      setParticipants(participantsData)
      setJudges(judgesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleConfirm = async (userId: string) => {
    try {
      await api.updateParticipantStatus(userId, 'confirmed')
      loadData()
    } catch (error: any) {
      alert(error.message || 'Ошибка подтверждения участника')
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const currentUser = participants.find(p => p.id === userId)
      if (currentUser?.status === 'confirmed') {
        alert('Нельзя отклонить подтвержденного участника')
        return
      }
      const newStatus = currentUser?.status === 'rejected' ? 'pending' : 'rejected'
      await api.updateParticipantStatus(userId, newStatus)
      loadData()
    } catch (error: any) {
      alert(error.message || 'Ошибка отклонения участника')
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'Подтвержден'
      case 'rejected':
        return 'Отклонено'
      default:
        return 'Ожидает'
    }
  }

  const getStatusStyles = (status?: string) => {
    if (status === 'pending' || !status) {
      return {
        bg: 'bg-[#F1F5F9]',
        text: 'text-black',
      }
    }
    return {
      bg: 'bg-[#0F172A]',
      text: 'text-white',
    }
  }

  const hasTechCard = (p: ParticipantWithDocs) =>
    (p.uploads || []).some((u) => u.fileType === 'techCard')
  const hasPhoto = (p: ParticipantWithDocs) =>
    (p.uploads || []).some((u) => u.fileType === 'photo')
  const hasDocuments = (p: ParticipantWithDocs) =>
    (p.documents || []).length > 0
  
  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    )
  }
  
  if (!isAuthenticated || user?.role !== 'organizer') {
    return null
  }

  return (
    <div className="min-h-screen">
      <OrganizerHeader />
      
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-[110px] py-6 sm:py-8 md:py-10">
        <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
            <div className="flex-1">
              <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6 sm:p-7 md:p-8 h-full">
                <h2 className="text-lg sm:text-xl md:text-[18px] font-semibold text-black mb-4 sm:mb-6">
                  Участники
                </h2>
                
                {participants.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#71717B]">Участники не найдены</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participants.map((participant) => {
                      const statusStyles = getStatusStyles(participant.status)
                      return (
                        <div
                          key={participant.id}
                          className="bg-white rounded-2xl border border-[#E9EEF4] p-5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-[16px] font-semibold text-black mb-0.5">
                                {participant.fio}
                              </h3>
                              <p className="text-[13px] text-[#71717B]">Участник</p>
                            </div>
                            <span className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold ${statusStyles.bg} ${statusStyles.text}`}>
                              {getStatusText(participant.status)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {hasTechCard(participant) && (
                              <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-emerald-100 text-emerald-800">
                                ТК
                              </span>
                            )}
                            {hasPhoto(participant) && (
                              <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-emerald-100 text-emerald-800">
                                Фото
                              </span>
                            )}
                            {hasDocuments(participant) && (
                              <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-emerald-100 text-emerald-800">
                                Документы
                              </span>
                            )}
                          </div>
                          {participant.status !== 'confirmed' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleConfirm(participant.id)}
                                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors bg-[#0F172A] text-white hover:bg-[#1e293b]"
                              >
                                <img
                                  src="/icons/checkmark-icon.png"
                                  alt=""
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 invert"
                                />
                                Подтвердить
                              </button>
                              <button
                                onClick={() => handleReject(participant.id)}
                                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-colors border border-[#E9EEF4] ${
                                  participant.status === 'rejected'
                                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                                    : 'bg-white text-black hover:bg-[#F1F5F9]'
                                }`}
                              >
                                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Отклонить
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6 sm:p-7 md:p-8 h-full">
              <h2 className="text-lg sm:text-xl md:text-[18px] font-semibold text-black mb-4 sm:mb-6">
                Судьи
              </h2>
              
              {judges.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#71717B]">Судьи не найдены</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {judges.map((judge, index) => (
                    <div
                      key={judge.id}
                      className="bg-white rounded-2xl border border-[#E9EEF4] p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[16px] font-semibold text-black mb-0.5">
                            Судья #{index + 1}
                          </h3>
                          <p className="text-[13px] text-[#71717B]">Судья</p>
                        </div>
                          <span className="shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold bg-[#0F172A] text-white">
                            {judge.status === 'confirmed' ? 'Активен' : 'Неактивен'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
