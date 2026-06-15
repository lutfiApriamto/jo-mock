import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Menu, X, ArrowRight } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

const NAV_LINKS = [
  { label: 'Docs', to: '/docs' },
  { label: 'Changelog', to: '/changelog' },
  { label: 'Pricing', to: '/pricing' },
]

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0, y: -8, scale: 0.97,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.045, duration: 0.16, ease: 'easeOut' },
  }),
}

const desktopLinkClass = ({ isActive }) =>
  `px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
    isActive
      ? 'bg-brand-primary text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
  }`

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const logoSrc = theme === 'dark' ? '/jomock-dark.svg' : '/jomock-light.svg'

  return (
    <header
      className="sticky top-0 z-50 pointer-events-none
        px-3  pt-5
        sm:px-5 sm:pt-4
        md:px-8"
    >
      {/* ── Floating island ─────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl">
        <div
          className={`pointer-events-auto rounded-2xl border border-border
            bg-background/90 backdrop-blur-md
            transition-shadow duration-300
            ${scrolled ? 'shadow-md' : 'shadow-sm'}`}
        >
          <div
            className="h-14 px-4 sm:px-5
              grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr]
              items-center gap-3"
          >
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 md:justify-self-start"
            >
              <img src={logoSrc} alt="JO-MOCK" className="w-7 h-7 rounded-[7px]" />
              <span className="font-heading font-bold text-sm tracking-tight text-foreground">
                JO-MOCK
              </span>
            </Link>

            {/* Desktop nav links — truly centered via grid */}
            <nav
              aria-label="Main navigation"
              className="hidden md:flex items-center gap-1"
            >
              {NAV_LINKS.map(({ label, to }) => (
                <NavLink key={to} to={to} className={desktopLinkClass}>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center justify-end gap-1.5">
              {/* Login — desktop only */}
              <Link
                to="/login"
                className="hidden md:inline-flex px-3.5 py-1.5 text-sm font-medium
                  text-muted-foreground hover:text-foreground rounded-lg
                  hover:bg-accent/60 transition-colors duration-150"
              >
                Login
              </Link>

              {/* Sign Up — desktop only */}
              <Link
                to="/register"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5
                  text-sm font-semibold text-primary-foreground
                  bg-brand-primary hover:bg-brand-hover rounded-lg
                  transition-colors duration-150"
              >
                Sign Up
                <ArrowRight size={13} />
              </Link>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                className="md:hidden w-8 h-8 flex items-center justify-center
                  rounded-lg text-muted-foreground hover:text-foreground
                  hover:bg-accent/60 transition-colors duration-150"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileOpen ? <X size={17} /> : <Menu size={17} />}
                  </motion.span>
                </AnimatePresence>
              </button>

              {/* Theme toggle — always far right */}
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                  text-muted-foreground hover:text-foreground
                  hover:bg-accent/60 transition-colors duration-150"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile dropdown — separate floating card ─────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pointer-events-auto mt-2 rounded-2xl border border-border
              bg-background/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-3 py-3 flex flex-col gap-1">
              {/* Nav links */}
              {NAV_LINKS.map(({ label, to }, i) => (
                <motion.div
                  key={to}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <NavLink
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block px-3.5 py-2.5 rounded-xl text-sm font-medium
                      transition-colors duration-150 ${
                        isActive
                          ? 'bg-brand-primary/10 text-brand-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </motion.div>
              ))}

              {/* Divider */}
              <motion.div
                className="h-px bg-border mx-1 my-1"
                custom={NAV_LINKS.length}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              />

              {/* Auth buttons side by side */}
              <motion.div
                custom={NAV_LINKS.length + 1}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-2 px-1"
              >
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl
                    text-sm font-medium text-muted-foreground border border-border
                    hover:bg-accent/60 hover:text-foreground transition-colors duration-150"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                    text-sm font-semibold text-primary-foreground
                    bg-brand-primary hover:bg-brand-hover transition-colors duration-150"
                >
                  Sign Up
                  <ArrowRight size={13} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
