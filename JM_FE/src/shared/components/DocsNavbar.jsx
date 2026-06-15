import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'

export default function DocsNavbar({ menuOpen, onMenuToggle }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center
      bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3 px-4 sm:px-6 w-full">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground
            hover:text-foreground hover:bg-muted transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={menuOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {menuOpen ? <FaTimes size={15} /> : <FaBars size={15} />}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={theme === 'dark' ? '/jomock-dark.svg' : '/jomock-light.svg'}
            alt="JO-MOCK"
            className="h-6"
          />
        </Link>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>/</span>
          <span className="text-foreground font-medium">Documentation</span>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg
              text-xs font-medium text-muted-foreground
              hover:text-foreground hover:bg-muted transition-colors"
          >
            ← Back to site
          </Link>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-muted-foreground
              hover:text-foreground hover:bg-muted transition-colors"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </header>
  )
}
