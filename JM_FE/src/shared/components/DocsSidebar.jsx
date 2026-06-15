import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DOCS_NAV } from '@/shared/constants/docsConfig'

// ── Shared nav content ─────────────────────────────────────────────
function SidebarNav({ onClose }) {
  return (
    <>
      {DOCS_NAV.map((section) => (
        <div key={section.group} className="mb-6">
          <p className="text-[10px] font-bold tracking-widest uppercase
            text-muted-foreground/50 px-3 mb-2">
            {section.group}
          </p>

          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm
                    transition-colors duration-150 ${
                      isActive
                        ? 'bg-brand-primary/10 text-brand-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────
export default function DocsSidebar({ open, onClose }) {
  return (
    <>
      {/* ── Desktop sidebar — always visible, no animation ── */}
      <aside className="hidden lg:block sticky top-14 shrink-0
        w-64 h-[calc(100vh-3.5rem)] overflow-y-auto
        bg-background border-r border-border py-7 px-3">
        <SidebarNav onClose={onClose} />
      </aside>

      {/* ── Mobile sidebar — animated, overlay drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              aria-hidden="true"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            />

            {/* Sidebar panel */}
            <motion.aside
              key="sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 280,
                mass: 0.8,
              }}
              className="fixed top-14 left-0 z-40 lg:hidden
                w-64 h-[calc(100vh-3.5rem)] overflow-y-auto
                bg-background border-r border-border py-7 px-3"
            >
              <SidebarNav onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
