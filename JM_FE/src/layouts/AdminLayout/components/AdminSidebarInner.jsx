import { FaChartPie, FaUsers, FaLayerGroup, FaArrowLeft } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import useAuthStore from '@/stores/authStore'
import { getInitials } from '../utils'
import AdminNavItem from './AdminNavItem'

export default function AdminSidebarInner({ collapsed }) {
  const { theme } = useTheme()
  const user      = useAuthStore(s => s.user)
  const logo      = theme === 'dark' ? '/jomock-dark.svg' : '/jomock-light.svg'

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
          Admin
        </p>

        <AdminNavItem to="/admin"          icon={<FaChartPie />}    label="Dashboard"  collapsed={collapsed} />
        <AdminNavItem to="/admin/users"    icon={<FaUsers />}       label="Users"      collapsed={collapsed} />
        <AdminNavItem to="/admin/projects" icon={<FaLayerGroup />}  label="Projects"   collapsed={collapsed} />
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-3 shrink-0 space-y-2">
        {/* Back to user dashboard */}
        <Link
          to="/dashboard"
          title={collapsed ? 'Back to dashboard' : undefined}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg
            text-muted-foreground hover:text-foreground hover:bg-bg-surface
            transition-all duration-150"
        >
          <FaArrowLeft size={12} className="shrink-0" />
          <span
            className="text-[12px] font-medium whitespace-nowrap transition-opacity duration-200"
            style={{ opacity: collapsed ? 0 : 1 }}
          >
            Back to dashboard
          </span>
        </Link>

        {/* Admin user info */}
        <div className="flex items-center gap-2.5 min-w-0 px-1">
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
              Superadmin
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
