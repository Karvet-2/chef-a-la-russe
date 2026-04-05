'use client'

import React, { useState, useRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  defaultValue?: string
}

export default function Input({
  label,
  error,
  className = '',
  value,
  onChange,
  onFocus,
  onBlur,
  defaultValue,
  type,
  ...props
}: InputProps) {
  const [isCleared, setIsCleared] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialValueRef = useRef(defaultValue || '')
  const isPassword = type === 'password'

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isCleared && value === initialValueRef.current && initialValueRef.current !== '') {
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: '' },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
      setIsCleared(true)
    }
    if (onFocus) {
      onFocus(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const isEmpty =
      !value ||
      (typeof value === 'string' && value.trim() === '')
    if (isCleared && isEmpty && initialValueRef.current !== '') {
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: initialValueRef.current },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
      setIsCleared(false)
    }
    if (onBlur) {
      onBlur(e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isCleared && e.target.value !== initialValueRef.current) {
      setIsCleared(true)
    }
    if (e.target.value !== '' && e.target.value !== initialValueRef.current) {
      setIsCleared(true)
    }
    if (onChange) {
      onChange(e)
    }
  }

  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm sm:text-[14.21px] font-semibold text-black">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          className={`w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-[#E2E8F0] rounded-md text-sm sm:text-[13.38px] font-medium text-black placeholder:text-[#64749A] focus:outline-none focus:ring-2 focus:ring-[#0F172A] ${isPassword ? 'pr-10' : ''} ${className}`}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          type={inputType}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64749A] hover:text-[#0F172A] transition-colors focus:outline-none"
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs sm:text-sm text-red-500">{error}</span>
      )}
    </div>
  )
}
