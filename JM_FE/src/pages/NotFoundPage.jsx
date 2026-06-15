import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, LayoutDashboard } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import useAuthStore from '@/stores/authStore'

export default function NotFoundPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { theme } = useTheme()
  const user      = useAuthStore((s) => s.user)

  const homeTo    = !user ? '/' : user.role === 'superadmin' ? '/admin' : '/dashboard'
  const HomeIcon  = !user ? Home : LayoutDashboard
  const homeLabel = !user ? 'Go home' : 'Dashboard'

  const logoSrc = theme === 'dark' ? '/jomock-dark.svg' : '/jomock-light.svg'

  return (
    <div className="min-h-screen bg-bg-page relative flex flex-col items-center justify-center px-4 overflow-hidden">

      {/* ── Watermark ───────────────────────────────────────────── */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute font-mono font-bold
          leading-none tracking-tighter text-[42vw] text-foreground/[0.04]"
      >
        404
      </span>

      {/* ── Logo — top left ─────────────────────────────────────── */}
      <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-200"
        >
          <img src={logoSrc} alt="JO-MOCK" className="w-6 h-6 rounded-[6px]" />
          <span className="hidden sm:block font-heading font-bold text-xs tracking-tight text-foreground">
            JO-MOCK
          </span>
        </Link>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md flex flex-col items-center text-center"
      >

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-7
          bg-status-danger/10 border border-status-danger/20 text-status-danger
          text-xs font-mono font-medium"
        >
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-current"
          />
          404 · Not Found
        </div>

        {/* Heading */}
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground leading-tight mb-3">
          Page not found.
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8 max-w-[280px] sm:max-w-xs">
          The page you're looking for doesn't exist or has been moved to another URL.
        </p>

        {/* ── Mock API response card ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: 'easeOut' }}
          className="w-full bg-bg-surface border border-border rounded-xl p-4 mb-8 text-left"
        >
          {/* Request line */}
          <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-border font-mono text-xs sm:text-sm">
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold
              bg-brand-primary/10 text-brand-primary">
              GET
            </span>
            <span className="text-muted-foreground truncate">{location.pathname}</span>
          </div>

          {/* Response status */}
          <div className="flex items-center gap-2 mb-3 font-mono text-xs sm:text-sm">
            <span className="text-muted-foreground">←</span>
            <span className="text-status-danger font-semibold">404 Not Found</span>
          </div>

          {/* JSON body */}
          <div className="font-mono text-xs sm:text-sm leading-relaxed">
            <span className="text-muted-foreground">{'{'}</span>
            <div className="pl-4">
              <div>
                <span className="text-brand-primary dark:text-brand-accent">"status"</span>
                <span className="text-muted-foreground">: </span>
                <span className="text-brand-primary dark:text-brand-accent">404</span>
                <span className="text-muted-foreground">,</span>
              </div>
              <div>
                <span className="text-brand-primary dark:text-brand-accent">"error"</span>
                <span className="text-muted-foreground">: </span>
                <span className="text-status-success">"Not Found"</span>
                <span className="text-muted-foreground">,</span>
              </div>
              <div>
                <span className="text-brand-primary dark:text-brand-accent">"message"</span>
                <span className="text-muted-foreground">: </span>
                <span className="text-status-success">"This resource does not exist."</span>
              </div>
            </div>
            <span className="text-muted-foreground">{'}'}</span>
          </div>
        </motion.div>

        {/* ── CTA buttons ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.32, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm
              font-medium text-foreground border border-border
              hover:bg-accent/60 transition-colors duration-150"
          >
            <ArrowLeft size={15} />
            Go back
          </button>

          <Link
            to={homeTo}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm
              font-semibold text-primary-foreground
              bg-brand-primary hover:bg-brand-hover transition-colors duration-150"
          >
            <HomeIcon size={15} />
            {homeLabel}
          </Link>
        </motion.div>

      </motion.div>
    </div>
  )
}
