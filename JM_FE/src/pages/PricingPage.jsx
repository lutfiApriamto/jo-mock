import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaCheck, FaArrowRight, FaInfinity, FaUsers,
  FaCode, FaBolt, FaCodeBranch, FaLayerGroup,
} from 'react-icons/fa'

// ── Data ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FaInfinity,
    title: 'Unlimited everything',
    desc: 'Projects, endpoints, team members — no artificial caps or upgrade walls during the beta phase.',
  },
  {
    icon: FaUsers,
    title: 'Team collaboration',
    desc: 'Invite your entire team with role-based access: PM, Frontend Dev, and Backend Dev in one workspace.',
  },
  {
    icon: FaCode,
    title: 'Contract-first API design',
    desc: 'Define your API contracts before writing a single line of code. Keep frontend and backend perfectly in sync.',
  },
  {
    icon: FaBolt,
    title: 'Instant mock server',
    desc: 'Every endpoint you define spins up a live mock immediately. Share the URL with your team in seconds.',
  },
  {
    icon: FaCodeBranch,
    title: 'Change request workflow',
    desc: 'Propose, review, and approve API contract changes without breaking existing integrations.',
  },
  {
    icon: FaLayerGroup,
    title: 'Response scenarios',
    desc: 'Create multiple response scenarios per endpoint to test success, error, and edge case flows.',
  },
]

const PERKS = [
  'No credit card required',
  'Free for the entire beta period',
  'All features unlocked — no restrictions',
  'Early users may receive exclusive rates',
]

// ── Animation variants ─────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0  },
}

// ── Component ─────────────────────────────────────────────────────
export default function PricingPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative px-6 pt-16 pb-16 sm:pt-24 sm:pb-20 overflow-hidden">

        {/* Subtle grid background */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full
            text-foreground opacity-[0.035]"
        >
          <defs>
            <pattern id="pricing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pricing-grid)" />
        </svg>

        {/* Ambient glow — green tint to reinforce "free" */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2
            w-[560px] h-[320px] bg-status-success/[0.07] blur-3xl rounded-full"
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.55 }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
            bg-status-success/10 border border-status-success/20
            text-status-success text-xs font-medium mb-7">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-current"
            />
            Open Beta · Free Access
          </div>

          {/* Headline */}
          <h1 className="font-heading font-bold leading-[1.08] tracking-tight
            text-4xl sm:text-5xl xl:text-6xl text-foreground mb-6">
            Get everything,<br />
            <span className="text-status-success">completely free.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed
            mb-9 max-w-xl mx-auto">
            JO-MOCK is in active development. During this open beta phase,
            every feature is available at no cost — no credit card, no hidden fees,
            no time limits.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl
                text-base font-semibold text-primary-foreground
                bg-brand-primary hover:bg-brand-hover
                transition-colors duration-150"
            >
              Get started free
              <FaArrowRight size={13} />
            </Link>
            <p className="text-sm text-muted-foreground">
              No credit card required.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16 sm:py-20">
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
              What's included
            </p>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              Full access to every feature.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-3
              max-w-sm mx-auto leading-relaxed">
              No trial. No lite version. The full product, yours to use.
            </p>
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
                  <Icon className="text-brand-primary text-[17px]" />
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
          PROMISE & CTA
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 pb-20 sm:pb-28">
        <div className="max-w-2xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            {/* Decorative divider */}
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground font-mono tracking-wider">
                OUR PROMISE
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {PERKS.map((perk) => (
                <div
                  key={perk}
                  className="flex items-center gap-3 px-4 py-3
                    bg-bg-surface border border-border rounded-xl
                    text-sm text-muted-foreground"
                >
                  <FaCheck className="text-status-success shrink-0 text-[11px]" />
                  {perk}
                </div>
              ))}
            </div>

            {/* Future pricing note */}
            <div className="bg-brand-primary/5 border border-brand-primary/15
              rounded-2xl px-6 py-6 text-center mb-10">
              <p className="text-sm font-semibold text-foreground mb-2">
                What happens when beta ends?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pricing plans will be introduced when JO-MOCK exits beta.
                Users who join now will be first to know — and may receive
                exclusive early-adopter benefits.
              </p>
            </div>

            {/* Final CTA */}
            <div className="text-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl
                  text-base font-semibold text-primary-foreground
                  bg-brand-primary hover:bg-brand-hover
                  transition-colors duration-150"
              >
                Join the beta for free
                <FaArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
