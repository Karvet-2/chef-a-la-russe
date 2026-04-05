'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { api, Document } from '@/lib/api'
import { getToken } from '@/lib/api'

export default function DocumentsPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        loadDocuments()
      }
    }
  }, [loading, isAuthenticated, router])

  const loadDocuments = async () => {
    try {
      const docs = await api.getDocuments()
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
      setDocuments([])
    } finally {
      setDataLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await api.uploadDocument(file)
      await loadDocuments()
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка загрузки документа')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить документ "${docName}"?`)) {
      return
    }

    try {
      await api.deleteDocument(docId)
      await loadDocuments()
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления документа')
    }
  }

  const handleDownload = async (doc: Document) => {
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

  const handleView = async (doc: Document) => {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-[110px] py-6 sm:py-8 md:py-10">
        <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-5 md:mb-6">
            <div>
              <p className="text-xs sm:text-[13.47px] font-medium text-[#71717B] mb-2">
                Материалы
              </p>
              <h1 className="text-lg sm:text-xl md:text-[23.33px] font-semibold text-black">
                Управление документами
              </h1>
            </div>
            <Link href="/uploads">
              <Button variant="secondary" className="flex items-center gap-2 w-full sm:w-auto">
                <span>Назад</span>
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-[26px] shadow-[0px_4px_17.8px_rgba(0,0,0,0.25)] p-6 sm:p-7 md:p-8 w-full flex flex-col">
            <div className="mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-sm sm:text-base md:text-[15.19px] font-semibold text-black">
                Мои документы
              </h2>
              <p className="text-xs sm:text-sm text-[#71717B] mt-1">
                Паспорт, личная медицинская книжка, согласия, допуски и справки
              </p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5 md:mb-6 flex-1">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[#71717B]">Документы не загружены</p>
                  <p className="text-xs text-[#71717B] mt-2">Загрузите первый документ, используя кнопку ниже</p>
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
                            {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                          </p>
                          <div className={`rounded-[12.5px] px-2 sm:px-3 py-1.5 sm:py-2 inline-block ${getStatusColor(doc.status)}`}>
                            <span className="text-[10px] sm:text-[11.78px] font-medium">
                              {getStatusText(doc.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {canPreview(doc.name) && (
                          <button
                            onClick={() => handleView(doc)}
                            className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 group"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Просмотр</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(doc)}
                          className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 group"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Скачать</span>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.name)}
                          className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black px-3 py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 group"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Удалить</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-[#F1F5F9] text-black hover:bg-[#0F172A] hover:text-white rounded-[7px] p-3 sm:p-4 flex items-center justify-center gap-2 sm:gap-3 cursor-pointer transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="/icons/upload-icon.png"
                alt="Upload"
                width={19}
                height={19}
                className="brightness-0 w-4 h-4 sm:w-[19px] sm:h-[19px] group-hover:invert transition-all"
              />
              <span className="text-xs sm:text-sm md:text-[13.67px] font-semibold">
                {uploading ? 'Загрузка...' : 'Загрузить документ'}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
