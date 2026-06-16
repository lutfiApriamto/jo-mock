import { Link } from 'react-router-dom'
import { FaBars, FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import useAuthStore from '@/stores/authStore'
import { getInitials } from '../utils'
import { useLogout } from '@/features/auth/hooks/useLogout'
import DigitalClock from '@/shared/components/DigitalClock'
import Breadcrumb from './Breadcrumb'

export default function Topbar({ onMenuOpen }) {
  const { theme, toggleTheme } = useTheme()
  const user   = useAuthStore(s => s.user)
  const logout = useLogout()
  const isDark = theme === 'dark'

  return (
    <header className="h-14 flex items-center justify-between
      px-4 sm:px-5 border-b border-border shrink-0 gap-4">

      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg
            text-muted-foreground hover:text-foreground hover:bg-bg-surface
            transition-all duration-150 shrink-0"
        >
          <FaBars size={14} />
        </button>
        <Breadcrumb />
      </div>

      {/* Right: clock | theme toggle | avatar | logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        <DigitalClock />

        <div className="hidden sm:block w-px h-4 bg-border/60 shrink-0" />

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full
            bg-bg-surface border border-border
            text-muted-foreground hover:text-foreground hover:border-brand-primary/40
            transition-all duration-150"
        >
          {isDark ? <FaSun size={13} /> : <FaMoon size={13} />}
        </button>

        {/* Avatar — navigate to Profile */}
        <Link
          to="/dashboard/profile"
          title={`Profile — ${user?.name ?? ''}`}
          className="w-8 h-8 rounded-full bg-brand-primary/15 flex items-center justify-center
            text-[11px] font-semibold text-brand-primary select-none
            hover:bg-brand-primary/25 hover:ring-2 hover:ring-brand-primary/20
            transition-all duration-150"
        >
          {getInitials(user?.name)}
        </Link>

        <div className="w-px h-4 bg-border/60 shrink-0" />

        {/* Explicit logout */}
        <button
          onClick={logout}
          title="Log out"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
            text-muted-foreground hover:text-status-danger hover:bg-status-danger/8
            transition-all duration-150 text-[12px] font-medium"
        >
          <FaSignOutAlt size={12} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  )
}
