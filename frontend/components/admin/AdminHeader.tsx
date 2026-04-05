'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavigation from './AdminNavigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  
  return (
    <header className="w-full bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-[134px] py-4 sm:py-6 md:py-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden lg:flex items-center">
              <AdminNavigation />
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 ml-auto">
            <div className="bg-white rounded-[23px] shadow-md px-3 xl:px-6 py-2 xl:py-3 flex items-center gap-2 xl:gap-4">
              <img
                src="/icons/user-icon.png"
                alt="Admin"
                width={17}
                height={17}
                className="block w-4 h-4 xl:w-[17px] xl:h-[17px]"
                style={{ display: 'block' }}
              />
              <div className="flex flex-col">
                <span className="text-xs xl:text-[15.8px] font-semibold text-black">
                  {user?.fio || 'Администратор'}
                </span>
                <span className="text-[10px] xl:text-[11.49px] font-medium text-[#71717B]">
                  Админ
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-[#F1F5F9] rounded-[27px] shadow-md px-3 xl:px-6 py-2 xl:py-3 text-xs xl:text-[14.95px] font-semibold text-black hover:bg-[#0F172A] hover:text-white transition-colors"
            >
              Выйти
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <AdminNavigation isMobile={true} onNavigate={() => setIsMobileMenuOpen(false)} />
            
            <div className="mt-4 space-y-3">
              <div className="bg-white rounded-[23px] shadow-md px-4 py-3 flex items-center gap-3">
                <img
                  src="/icons/user-icon.png"
                  alt="Admin"
                  width={17}
                  height={17}
                  className="block w-4 h-4"
                  style={{ display: 'block' }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-black">
                    {user?.fio || 'Администратор'}
                  </span>
                  <span className="text-xs font-medium text-[#71717B]">
                    Админ
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full bg-[#F1F5F9] rounded-[27px] shadow-md px-4 py-3 text-sm font-semibold text-black hover:bg-[#0F172A] hover:text-white transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
