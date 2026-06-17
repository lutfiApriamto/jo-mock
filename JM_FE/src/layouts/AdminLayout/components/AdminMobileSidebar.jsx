import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'
import { W_OPEN } from '../constants'
import AdminSidebarInner from './AdminSidebarInner'

export default function AdminMobileSidebar({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
          />

          <motion.aside
            key="drawer"
            initial={{ x: -(W_OPEN + 24) }}
            animate={{ x: 0 }}
            exit={{ x: -(W_OPEN + 24) }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 bg-bg-surface border-r border-border md:hidden"
            style={{ width: W_OPEN }}
          >
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-[14px] z-10 w-7 h-7 flex items-center justify-center
                rounded-lg text-muted-foreground hover:text-foreground hover:bg-bg-surface
                transition-all duration-150"
            >
              <FaTimes size={12} />
            </button>
            <AdminSidebarInner collapsed={false} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
