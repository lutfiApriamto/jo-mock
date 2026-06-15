import { motion } from 'framer-motion'
import {
  FaServer, FaBolt, FaCode, FaLayerGroup, FaToggleOn,
  FaUsers, FaCodeBranch, FaHistory, FaEnvelope,
  FaFileCode, FaKey, FaFolderOpen, FaClock,
} from 'react-icons/fa'

// ── Current release ────────────────────────────────────────────────
const RELEASE = {
  version: 'v0.1.0',
  date: 'June 2026',
  headline: 'Everything you need to build frontend without waiting for backend.',
  groups: [
    {
      label: 'Mock & API Design',
      features: [
        {
          icon: FaServer,
          title: 'Instant Mock Server',
          desc: 'Every endpoint you define instantly gets a shareable URL. Your team can start consuming it in seconds — no extra setup.',
        },
        {
          icon: FaBolt,
          title: 'Endpoint Builder',
          desc: 'Create endpoints with any HTTP method and path, including dynamic segments like /users/:id or /posts/:slug.',
        },
        {
          icon: FaCode,
          title: 'Request Schema',
          desc: 'Describe the shape of your request body with nested types — string, number, boolean, object, array.',
        },
        {
          icon: FaLayerGroup,
          title: 'Response Scenarios',
          desc: 'Define multiple response scenarios per endpoint: success, error, loading, edge cases — all in one place.',
        },
        {
          icon: FaToggleOn,
          title: 'Per-user Response Toggle',
          desc: 'Switch your active scenario without affecting your teammates. Each person controls their own mock state.',
        },
      ],
    },
    {
      label: 'Team & Workflow',
      features: [
        {
          icon: FaUsers,
          title: 'Team Collaboration',
          desc: 'Invite teammates by email with role-based access: Project Manager, Frontend Developer, or Backend Developer.',
        },
        {
          icon: FaCodeBranch,
          title: 'Change Request Workflow',
          desc: 'Propose changes to an API contract, get it reviewed and approved by the PM before it goes live — no surprises.',
        },
        {
          icon: FaHistory,
          title: 'Contract Version History',
          desc: 'Every approved change to a contract is versioned and timestamped. See exactly what changed and when.',
        },
        {
          icon: FaEnvelope,
          title: 'Email Notifications',
          desc: 'Get notified on change requests, team invitations, and contract updates — so nothing slips through the cracks.',
        },
      ],
    },
    {
      label: 'Developer Tools',
      features: [
        {
          icon: FaFileCode,
          title: 'Code Generator',
          desc: 'Generate ready-to-use frontend code in 4 combinations: React (JS or TS) with useState or Zustand, all using Axios.',
        },
        {
          icon: FaKey,
          title: 'API Key',
          desc: 'Each user gets a personal API key for authenticating requests to the mock server. Regenerate it anytime from your profile.',
        },
        {
          icon: FaFolderOpen,
          title: 'Projects & Folders',
          desc: 'Organize your endpoints into projects with nested folders. Keep different services cleanly separated.',
        },
      ],
    },
  ],
}

// ── Roadmap ────────────────────────────────────────────────────────
const ROADMAP = [
  'OpenAPI / Swagger import and export',
  'Webhook support for change events',
  'Public mock URL (no API key required)',
  'Usage analytics and quota dashboard',
]

// ── Animation ──────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0  },
}

// ── Component ─────────────────────────────────────────────────────
export default function ChangelogPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full
              bg-brand-primary/10 border border-brand-primary/20
              text-brand-primary text-xs font-medium mb-6">
              Changelog
            </div>

            <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl
              text-foreground tracking-tight mb-4">
              What's in JO-MOCK.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              A clear look at every feature available in the current beta, and what's coming next.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CURRENT RELEASE
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Version row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="font-mono text-sm font-bold px-3 py-1
                rounded-md bg-brand-primary/10 text-brand-primary
                border border-brand-primary/20">
                {RELEASE.version}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full
                bg-status-success/10 text-status-success border border-status-success/20">
                Open Beta
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {RELEASE.date}
              </span>
            </div>

            <h2 className="font-heading font-bold text-xl sm:text-2xl
              text-foreground mb-10 max-w-2xl">
              {RELEASE.headline}
            </h2>

            {/* Feature groups */}
            <div className="space-y-10">
              {RELEASE.groups.map((group, gi) => (
                <motion.div
                  key={group.label}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: gi * 0.06 }}
                >
                  <p className="text-[11px] font-semibold tracking-widest uppercase
                    text-brand-primary mb-4">
                    {group.label}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.features.map(({ icon: Icon, title, desc }) => (
                      <div
                        key={title}
                        className="flex gap-3.5 p-4 rounded-xl
                          bg-bg-surface border border-border
                          hover:border-brand-primary/25 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 flex items-center justify-center
                          rounded-lg bg-brand-primary/10 shrink-0 mt-0.5">
                          <Icon className="text-brand-primary text-[13px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {title}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ROADMAP
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground font-mono tracking-wider shrink-0">
                ON THE ROADMAP
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROADMAP.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 px-4 py-3
                    rounded-xl border border-dashed border-border
                    text-sm text-muted-foreground"
                >
                  <FaClock className="text-muted-foreground/40 shrink-0 text-[11px]" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
