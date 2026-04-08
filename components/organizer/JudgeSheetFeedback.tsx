'use client'

import React, { useEffect, useRef } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export function JudgeSheetToast({
  message,
  variant,
  onClose,
}: {
  message: string
  variant: ToastVariant
  onClose: () => void
}) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const t = window.setTimeout(() => closeRef.current(), 4200)
    return () => window.clearTimeout(t)
  }, [message, variant])

  const palette =
    variant === 'success'
      ? {
          wrap: 'border-emerald-200/80 bg-emerald-50/95 text-emerald-950 shadow-emerald-900/10',
          icon: 'text-emerald-600',
        }
      : variant === 'error'
        ? {
            wrap: 'border-red-200/80 bg-red-50/95 text-red-950 shadow-red-900/10',
            icon: 'text-red-600',
          }
        : {
            wrap: 'border-slate-200/80 bg-white text-slate-900 shadow-slate-900/10',
            icon: 'text-slate-600',
          }

  return (
    <div
      role="status"
      className={`pointer-events-auto fixed bottom-6 right-6 z-[200] flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 ${palette.wrap}`}
    >
      {variant === 'success' ? (
        <svg className={`mt-0.5 h-5 w-5 shrink-0 ${palette.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : variant === 'error' ? (
        <svg className={`mt-0.5 h-5 w-5 shrink-0 ${palette.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg className={`mt-0.5 h-5 w-5 shrink-0 ${palette.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="-m-1 ml-1 shrink-0 rounded-lg p-1 text-current/50 transition hover:bg-black/5 hover:text-current"
        aria-label="Закрыть"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function JudgeSheetConfirm({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[190] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onCancel} aria-label="Закрыть" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="judge-sheet-confirm-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#E9EEF4] bg-white p-6 shadow-xl"
      >
        <h2 id="judge-sheet-confirm-title" className="text-lg font-semibold text-black">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#71717B]">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#E9EEF4] bg-[#F8FAFC] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#F1F5F9]"
          >
            {cancelLabel ?? 'Отмена'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0F172A] hover:bg-[#1e293b]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
