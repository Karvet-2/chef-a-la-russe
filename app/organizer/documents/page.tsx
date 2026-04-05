'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import OrganizerHeader from '@/components/organizer/OrganizerHeader'
import { useAuth } from '@/contexts/AuthContext'
import { api, User, UploadWithUser } from '@/lib/api'
import { getToken } from '@/lib/api'
import AdminHeader from '@/components/admin/AdminHeader'

interface DocumentWithUser {
  id: string
  name: string
  fileName: string
  fileSize: number
  status: string
  createdAt: string
  user: {
    id: string
    fio: string
    email: string
  }
}

export default function DocumentsViewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const { isAuthenticated, loading, user } = useAuth()
  const [documents, setDocuments] = useState<DocumentWithUser[]>([])
  const [participants, setParticipants] = useState<User[]>([])
  const [uploads, setUploads] = useState<UploadWithUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId)
  const [dataLoading, setDataLoading] = useState(true)
  const [batchDownloadingUploads, setBatchDownloadingUploads] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (!['organizer', 'admin'].includes(user?.role || '')) {
        router.push('/')
      } else {
        loadData()
      }
    }
  }, [loading, isAuthenticated, user, router])

  useEffect(() => {
    if (selectedUserId) {
      loadDocuments(selectedUserId)
      loadUploads(selectedUserId)
    } else {
      loadDocuments()
      setUploads([])
    }
  }, [selectedUserId])

  const loadData = async () => {
    try {
      const [participantsData, docs] = await Promise.all([
        api.getOrganizerParticipants().catch(() => []),
        selectedUserId 
          ? api.getParticipantDocuments(selectedUserId).catch(() => [])
          : api.getParticipantDocuments().catch(() => [])
      ])
      setParticipants(participantsData)
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const loadUploads = async (userId: string) => {
    try {
      const items = await api.getOrganizerUploads(userId)
      setUploads(items)
    } catch (error) {
      console.error('Error loading uploads:', error)
      setUploads([])
    }
  }

  const loadDocuments = async (userId?: string) => {
    try {
      const docs = await api.getParticipantDocuments(userId || undefined)
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
      setDocuments([])
    }
  }

  const handleUpdateStatus = async (docId: string, status: 'confirmed' | 'rejected' | 'pending') => {
    try {
      await api.updateDocumentStatus(docId, status)
      await loadDocuments(selectedUserId || undefined)
    } catch (error: any) {
      alert(error.message || 'Ошибка обновления статуса документа')
    }
  }

  const handleConfirm = async (docId: string) => {
    try {
      await api.updateDocumentStatus(docId, 'confirmed')
      await loadDocuments(selectedUserId || undefined)
    } catch (error: any) {
      alert(error.message || 'Ошибка подтверждения документа')
    }
  }

  const handleReject = async (docId: string) => {
    try {
      const doc = documents.find(d => d.id === docId)
      if (doc?.status === 'confirmed') {
        alert('Нельзя отклонить подтвержденный документ')
        return
      }
      const newStatus = doc?.status === 'rejected' ? 'pending' : 'rejected'
      await api.updateDocumentStatus(docId, newStatus)
      await loadDocuments(selectedUserId || undefined)
    } catch (error: any) {
      alert(error.message || 'Ошибка отклонения документа')
    }
  }

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить документ "${docName}"?`)) {
      return
    }

    try {
      await api.deleteDocument(docId)
      await loadDocuments(selectedUserId || undefined)
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления документа')
    }
  }

  const handleBatchDownloadUploads = async () => {
    if (!selectedUserId || uploads.length === 0) {
      alert('Нет файлов для скачивания')
      return
    }
    setBatchDownloadingUploads(true)
    try {
      const token = getToken()
      for (let i = 0; i < uploads.length; i++) {
        const u = uploads[i]
        const response = await fetch(`/api/uploads/${u.id}/download`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) continue
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const typeLabel = u.fileType === 'menu' ? 'Меню' : u.fileType === 'techCard' ? 'ТК' : 'Фото'
        a.download = `${u.user.fio}_${typeLabel}${u.fileType === 'menu' ? '' : `_блюдо${u.dishNumber}`}_${u.fileName}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        if (i < uploads.length - 1) await new Promise(r => setTimeout(r, 400))
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка скачивания файлов')
    } finally {
      setBatchDownloadingUploads(false)
    }
  }

  const handleDownloadUpload = async (u: UploadWithUser) => {
    try {
      const token = getToken()
      const response = await fetch(`/api/uploads/${u.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = u.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      alert(error.message || 'Ошибка скачивания файла')
    }
  }

  const handleViewUpload = async (u: UploadWithUser) => {
    try {
      const token = getToken()
      const response = await fetch(`/api/uploads/${u.id}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error: any) {
      alert(error.message || 'Ошибка просмотра файла')
    }
  }

  const canPreviewUpload = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext || '')
  }


  const handleDownload = async (doc: DocumentWithUser) => {
    try {
      const token = getToken()
      const response = await fetch(`/api/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки документа')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      alert(error.message || 'Ошибка скачивания документа')
    }
  }

  const handleView = async (doc: DocumentWithUser) => {
    try {
      const token = getToken()
      const response = await fetch(`/api/documents/${doc.id}/view`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки документа')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error: any) {
      alert(error.message || 'Ошибка просмотра документа')
    }
  }

  const canPreview = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext || '')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' Б'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ'
    return (bytes / (1024 * 1024)).toFixed(1) + ' МБ'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#0F172A] text-white'
      case 'rejected':
        return 'bg-[#71717B] text-white'
      default:
        return 'bg-[#E2E8F0] text-[#0F172A]'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Подтверждён'
      case 'rejected':
        return 'Отклонён'
      default:
        return 'На проверке'
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!isAuthenticated || !['organizer', 'admin'].includes(user?.role || '')) {
    return null
  }

  const HeaderComponent = user?.role === 'admin' ? AdminHeader : OrganizerHeader

  return (
    <div className="min-h-screen">
      <HeaderComponent />
      
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-[110px] py-6 sm:py-8 md:py-10">
        <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 lg:p-10">
          <div className="mb-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-black mb-2">
              Документы участников
            </h1>
            <p className="text-sm text-[#71717B]">
              Просмотр и управление документами участников
            </p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-black mb-2">
                Фильтр по участнику
              </label>
              <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
            >
              <option value="">Все участники</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fio} ({p.email})
                </option>
              ))}
            </select>
            </div>
          </div>

          {selectedUserId && (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-black">Загрузки блюд (Фото/ТК)</h2>
                  <p className="text-sm text-[#71717B]">Файлы, загруженные участником в разделе «Загрузки»</p>
                </div>
                {uploads.length > 0 && (
                  <button
                    onClick={handleBatchDownloadUploads}
                    disabled={batchDownloadingUploads}
                    className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white disabled:opacity-50 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shrink-0"
                  >
                    {batchDownloadingUploads ? 'Скачивание...' : 'Скачать все файлы'}
                  </button>
                )}
              </div>

              {uploads.length === 0 ? (
                <div className="text-center py-8 border border-[#E9EEF4] rounded-[16px]">
                  <p className="text-sm text-[#71717B]">Файлы не найдены</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploads.map((u) => (
                    <div
                      key={u.id}
                      className="border border-[#E9EEF4] rounded-[16px] p-4 sm:p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-black truncate">
                            {u.fileType === 'menu' ? 'Меню' : u.fileType === 'techCard' ? 'ТК' : 'Фото'}
                            {u.fileType === 'menu' ? '' : ` • Блюдо ${u.dishNumber}`}
                          </p>
                          <p className="text-xs text-[#71717B] mt-1 truncate">
                            {u.fileName}
                          </p>
                          <p className="text-xs text-[#71717B] mt-1">
                            {formatFileSize(u.fileSize)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {canPreviewUpload(u.fileName) && (
                            <button
                              onClick={() => handleViewUpload(u)}
                              className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black px-3 py-2 rounded-md text-xs font-semibold transition-colors"
                            >
                              Просмотр
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadUpload(u)}
                            className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black px-3 py-2 rounded-md text-xs font-semibold transition-colors"
                          >
                            Скачать
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-[#71717B]">Документы не найдены</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-[#E9EEF4] rounded-[16.36px] p-4 sm:p-5 md:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1">
                      <div className="w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] bg-[#F1F5F9] rounded flex items-center justify-center flex-shrink-0">
                        <img
                          src="/icons/upload-icon.png"
                          alt="Document"
                          width={20}
                          height={20}
                          className="w-4 h-4 sm:w-5 sm:h-5 brightness-0"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base md:text-[15.36px] font-medium text-black mb-1 truncate">
                          {doc.name}
                        </p>
                        <p className="text-xs sm:text-sm md:text-[13.09px] font-medium text-[#71717B] mb-2">
                          Участник: <span className="font-semibold">{doc.user.fio}</span> ({doc.user.email})
                        </p>
                        <p className="text-xs sm:text-sm md:text-[13.09px] font-medium text-[#71717B] mb-2">
                          {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                        </p>
                        <div className={`rounded-[12.5px] px-2 sm:px-3 py-1.5 sm:py-2 inline-block ${getStatusColor(doc.status)}`}>
                          <span className="text-[10px] sm:text-[11.78px] font-medium">
                            {getStatusText(doc.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto sm:min-w-[450px]">
                      <div className="grid grid-cols-3 gap-2">
                        {canPreview(doc.name) ? (
                          <button
                            onClick={() => handleView(doc)}
                            className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black h-10 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Просмотр</span>
                          </button>
                        ) : (
                          <div />
                        )}
                        <button
                          onClick={() => handleDownload(doc)}
                          className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black h-10 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Скачать</span>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.name)}
                          className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black h-10 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Удалить</span>
                        </button>

                        {doc.status !== 'confirmed' ? (
                          <button
                            onClick={() => handleConfirm(doc.id)}
                            className="bg-[#0F172A] hover:bg-[#1e293b] text-white h-10 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Подтвердить</span>
                          </button>
                        ) : (
                          <div />
                        )}

                        {doc.status !== 'confirmed' && doc.status !== 'rejected' ? (
                          <button
                            onClick={() => handleReject(doc.id)}
                            className="bg-[#71717B] hover:bg-[#52525b] text-white h-10 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Отклонить</span>
                          </button>
                        ) : doc.status === 'rejected' ? (
                          <button
                            onClick={() => handleUpdateStatus(doc.id, 'pending')}
                            className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black h-10 px-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center"
                          >
                            <span>Сбросить</span>
                          </button>
                        ) : (
                          <div />
                        )}
                        <div />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
