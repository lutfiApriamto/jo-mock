import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaKey, FaEye, FaEyeSlash, FaCopy, FaSync, FaCheck } from 'react-icons/fa'
import useAuthStore from '@/stores/authStore'
import InfoTooltip from '@/shared/components/InfoTooltip'
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  regenerateApiKey,
} from '@/features/user/services/userService'

const PROFILE_KEY = ['profile', 'me']

const ROLE_BADGE = {
  user:       'bg-brand-primary/10 text-brand-primary',
  superadmin: 'bg-status-warning/10 text-status-warning',
}

const PW_RULES = [
  { label: '8+ characters',     test: p => p.length >= 8 },
  { label: 'Uppercase (A–Z)',   test: p => /[A-Z]/.test(p) },
  { label: 'Lowercase (a–z)',   test: p => /[a-z]/.test(p) },
  { label: 'Number (0–9)',      test: p => /\d/.test(p) },
  { label: 'Special character', test: p => /[^A-Za-z0-9]/.test(p) },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'
}

const inputCls = [
  'w-full px-3.5 py-[9px] rounded-xl text-sm text-foreground',
  'bg-background border border-border/60 placeholder:text-muted-foreground/30',
  'focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50',
  'transition-all duration-150',
].join(' ')

function Section({ title, subtitle, tooltip, children }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
      <div className="px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <h2 className="font-heading font-bold text-[15px] text-foreground">{title}</h2>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        {subtitle && (
          <p className="text-[12px] text-muted-foreground/60 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

// ─── ProfileSection ───────────────────────────────────────────────────────────
function ProfileSection({ profile }) {
  const queryClient = useQueryClient()
  const updateUser  = useAuthStore(s => s.updateUser)

  const [name, setName] = useState(profile.name)
  const dirty           = name.trim() !== profile.name
  const canSubmit       = dirty && name.trim()

  const mutation = useMutation({
    mutationFn: () => updateMyProfile({ name: name.trim() }),
    onSuccess: (res) => {
      const updated = res.data.data.data
      queryClient.setQueryData(PROFILE_KEY, updated)
      updateUser({ name: updated.name })
      setName(updated.name)
      toast.success('Profile updated.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to update profile.')
    },
  })

  const display = profile.avatar ? profile.avatar.slice(0, 2) : getInitials(profile.name)

  return (
    <Section title="Profile" subtitle="Your display name and account information.">
      {/* Avatar + info */}
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border/40">
        <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center
          text-[18px] font-bold text-brand-primary shrink-0 select-none">
          {display}
        </div>
        <div>
          <div className="font-semibold text-foreground text-[15px]">{profile.name}</div>
          <div className="text-[12px] text-muted-foreground">{profile.email}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={[
              'text-[10px] font-semibold px-2 py-0.5 rounded-full',
              ROLE_BADGE[profile.role] ?? 'bg-bg-surface text-muted-foreground',
            ].join(' ')}>
              {profile.role === 'superadmin' ? 'Superadmin' : 'User'}
            </span>
            <span className="text-[11px] text-muted-foreground/50">
              Joined{' '}
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Edit name */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) mutation.mutate() }}
        className="space-y-3"
      >
        <div>
          <label className="block text-[12px] font-medium text-foreground/65 mb-1">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            placeholder="Your name"
            className={inputCls}
          />
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending || !canSubmit}
            className="px-4 py-[9px] rounded-xl bg-brand-primary text-white text-sm font-semibold
              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Section>
  )
}

