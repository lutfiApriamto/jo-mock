import { FaBars, FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import { useLogout } from '@/features/auth/hooks/useLogout'
import DigitalClock from '@/shared/components/DigitalClock'
import AdminBreadcrumb from './AdminBreadcrumb'

export default function AdminTopbar({ onMenuOpen }) {
  const { theme, toggleTheme } = useTheme()
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
        <AdminBreadcrumb />
      </div>

      {/* Right: clock | theme toggle | logout */}
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

        <div className="w-px h-4 bg-border/60 shrink-0" />

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
