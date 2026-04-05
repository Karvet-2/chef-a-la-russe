'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import OrganizerHeader from '@/components/organizer/OrganizerHeader'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { api, Result, User, ViolationPhoto, getToken } from '@/lib/api'

interface CriterionData {
  key: 'taste' | 'presentation' | 'workSkills' | 'hygiene' | 'miseEnPlace'
  title: string
  max: number
}

function PhotoImage({ photoId, photoUrls, setPhotoUrls }: { photoId: string, photoUrls: { [key: string]: string }, setPhotoUrls: (fn: (prev: { [key: string]: string }) => { [key: string]: string }) => void }) {
  const [imgSrc, setImgSrc] = useState<string | null>(photoUrls[photoId] || null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (photoUrls[photoId]) {
      setImgSrc(photoUrls[photoId])
      return
    }

    const loadPhoto = async () => {
      try {
        const token = getToken()
        const response = await fetch(`/api/organizer/violation-photos/view?id=${photoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setImgSrc(url)
          setPhotoUrls((prev: { [key: string]: string }) => ({ ...prev, [photoId]: url }))
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error loading photo:', err)
        setError(true)
      }
    }

    loadPhoto()
  }, [photoId])

  const handleClick = async () => {
    try {
      const token = getToken()
      const response = await fetch(`/api/organizer/violation-photos/view?id=${photoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    } catch (error) {
      alert('Ошибка открытия фото')
    }
  }

  if (error || !imgSrc) {
    return (
      <div className="w-32 h-32 rounded-lg border-2 border-[#E9EEF4] bg-gray-100 flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="w-32 h-32 rounded-lg border-2 border-[#E9EEF4] overflow-hidden bg-gray-100">
      <img
        src={imgSrc}
        alt="Violation"
        className="w-full h-full object-cover cursor-pointer"
        onClick={handleClick}
        onError={() => setError(true)}
      />
    </div>
  )
}


export default function JudgeDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = params.id as string
  const judgeId = params.judgeId as string
  
  const { isAuthenticated, loading, user } = useAuth()
  const [results, setResults] = useState<Result[]>([])
  const [team, setTeam] = useState<any>(null)
  const [judge, setJudge] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  
  const [formData, setFormData] = useState<{
    [criterion: string]: {
      [dishNumber: number]: number
    }
  }>({
    miseEnPlace: { 1: 0, 2: 0, 3: 0 },
    hygiene: { 1: 0, 2: 0, 3: 0 },
    workSkills: { 1: 0, 2: 0, 3: 0 },
    presentation: { 1: 0, 2: 0, 3: 0 },
    taste: { 1: 0, 2: 0, 3: 0 },
  })
  
  const [penalties, setPenalties] = useState<{ [dishNumber: number]: number }>({ 1: 0, 2: 0, 3: 0 })
  const [comments, setComments] = useState<{ [criterion: string]: string }>({})
  const [violationPhotos, setViolationPhotos] = useState<{ [key: string]: ViolationPhoto[] }>({})
  const [photoUrls, setPhotoUrls] = useState<{ [photoId: string]: string }>({})
  const [isFixed, setIsFixed] = useState(false)
  const [judgeIndex, setJudgeIndex] = useState(1)
  const [stage, setStage] = useState<'qualifier' | 'final'>('qualifier')
  const [dishCount, setDishCount] = useState(3)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role !== 'organizer') {
        router.push('/')
      } else if (teamId && judgeId) {
        loadData()
      }
    }
  }, [loading, isAuthenticated, user, router, teamId, judgeId])

  const loadData = async () => {
    try {
      const [teamData, judgesData, resultsData] = await Promise.all([
        api.getOrganizerTeam(teamId),
        api.getOrganizerJudges(),
        api.getJudgeResultsByStage(teamId, judgeId, 'qualifier'),
      ])
      
      setTeam(teamData)
      const teamStage: 'qualifier' | 'final' = teamData?.stage === 'final' ? 'final' : 'qualifier'
      setStage(teamStage)

      const foundJudge = judgesData.find((j: User) => j.id === judgeId)
      setJudge(foundJudge || null)
      const idx = judgesData.findIndex((j: User) => j.id === judgeId) + 1
      setJudgeIndex(idx > 0 ? idx : 1)
      const stageResults =
        teamStage === 'final'
          ? await api.getJudgeResultsByStage(teamId, judgeId, 'final')
          : resultsData
      setResults(stageResults)
      
      const dishCountVal =
        teamData?.championshipType === 'junior'
          ? 2
          : (teamData?.category && /юниор|junior/i.test(teamData.category) ? 2 : 3)
      setDishCount(dishCountVal)

      const initDishMap = (count: number) => {
        const map: { [dishNumber: number]: number } = {}
        for (let d = 1; d <= count; d++) map[d] = 0
        return map
      }

      const initialFormData: typeof formData = {
        miseEnPlace: initDishMap(dishCountVal),
        hygiene: initDishMap(dishCountVal),
        workSkills: initDishMap(dishCountVal),
        presentation: initDishMap(dishCountVal),
        taste: initDishMap(dishCountVal),
      }
      
      const initialPenalties: { [dishNumber: number]: number } = initDishMap(dishCountVal)
      
      const photosMap: { [key: string]: ViolationPhoto[] } = {}
      
      stageResults.forEach((result: Result) => {
        initialFormData.miseEnPlace[result.dishNumber] = result.miseEnPlace
        initialFormData.hygiene[result.dishNumber] = result.hygiene
        initialFormData.workSkills[result.dishNumber] = result.workSkills
        initialFormData.presentation[result.dishNumber] = result.presentation
        initialFormData.taste[result.dishNumber] = result.taste
        initialPenalties[result.dishNumber] = result.penalties || 0
        
        if (result.violationPhotos && result.violationPhotos.length > 0) {
          result.violationPhotos.forEach((photo: ViolationPhoto) => {
            const key = `${result.id}_${photo.criterionKey}`
            if (!photosMap[key]) {
              photosMap[key] = []
            }
            photosMap[key].push(photo)
          })
        }
      })
      
      setFormData(initialFormData)
      setPenalties(initialPenalties)
      setViolationPhotos(photosMap)
      
      const allResultsFixed = stageResults.length > 0 && stageResults.every((r: any) => r.status === 'fixed')
      setIsFixed(allResultsFixed)
      
      const urls: { [photoId: string]: string } = {}
      for (const key in photosMap) {
        for (const photo of photosMap[key]) {
          try {
            const token = getToken()
            const response = await fetch(`/api/organizer/violation-photos/view?id=${photo.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            })
            if (response.ok) {
              const blob = await response.blob()
              urls[photo.id] = URL.createObjectURL(blob)
            }
          } catch (error) {
            console.error('Error loading photo:', error)
          }
        }
      }
      setPhotoUrls(urls)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleSave = async () => {
    if (isFixed) {
      alert('Лист зафиксирован, редактирование невозможно')
      return
    }
    
    setSaving(true)
    try {
      for (const dishNumber of dishNumbers) {
        await api.saveJudgeResult(teamId, judgeId, {
          dishNumber,
          stage,
          taste: Number(formData.taste[dishNumber]) || 0,
          presentation: Number(formData.presentation[dishNumber]) || 0,
          workSkills: Number(formData.workSkills[dishNumber]) || 0,
          hygiene: Number(formData.hygiene[dishNumber]) || 0,
          miseEnPlace: Number(formData.miseEnPlace[dishNumber]) || 0,
          penalties: Number(penalties[dishNumber]) || 0,
        })
      }
      await loadData()
      alert('Оценки успешно сохранены')
    } catch (error: any) {
      console.error('Error saving results:', error)
      alert(error?.message || 'Ошибка сохранения. Проверьте введенные данные.')
    } finally {
      setSaving(false)
    }
  }

  const handleFixSheet = async () => {
    if (!confirm('Вы уверены, что хотите зафиксировать лист? После фиксации редактирование будет невозможно.')) {
      return
    }

    try {
      await api.fixResultSheet(teamId, judgeId, stage)
      setIsFixed(true)
      alert('Лист успешно зафиксирован')
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Ошибка фиксации листа')
    }
  }

  const handleUnfixSheet = async () => {
    if (!confirm('Вы уверены, что хотите разблокировать лист? После разблокировки редактирование станет возможным.')) {
      return
    }

    try {
      await api.unfixResultSheet(teamId, judgeId, stage)
      setIsFixed(false)
      alert('Лист успешно разблокирован')
      await loadData()
    } catch (error: any) {
      alert(error.message || 'Ошибка разблокировки листа')
    }
  }

  const criteria: CriterionData[] = [
    { key: 'miseEnPlace', title: 'Mise en place (организация рабочего места)', max: 5 },
    { key: 'hygiene', title: 'Hygiene & Food waste (гигиена и отходы)', max: 10 },
    { key: 'workSkills', title: 'Work skills/Techniques/Workflow/Innovation (проф. подготовка)', max: 20 },
    { key: 'presentation', title: 'Presentation (презентация)', max: 15 },
    { key: 'taste', title: 'Taste (вкус)', max: 50 },
  ]

  const dishNumbers = Array.from({ length: dishCount }, (_, i) => i + 1)

  const getCriterionTotal = (criterionKey: string) => {
    return dishNumbers.reduce((sum, d) => sum + (formData[criterionKey][d] || 0), 0)
  }

  const getCriterionMax = (criterionKey: string) => {
    const criterion = criteria.find(c => c.key === criterionKey)
    return criterion ? criterion.max * dishCount : 0
  }

  const getDishTotal = (dishNumber: number) => {
    return (
      formData.miseEnPlace[dishNumber] +
      formData.hygiene[dishNumber] +
      formData.workSkills[dishNumber] +
      formData.presentation[dishNumber] +
      formData.taste[dishNumber] -
      (penalties[dishNumber] || 0)
    )
  }

  const getOverallTotal = () => {
    return dishNumbers.reduce((sum, d) => sum + getDishTotal(d), 0)
  }

  const getOverallAverage = () => {
    const dishTotals = dishNumbers.map(d => getDishTotal(d))
    const dishesWithValuesCount = dishTotals.filter(d => d > 0).length || dishCount
    return dishTotals.reduce((sum, v) => sum + v, 0) / dishesWithValuesCount
  }

  const getProgressPercentage = (criterionKey: string) => {
    const total = getCriterionTotal(criterionKey)
    const max = getCriterionMax(criterionKey)
    return max > 0 ? (total / max) * 100 : 0
  }

  const handleFileUpload = async (criterionKey: string, file: File) => {
    if (isFixed) {
      alert('Лист зафиксирован, добавление фото невозможно')
      return
    }

    try {
      const dishNumber = 1
      const existingResult = results.find(r => r.dishNumber === dishNumber)
      
      if (!existingResult) {
        alert('Сначала сохраните оценки для хотя бы одного блюда')
        return
      }

      const photo = await api.uploadViolationPhoto(existingResult.id, criterionKey, file)
      
      const key = `${existingResult.id}_${criterionKey}`
      setViolationPhotos(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), photo]
      }))

      const token = getToken()
      const response = await fetch(`/api/organizer/violation-photos/view?id=${photo.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const blob = await response.blob()
        setPhotoUrls(prev => ({
          ...prev,
          [photo.id]: URL.createObjectURL(blob)
        }))
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка загрузки фото')
    }
  }

  const handleDeletePhoto = async (photoId: string, resultId: string, criterionKey: string) => {
    if (!confirm('Вы уверены, что хотите удалить это фото?')) {
      return
    }

    try {
      await api.deleteViolationPhoto(photoId)
      
      const key = `${resultId}_${criterionKey}`
      setViolationPhotos(prev => ({
        ...prev,
        [key]: (prev[key] || []).filter(p => p.id !== photoId)
      }))
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления фото')
    }
  }

  const getPhotosForCriterion = (criterionKey: string) => {
    const dishNumber = 1
    const result = results.find(r => r.dishNumber === dishNumber)
    if (!result) return []
    
    const key = `${result.id}_${criterionKey}`
    return violationPhotos[key] || []
  }

  const getResultIdForCriterion = (criterionKey: string) => {
    const dishNumber = 1
    const result = results.find(r => r.dishNumber === dishNumber)
    return result?.id || ''
  }

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
        <div className="bg-white rounded-[26px] shadow-[0px_4px_17.9px_rgba(0,0,0,0.19)] p-6 sm:p-7 md:p-8 lg:p-10 mx-auto max-w-[1220px]">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-[#71717B] text-sm mb-2">
                Команда
              </p>
              <h1 className="text-[23px] font-semibold text-black mb-2 underline decoration-[#0F172A] decoration-1">
                {team?.name || 'Неизвестно'}
              </h1>
              <p className="text-[#71717B] text-sm">
                Судья #{judgeIndex}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-[#0F172A] text-white px-6 py-3 rounded-[8px] text-right">
                <div className="text-[18px] font-semibold">
                  {getOverallAverage().toFixed(2)} / 100
                </div>
              </div>
              <Link
                href={`/organizer/teams/${teamId}`}
                className="bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black px-4 py-2 rounded-[8px] text-sm font-semibold transition-colors"
              >
                Назад
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-2 border-[#E9EEF4] rounded-[21px] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F1F5F9]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#71717B]">Критерий</th>
                    {dishNumbers.map(d => (
                      <th key={d} className="px-6 py-4 text-center text-sm font-semibold text-[#71717B] w-[180px]">
                        Блюдо {d}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#71717B] w-[120px]">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((criterion) => {
                    const total = getCriterionTotal(criterion.key)
                    const max = getCriterionMax(criterion.key)
                    const progress = getProgressPercentage(criterion.key)
                    
                    return (
                      <React.Fragment key={criterion.key}>
                        <tr>
                          <td className="px-6 py-4 border-b-0">
                            <div>
                              <h3 className="text-[16px] font-semibold text-black mb-1">
                                {criterion.title}
                              </h3>
                              <p className="text-xs text-[#71717B]">
                                max: {criterion.max} за блюдо
                              </p>
                            </div>
                          </td>
                          {dishNumbers.map((dishNumber) => (
                            <td key={dishNumber} className="px-6 py-4 text-center border-b-0">
                              <div className="flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max={criterion.max}
                                  value={formData[criterion.key][dishNumber] || 0}
                                  onChange={(e) => {
                                    if (isFixed) return
                                    const value = Math.max(0, Math.min(criterion.max, parseFloat(e.target.value) || 0))
                                    setFormData(prev => ({
                                      ...prev,
                                      [criterion.key]: {
                                        ...prev[criterion.key],
                                        [dishNumber]: value
                                      }
                                    }))
                                  }}
                                  disabled={isFixed}
                                  className="w-16 px-3 py-2 border border-[#E9EEF4] rounded-lg text-sm text-center disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                                />
                                <span className="text-sm text-[#71717B]">
                                  /{criterion.max}
                                </span>
                              </div>
                            </td>
                          ))}
                          <td className="px-6 py-4 text-center border-b-0">
                            <div className="text-[16px] font-semibold text-black">
                              {total} / {max}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={dishCount + 2} className="px-6 py-4 bg-white border-t-0">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-semibold text-black mb-2">
                                  Комментарий по критерию
                                </label>
                                <textarea
                                  value={comments[criterion.key] || ''}
                                  onChange={(e) => {
                                    if (isFixed) return
                                    setComments(prev => ({ ...prev, [criterion.key]: e.target.value }))
                                  }}
                                  placeholder="Введите комментарий (за что сняты баллы)"
                                  disabled={isFixed}
                                  className="w-full px-4 py-2 border border-[#E9EEF4] rounded-lg text-sm resize-none disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <label className={`flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black px-4 py-2 rounded-[6px] text-sm font-semibold transition-colors ${isFixed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={isFixed}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          handleFileUpload(criterion.key, file)
                                        }
                                        e.target.value = ''
                                      }}
                                    />
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Добавить фото нарушения
                                  </label>
                                  {getPhotosForCriterion(criterion.key).length > 0 && (
                                    <button className="bg-[#0F172A] text-white px-4 py-2 rounded-[6px] text-sm font-semibold">
                                      Фото: {getPhotosForCriterion(criterion.key).length}
                                    </button>
                                  )}
                                </div>
                                {getPhotosForCriterion(criterion.key).length > 0 && (
                                  <div className="mt-3">
                                    {getPhotosForCriterion(criterion.key).map((photo) => (
                                      <div key={photo.id} className="relative inline-block group">
                                        <PhotoImage photoId={photo.id} photoUrls={photoUrls} setPhotoUrls={setPhotoUrls} />
                                        {!isFixed && (
                                          <button
                                            onClick={() => handleDeletePhoto(photo.id, getResultIdForCriterion(criterion.key), criterion.key)}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md text-base font-semibold leading-none z-10"
                                            title="Удалить фото"
                                          >
                                            ×
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-[#0F172A] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-2 border-[#E9EEF4] rounded-[21px] p-6 bg-gray-50">
              <h3 className="text-[18px] font-semibold text-black mb-4">ИТОГО</h3>
              <div className="flex items-center justify-between">
                <div className="flex gap-6">
                    {dishNumbers.map((d) => (
                      <div key={d} className="text-sm font-semibold text-black">
                        Блюдо {d}: {getDishTotal(d)}/100
                      </div>
                    ))}
                </div>
                <div className="text-[18px] font-semibold text-black">
                    {getOverallTotal()}/{100 * dishCount}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4 justify-end">
            <button
              onClick={handleSave}
              disabled={saving || isFixed}
              className="flex items-center gap-2 bg-[#F1F5F9] hover:bg-[#0F172A] hover:text-white text-black px-6 py-3 rounded-[6px] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Сохранить
            </button>
            {isFixed ? (
              <button
                onClick={handleUnfixSheet}
                disabled={saving}
                className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white px-6 py-3 rounded-[6px] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Разблокировать лист
              </button>
            ) : (
              <button
                onClick={handleFixSheet}
                disabled={saving}
                className="flex items-center gap-2 bg-[#0F172A] text-white px-6 py-3 rounded-[6px] text-sm font-semibold hover:bg-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Зафиксировать лист
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