// ─── ApiKeySection ────────────────────────────────────────────────────────────
function ApiKeySection({ profile }) {
  const queryClient = useQueryClient()
  const [revealed,  setRevealed]  = useState(false)
  const [showRegen, setShowRegen] = useState(false)
  const [regenPwd,  setRegenPwd]  = useState('')

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(profile.apiKey)
      toast.success('API key copied!')
    } catch {
      toast.error('Failed to copy.')
    }
  }

  const mutation = useMutation({
    mutationFn: () => regenerateApiKey({ currentPassword: regenPwd }),
    onSuccess: (res) => {
      const { apiKey } = res.data.data.data
      queryClient.setQueryData(PROFILE_KEY, (old) => ({ ...old, apiKey }))
      setShowRegen(false)
      setRegenPwd('')
      setRevealed(true)
      toast.success('API key regenerated. Update it in all your integrations.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to regenerate API key.')
    },
  })

  const used   = profile.quota?.used  ?? 0
  const limit  = profile.quota?.limit ?? 10000
  const pct    = Math.min(Math.round((used / limit) * 100), 100)
  const isHigh = pct >= 80

  return (
    <Section
      title="API Key"
      subtitle="Include this in the x-api-key header on every mock request."
      tooltip="Your personal API key authenticates all requests to the mock server. Never share it publicly. Regenerating the key invalidates the old one immediately — update all integrations right away."
    >
      {/* Key row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 min-w-0 flex items-center gap-2.5 px-3.5 py-[9px] rounded-xl
          bg-bg-surface border border-border/60">
          <FaKey size={10} className="text-muted-foreground/40 shrink-0" />
          <span className="flex-1 truncate font-mono text-[12.5px] text-foreground/80 select-all">
            {revealed ? profile.apiKey : '••••••••-••••-••••-••••-••••••••••••'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setRevealed(v => !v)}
          title={revealed ? 'Hide key' : 'Reveal key'}
          className="p-[9px] rounded-xl border border-border/60 text-muted-foreground
            hover:text-foreground hover:border-border bg-background transition-all duration-150"
        >
          {revealed ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
        </button>

        <button
          type="button"
          onClick={copyKey}
          title="Copy API key"
          className="p-[9px] rounded-xl border border-border/60 text-muted-foreground
            hover:text-foreground hover:border-border bg-background transition-all duration-150"
        >
          <FaCopy size={12} />
        </button>
      </div>

      {/* Regenerate */}
      <button
        type="button"
        onClick={() => { setShowRegen(v => !v); setRegenPwd('') }}
        className="flex items-center gap-1.5 text-[12px] font-semibold
          text-status-warning/70 hover:text-status-warning transition-colors"
      >
        <FaSync size={9} />
        Regenerate API Key
      </button>

      <AnimatePresence>
        {showRegen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-4 rounded-xl border border-status-warning/25 bg-status-warning/5 space-y-3">
              <p className="text-[12px] text-status-warning leading-relaxed">
                ⚠️ The current key will stop working <strong>immediately</strong>.
                Make sure to update it in all your integrations before confirming.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={regenPwd}
                  onChange={e => setRegenPwd(e.target.value)}
                  placeholder="Enter your password to confirm"
                  className={inputCls}
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && regenPwd && !mutation.isPending) mutation.mutate()
                  }}
                />
                <button
                  type="button"
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || !regenPwd}
                  className="shrink-0 px-3.5 py-[9px] rounded-xl bg-status-warning text-white
                    text-sm font-semibold hover:opacity-90
                    disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {mutation.isPending ? 'Generating…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRegen(false); setRegenPwd('') }}
                  className="shrink-0 px-3.5 py-[9px] rounded-xl border border-border/60
                    text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quota */}
      <div className="mt-5 pt-5 border-t border-border/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12.5px] font-semibold text-foreground">Usage Quota</span>
          <span className={[
            'text-[12px] font-semibold tabular-nums',
            isHigh ? 'text-status-danger' : 'text-muted-foreground',
          ].join(' ')}>
            {used.toLocaleString()} / {limit.toLocaleString()} hits ({pct}%)
          </span>
        </div>
        <div className="h-2 bg-border/40 rounded-full overflow-hidden">
          <div
            className={['h-full rounded-full transition-all duration-500',
              isHigh ? 'bg-status-danger' : 'bg-brand-primary'].join(' ')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={['text-[11px] mt-1.5',
          isHigh ? 'text-status-danger' : 'text-muted-foreground/50'].join(' ')}>
          {isHigh
            ? `You've used ${pct}% of your quota. Contact support to increase your limit.`
            : 'Counted per valid API key request to the mock server.'}
        </p>
      </div>
    </Section>
  )
}

