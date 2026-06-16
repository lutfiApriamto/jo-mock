import { useQuery } from '@tanstack/react-query'
import { FaLayerGroup, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import useAuthStore from '@/stores/authStore'
import { getInitials } from '../utils'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { getMyProfile } from '@/features/user/services/userService'
import { getMyInvitations } from '@/features/invitation/services/invitationService'
import NavItem from './NavItem'

export default function SidebarInner({ collapsed }) {
  const { theme } = useTheme()
  const user      = useAuthStore(s => s.user)
  const logout    = useLogout()

  // Poll fresh quota every 60 s and on window focus.
  // Falls back to auth-store values while the first request is in-flight.
  const { data: quota } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn:  () => getMyProfile().then(r => r.data.data.data),
    select:   (d) => d?.quota,
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

  // Poll pending invitation count every 60 s for sidebar badge.
  const { data: inviteCount = 0 } = useQuery({
    queryKey: ['invitations', 'mine'],
    queryFn:  () => getMyInvitations().then(r => r.data.data.data ?? []),
    select:   (d) => (Array.isArray(d) ? d.length : 0),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

  const logo   = theme === 'dark' ? '/jomock-dark.svg' : '/jomock-light.svg'
  const used   = quota?.used  ?? user?.quota?.used  ?? 0
  const limit  = quota?.limit ?? user?.quota?.limit ?? 10000
  const pct    = Math.round(Math.min((used / limit) * 100, 100))
  const isHigh = pct >= 80

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo row */}
      <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
        <img src={logo} alt="" aria-hidden className="h-6 w-6 object-contain shrink-0" />
        <span
          className="ml-2.5 font-heading font-bold text-[15px] tracking-tight text-foreground
            whitespace-nowrap transition-opacity duration-200"
          style={{ opacity: collapsed ? 0 : 1 }}
        >
          JO-MOCK
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden space-y-0.5">
        <p
          className="text-[10px] font-medium text-muted-foreground/50 tracking-widest px-2 pb-2
            uppercase transition-opacity duration-200"
          style={{ opacity: collapsed ? 0 : 1 }}
        >
          Menu
        </p>

        <NavItem to="/dashboard"             icon={<FaLayerGroup />} label="Projects"    collapsed={collapsed} />
        <NavItem to="/dashboard/invitations" icon={<FaBell />}       label="Invitations" collapsed={collapsed} badge={inviteCount} />
        <NavItem to="/dashboard/profile"     icon={<FaUser />}       label="Profile"     collapsed={collapsed} />
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-brand-primary/15 flex items-center justify-center
            text-[11px] font-semibold text-brand-primary shrink-0 select-none">
            {getInitials(user?.name)}
          </div>

          <div
            className="flex-1 min-w-0 overflow-hidden transition-opacity duration-200"
            style={{ opacity: collapsed ? 0 : 1 }}
          >
            <div className="text-[12px] font-medium text-foreground truncate">
              {user?.name}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {used.toLocaleString()} / {limit.toLocaleString()} hits
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="shrink-0 text-muted-foreground/40 hover:text-status-danger
              transition-[opacity,color] duration-200"
            style={{ opacity: collapsed ? 0 : 1 }}
          >
            <FaSignOutAlt size={12} />
          </button>
        </div>

        <div
          className="mt-2.5 h-[3px] bg-border/50 rounded-full overflow-hidden
            transition-opacity duration-200"
          style={{ opacity: collapsed ? 0 : 1 }}
        >
          <div
            className={[
              'h-full rounded-full transition-all duration-500',
              isHigh ? 'bg-status-danger' : 'bg-brand-primary',
            ].join(' ')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
