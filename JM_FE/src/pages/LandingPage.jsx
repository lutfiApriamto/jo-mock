import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileCode2, Zap, Users2, ArrowRight, Copy, Check } from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FileCode2,
    title: 'Contract-first design',
    desc: 'Define your API shape once. Frontend and backend build against the same specification — no more breaking changes or guesswork at the integration step.',
  },
  {
    icon: Zap,
    title: 'Instant mock server',
    desc: 'Every endpoint you define goes live immediately. Paste the mock URL as your base URL in Axios or Fetch and start building right away.',
  },
  {
    icon: Users2,
    title: 'Team collaboration',
    desc: 'Invite your entire team to one workspace. Frontend, backend, and PM all see the same contract — nobody gets blocked waiting for someone else.',
  },
]

const MOCK_ENDPOINTS = [
  { method: 'GET',  path: '/api/users/me',   status: '200' },
  { method: 'POST', path: '/api/sessions',    status: '201' },
  { method: 'GET',  path: '/api/products',    status: '200' },
  { method: 'PUT',  path: '/api/orders/42',   status: '200' },
]

const METHOD_COLORS = {
  GET:    'bg-brand-primary/10 text-brand-primary',
  POST:   'bg-status-success/10 text-status-success',
  PUT:    'bg-status-warning/10 text-status-warning',
  DELETE: 'bg-status-danger/10 text-status-danger',
}

// ── Animation variants ─────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0  },
}

// ── Component ─────────────────────────────────────────────────────
export default function LandingPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText('https://github.com/lutfiApriamto/jo-mock')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative flex items-center min-h-[85vh]
        px-6 py-16 sm:py-20 overflow-hidden">

        {/* Subtle grid background */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full
            text-foreground opacity-[0.035]"
        >
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        {/* Ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            w-[600px] h-[400px] bg-brand-primary/[0.07] blur-3xl rounded-full"
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto
          grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: copy ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
              bg-brand-primary/10 border border-brand-primary/20
              text-brand-primary text-xs font-medium mb-7">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-current"
              />
              API Mocking Platform · Open Beta
            </div>

            {/* Headline */}
            <h1 className="font-heading font-bold leading-[1.08] tracking-tight
              text-4xl sm:text-5xl xl:text-[3.75rem] text-foreground mb-6">
              Build frontend<br />
              <span className="text-brand-primary">without waiting</span><br />
              for backend.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed
              mb-9 max-w-lg">
              JO-MOCK gives your team a live mock server from shared API contracts —
              so frontend and backend build in parallel without blocking each other.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                  text-sm font-semibold text-primary-foreground
                  bg-brand-primary hover:bg-brand-hover
                  transition-colors duration-150"
              >
                Get started free
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
                  text-sm font-medium text-foreground
                  border border-border hover:bg-accent/60
                  transition-colors duration-150"
              >
                View documentation
              </Link>
            </div>
          </motion.div>

          {/* ── Right: mock server visual ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: 'easeOut' }}
            className="lg:flex lg:justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full max-w-sm xl:max-w-md mx-auto"
            >
              <div className="bg-bg-surface border border-border rounded-2xl
                overflow-hidden shadow-lg">

                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3
                  border-b border-border bg-background/50">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-danger/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-status-warning/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-status-success/70" />
                  </div>
                  <span className="flex-1 text-center font-mono text-[11px]
                    text-muted-foreground truncate">
                    mock.jomock.app/my-project
                  </span>
                </div>

                {/* Endpoint list */}
                <div className="p-3 space-y-2">
                  {MOCK_ENDPOINTS.map((ep, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.3, ease: 'easeOut' }}
                      className="flex items-center gap-2.5 py-2 px-3
                        rounded-xl bg-background/70 border border-border/50
                        font-mono text-xs"
                    >
                      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px]
                        font-bold ${METHOD_COLORS[ep.method]}`}>
                        {ep.method}
                      </span>
                      <span className="text-foreground/80 flex-1 truncate">
                        {ep.path}
                      </span>
                      <span className="text-status-success text-[10px] font-semibold shrink-0">
                        {ep.status} ✓
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Card footer */}
                <div className="px-4 py-3 border-t border-border
                  flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-status-success"
                    />
                    <span className="font-mono text-[11px] text-muted-foreground">
                      4 endpoints active
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px]
                      text-muted-foreground hover:text-foreground
                      transition-colors duration-150"
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? 'Copied!' : 'Copy URL'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold tracking-widest uppercase
              text-brand-primary mb-3">
              Why JO-MOCK
            </p>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              Everything your team needs to move fast.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-bg-surface border border-border rounded-2xl p-6 group
                  hover:border-brand-primary/30 transition-colors duration-200"
              >
                <div className="w-10 h-10 flex items-center justify-center
                  rounded-xl bg-brand-primary/10 mb-5
                  group-hover:bg-brand-primary/15 transition-colors duration-200">
                  <Icon size={18} className="text-brand-primary" />
                </div>
                <h3 className="font-heading font-bold text-base text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16 sm:py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Decorative divider */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground font-mono tracking-wider">
              GET STARTED
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl
            text-foreground mb-4">
            Ready to ship without blockers?
          </h2>
          <p className="text-base text-muted-foreground mb-9 max-w-sm mx-auto">
            Join developer teams who build faster and collaborate better with JO-MOCK.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl
              text-base font-semibold text-primary-foreground
              bg-brand-primary hover:bg-brand-hover
              transition-colors duration-150"
          >
            Get started free
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