// ─── PasswordSection ──────────────────────────────────────────────────────────
function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent,     setShowCurrent]     = useState(false)
  const [showNew,         setShowNew]         = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)

  const allRulesPassed = PW_RULES.every(({ test }) => test(newPassword))
  const mismatch       = newPassword && confirmPassword && newPassword !== confirmPassword
  const canSubmit      = currentPassword && allRulesPassed && newPassword === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const tid = toast.loading('Changing password…')
    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Password changed. Other sessions have been signed out.', { id: tid })
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.message ?? 'Failed to change password.',
        { id: tid },
      )
    }
  }

  return (
    <Section
      title="Change Password"
      subtitle="After changing, all other active sessions will be signed out."
    >
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Current password */}
        <div>
          <label className="block text-[12px] font-medium text-foreground/65 mb-1">
            Current password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className={inputCls + ' pr-10'}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors"
            >
              {showCurrent ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label className="block text-[12px] font-medium text-foreground/65 mb-1">
            New password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className={inputCls + ' pr-10'}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowNew(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors"
            >
              {showNew ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
            </button>
          </div>

          {/* Password strength checklist */}
          {newPassword.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
              {PW_RULES.map(({ label, test }) => {
                const ok = test(newPassword)
                return (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 text-[11px] leading-none
                      transition-colors duration-200"
                    style={{ color: ok ? 'var(--color-status-success)' : undefined }}
                  >
                    <span
                      className="w-[13px] h-[13px] rounded-full border shrink-0
                        flex items-center justify-center transition-all duration-200"
                      style={ok
                        ? { background: 'var(--color-status-success)', borderColor: 'var(--color-status-success)' }
                        : { borderColor: 'rgba(162,155,200,0.25)' }
                      }
                    >
                      {ok && <FaCheck size={6} color="#fff" />}
                    </span>
                    <span style={!ok ? { color: 'rgba(162,155,200,0.4)' } : undefined}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Confirm new password */}
        <div>
          <label className="block text-[12px] font-medium text-foreground/65 mb-1">
            Confirm new password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className={[
                'w-full px-3.5 py-[9px] pr-10 rounded-xl text-sm text-foreground',
                'bg-background placeholder:text-muted-foreground/30',
                'focus:outline-none focus:ring-2 transition-all duration-150',
                mismatch
                  ? 'border border-status-danger/50 focus:ring-status-danger/15'
                  : 'border border-border/60 focus:ring-brand-primary/15 focus:border-brand-primary/50',
              ].join(' ')}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-muted-foreground/35 hover:text-muted-foreground/70 transition-colors"
            >
              {showConfirm ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
            </button>
          </div>
          {mismatch && (
            <p className="text-[11px] text-status-danger mt-1">Passwords do not match.</p>
          )}
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-[9px] rounded-xl bg-brand-primary text-white text-sm font-semibold
              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            Change Password
          </button>
        </div>
      </form>
    </Section>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 animate-pulse">
      <div className="h-7 w-28 rounded-lg bg-bg-surface" />
      {[220, 300, 280].map((h, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-background">
          <div className="px-5 py-4 border-b border-border/40 h-[58px]" />
          <div style={{ height: h }} className="px-5 py-5" />
        </div>
      ))}
    </div>
  )
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: profile, isPending, isError, error } = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => getMyProfile().then(r => r.data.data.data),
    staleTime: 60_000,
  })

  if (isPending) return <ProfileSkeleton />

  if (isError) return (
    <div className="flex items-center justify-center h-full p-8 text-sm text-muted-foreground">
      {error?.response?.data?.errors?.[0]?.message ?? 'Failed to load profile.'}
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5" data-lenis-prevent>
      <div>
        <h1 className="font-heading font-bold text-[22px] text-foreground">Profile</h1>
        <p className="text-[13px] text-muted-foreground/60 mt-0.5">
          Manage your account information and settings.
        </p>
      </div>

      <ProfileSection profile={profile} />
      <ApiKeySection  profile={profile} />
      <PasswordSection />
    </div>
  )
}
