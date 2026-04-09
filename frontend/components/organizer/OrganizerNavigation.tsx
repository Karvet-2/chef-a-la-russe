'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: '/organizer', label: 'Обзор', icon: '/icons/trophy-icon.png' },
  { href: '/organizer/participants', label: 'Участники / Судьи', icon: '/icons/participant-judge-icon.png' },
  { href: '/organizer/teams', label: 'Команды', icon: '/icons/group-icon.png' },
  { href: '/organizer/results', label: 'Результаты', icon: '/icons/task-list-icon.png' },
]

interface OrganizerNavigationProps {
  isMobile?: boolean
  onNavigate?: () => void
}

export default function OrganizerNavigation({ isMobile = false, onNavigate }: OrganizerNavigationProps) {
  const pathname = usePathname()

  const handleClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  if (isMobile) {
    return (
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/organizer' && pathname.startsWith(item.href + '/')) ||
            (item.href === '/organizer' && pathname === '/organizer')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-[20px] transition-colors min-h-[44px] touch-manipulation ${
                isActive
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F1F5F9] text-black'
              }`}
            >
            <img
              src={item.icon}
              alt={item.label}
              width={16}
              height={16}
              className={`block w-4 h-4 flex-shrink-0 brightness-0 ${isActive ? 'invert' : ''}`}
              style={{ 
                display: 'block',
                opacity: 1,
                width: '16px',
                height: '16px',
                visibility: 'visible',
                objectFit: 'contain'
              }}
              loading="eager"
            />
              <span className="text-sm font-semibold leading-tight break-words">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="flex flex-wrap gap-1.5 sm:gap-2 items-center min-w-0">
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/organizer' && pathname.startsWith(item.href + '/')) ||
          (item.href === '/organizer' && pathname === '/organizer')
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-[20px] transition-colors whitespace-nowrap group ${
              isActive
                ? 'bg-[#0F172A] text-white'
                : 'bg-[#F1F5F9] text-black hover:bg-[#0F172A] hover:text-white'
            }`}
          >
            <img
              src={item.icon}
              alt={item.label}
              width={16}
              height={16}
              className={`block w-4 h-4 flex-shrink-0 brightness-0 transition-all ${isActive ? 'invert' : 'group-hover:invert'}`}
              style={{ 
                display: 'block',
                opacity: 1,
                width: '16px',
                height: '16px',
                visibility: 'visible',
                objectFit: 'contain'
              }}
              loading="eager"
            />
            <span className="text-xs xl:text-sm font-semibold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
