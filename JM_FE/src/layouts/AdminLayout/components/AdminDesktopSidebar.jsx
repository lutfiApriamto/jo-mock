import { motion } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import useAdminSidebarStore from '@/stores/adminSidebarStore'
import { W_OPEN, W_COLLAPSED } from '../constants'
import AdminSidebarInner from './AdminSidebarInner'

export default function AdminDesktopSidebar() {
  const { collapsed, toggle } = useAdminSidebarStore()

  return (
    <motion.aside
      animate={{ width: collapsed ? W_COLLAPSED : W_OPEN }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative hidden md:block shrink-0 bg-bg-surface border-r border-border"
      style={{ overflow: 'visible' }}
    >
      <button
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-[13px] top-[20px] z-10 w-[26px] h-[26px] rounded-full
          bg-background border border-border shadow-sm
          flex items-center justify-center
          text-muted-foreground hover:text-foreground hover:border-brand-primary/50
          transition-all duration-150"
      >
        {collapsed ? <FaChevronRight size={9} /> : <FaChevronLeft size={9} />}
      </button>

      <div className="h-full overflow-hidden">
        <AdminSidebarInner collapsed={collapsed} />
      </div>
    </motion.aside>
  )
}
