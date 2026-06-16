import { useState } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  FaCheckCircle, FaTimesCircle, FaCircleNotch,
  FaEnvelopeOpenText, FaSun, FaMoon, FaArrowRight,
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useTheme } from '@/context/ThemeContext'
import useAuthStore from '@/stores/authStore'
import {
  getInvitationByToken,
  acceptInvitation,
  declineInvitation,
} from '@/features/invitation/services/invitationService'

/* ─── Constants ──────────────────────────────────────────────────────────── */
const ROLE_META = {
  PM: { label: 'Project Manager',    cls: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20' },
  FE: { label: 'Frontend Developer', cls: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
  BE: { label: 'Backend Developer',  cls: 'text-status-success bg-status-success/10 border-status-success/20' },
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmtExpiry = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'UTC',
  }) + ' UTC'

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

/* ─── Card shell ─────────────────────────────────────────────────────────── */
function Card({ isDark, children }) {
  return (
    <div
      className="w-full max-w-[440px] rounded-2xl border border-border/40 overflow-hidden"
      style={{
        backgroundColor: isDark ? '#1B1828' : '#F4F3FB',
        boxShadow: isDark
          ? '0 24px 64px rgba(0,0,0,0.50), 0 0 0 1px rgba(108,92,231,0.10)'
          : '0 16px 48px rgba(0,0,0,0.09), 0 0 0 1px rgba(108,92,231,0.07)',
      }}
    >
      <div className="bg-brand-primary px-7 py-5">
        <p className="font-heading font-bold text-white text-[15px]">Project Invitation</p>
        <p className="text-[12px] text-white/55 mt-0.5">JO-MOCK · Joint Operations Mock</p>
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function InvitationPage() {
  const { token }           = useParams()
  const [searchParams]      = useSearchParams()
  const navigate            = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const user   = useAuthStore(s => s.user)
  const isDark = theme === 'dark'
  const logo   = isDark ? '/jomock-dark.svg' : '/jomock-light.svg'

  const [outcome, setOutcome] = useState(null) // null | 'accepted' | 'declined'

  // Email "Decline" button passes ?action=decline — show decline-first layout
  const wantDecline = searchParams.get('action') === 'decline'

  /* ── Query: fetch invitation details (public endpoint) ── */
  const { data, isLoading, error } = useQuery({
    queryKey: ['invitation', 'token', token],
    queryFn:  () => getInvitationByToken(token).then(r => r.data.data.data),
    retry:    false,
    staleTime: Infinity,
    enabled:  !!token,
  })

  /* ── Mutations ── */
  const acceptMut = useMutation({
    mutationFn: () => acceptInvitation(token),
    onSuccess: (res) => {
      setOutcome('accepted')
      const projectName = res.data.data.data?.projectName ?? 'the project'
      toast.success(`You've joined ${projectName}!`)
      setTimeout(() => navigate('/dashboard'), 2500)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to accept invitation.')
    },
  })

  const declineMut = useMutation({
    mutationFn: () => declineInvitation(token),
    onSuccess: () => setOutcome('declined'),
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to decline invitation.')
    },
  })

  const isActing = acceptMut.isPending || declineMut.isPending

  /* ── Error classification ── */
  const errStatus = error?.response?.status
  const errMsg    = error?.response?.data?.errors?.[0]?.message ?? ''

  /* ── Redirect URLs preserve current path so user returns here after login ── */
  const currentPath  = `/invitations/${token}${wantDecline ? '?action=decline' : ''}`
  const loginHref    = `/login?redirect=${encodeURIComponent(currentPath)}`
  const registerHref = `/register?redirect=${encodeURIComponent(currentPath)}`

  const meta = data ? (ROLE_META[data.role] ?? ROLE_META.FE) : null

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: isDark ? '#100E18' : '#F7F7FB',
        backgroundImage: isDark
          ? 'radial-gradient(circle 650px at 8% 0%, rgba(108,92,231,0.30), transparent 60%), radial-gradient(circle 550px at 92% 100%, rgba(108,92,231,0.18), transparent 60%)'
          : 'radial-gradient(circle 650px at 8% 0%, rgba(108,92,231,0.14), transparent 60%), radial-gradient(circle 550px at 92% 100%, rgba(108,92,231,0.08), transparent 60%)',
      }}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logo} alt="" aria-hidden className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
          <span className="font-heading font-bold text-[17px] sm:text-lg tracking-tight text-foreground
            group-hover:text-brand-primary transition-colors duration-150">
            JO-MOCK
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <Link
              to="/dashboard"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Dashboard →
            </Link>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 flex items-center justify-center rounded-full
              bg-bg-surface border border-border text-muted-foreground hover:text-foreground
              hover:border-brand-primary/40 transition-all duration-200"
          >
            {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex items-center justify-center px-5 py-8 sm:py-12">

        {/* Loading */}
        {isLoading && (
          <Card isDark={isDark}>
            <div className="flex flex-col items-center py-8 gap-3">
              <FaCircleNotch size={22} className="animate-spin text-brand-primary" />
              <p className="text-[13px] text-muted-foreground">Loading invitation…</p>
            </div>
          </Card>
        )}

        {/* Error */}
        {!isLoading && error && (
          <Card isDark={isDark}>
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                errStatus === 410 ? 'bg-status-warning/10' : 'bg-status-danger/10'
              }`}>
                <FaTimesCircle size={22} className={errStatus === 410 ? 'text-status-warning' : 'text-status-danger'} />
              </div>
              <p className="font-heading font-bold text-foreground text-[16px]">
                {errStatus === 410 ? 'Invitation Expired'
                  : errStatus === 409 ? 'Already Responded'
                  : errStatus === 404 ? 'Invitation Not Found'
                  : 'Something Went Wrong'}
              </p>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
                {errStatus === 410
                  ? 'This invitation link has expired. Ask the project owner to resend the invitation.'
                  : (errStatus === 404 || errStatus === 409)
                  ? 'This invitation is no longer valid or has already been used.'
                  : (errMsg || 'Unable to load the invitation. Please try again later.')}
              </p>
              <Link
                to={user ? '/dashboard' : '/'}
                className="mt-4 flex items-center gap-1.5 text-[13px] text-brand-primary hover:opacity-75 transition-opacity"
              >
                {user ? 'Go to dashboard' : 'Back to home'} <FaArrowRight size={10} />
              </Link>
            </div>
          </Card>
        )}

        {/* Accepted success */}
        {outcome === 'accepted' && (
          <Card isDark={isDark}>
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-status-success/10 flex items-center justify-center mb-2">
                <FaCheckCircle size={22} className="text-status-success" />
              </div>
              <p className="font-heading font-bold text-foreground text-[16px]">You've joined the project!</p>
              <p className="text-[13px] text-muted-foreground">Redirecting to your dashboard…</p>
              <FaCircleNotch size={14} className="animate-spin text-muted-foreground/40 mt-3" />
            </div>
          </Card>
        )}

        {/* Declined success */}
        {outcome === 'declined' && (
          <Card isDark={isDark}>
            <div className="flex flex-col items-center py-8 text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center mb-2">
                <FaTimesCircle size={22} className="text-muted-foreground/50" />
              </div>
              <p className="font-heading font-bold text-foreground text-[16px]">Invitation Declined</p>
              <p className="text-[13px] text-muted-foreground">You have declined this invitation.</p>
              <Link
                to={user ? '/dashboard' : '/'}
                className="mt-4 flex items-center gap-1.5 text-[13px] text-brand-primary hover:opacity-75 transition-opacity"
              >
                {user ? 'Go to dashboard' : 'Back to home'} <FaArrowRight size={10} />
              </Link>
            </div>
          </Card>
        )}

        {/* Valid invitation card */}
        {!isLoading && !error && data && !outcome && (
          <Card isDark={isDark}>
            <div className="space-y-5">

              {/* Intro + project name */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                    <FaEnvelopeOpenText size={14} className="text-brand-primary" />
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    {wantDecline ? 'You chose to decline this invitation' : "You've been invited to join"}
                  </p>
                </div>
                <h1 className="font-heading font-bold text-foreground text-[22px] leading-snug">
                  {data.projectId.name}
                </h1>
              </div>

              {/* Details table */}
              <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[12px] text-muted-foreground w-24 shrink-0">Your Role</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${meta.cls}`}>
                    {data.role} · {meta.label}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[12px] text-muted-foreground w-24 shrink-0">Invited by</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-brand-primary/15 flex items-center justify-center
                      text-[9px] font-bold text-brand-primary select-none shrink-0">
                      {getInitials(data.invitedBy.name)}
                    </div>
                    <span className="text-[12px] font-medium text-foreground">{data.invitedBy.name}</span>
                  </div>
                </div>
                <div className="flex items-start justify-between px-4 py-3">
                  <span className="text-[12px] text-muted-foreground w-24 shrink-0 mt-0.5">Expires</span>
                  <span className="text-[12px] text-foreground text-right leading-relaxed">
                    {fmtExpiry(data.expiry)}
                  </span>
                </div>
              </div>

              {/* Action section */}
              {!user ? (
                /* Not logged in */
                <div className="space-y-3 pt-1">
                  <p className="text-[12px] text-muted-foreground text-center">
                    Log in to accept or decline this invitation.
                  </p>
                  <Link
                    to={loginHref}
                    className="flex items-center justify-center gap-2 w-full py-[11px] rounded-xl
                      bg-brand-primary text-white text-[13px] font-semibold
                      hover:opacity-90 transition-opacity"
                  >
                    Log in to Continue <FaArrowRight size={11} />
                  </Link>
                  <Link
                    to={registerHref}
                    className="flex items-center justify-center w-full py-[10px] rounded-xl
                      border border-border/60 text-foreground/70 text-[13px] font-medium
                      hover:bg-bg-surface hover:text-foreground transition-all"
                  >
                    Create an Account
                  </Link>
                </div>
              ) : wantDecline ? (
                /* Decline-first layout (clicked "Decline" in email) */
                <div className="space-y-2.5 pt-1">
                  <button
                    onClick={() => declineMut.mutate()}
                    disabled={isActing}
                    className="w-full flex items-center justify-center gap-2 py-[11px] rounded-xl
                      bg-status-danger text-white text-[13px] font-semibold
                      hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {declineMut.isPending
                      ? <><FaCircleNotch size={12} className="animate-spin" /> Declining…</>
                      : 'Decline Invitation'
                    }
                  </button>
                  <button
                    onClick={() => acceptMut.mutate()}
                    disabled={isActing}
                    className="w-full flex items-center justify-center gap-2 py-[10px] rounded-xl
                      border border-border/60 text-foreground/70 text-[13px] font-medium
                      hover:bg-bg-surface hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {acceptMut.isPending
                      ? <><FaCircleNotch size={12} className="animate-spin" /> Joining…</>
                      : 'Accept Instead'
                    }
                  </button>
                </div>
              ) : (
                /* Default: Accept-first layout */
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => acceptMut.mutate()}
                    disabled={isActing}
                    className="flex-1 flex items-center justify-center gap-1.5
                      py-[11px] rounded-xl bg-brand-primary text-white
                      text-[13px] font-semibold hover:opacity-90
                      disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {acceptMut.isPending
                      ? <><FaCircleNotch size={12} className="animate-spin" /> Joining…</>
                      : 'Accept Invitation'
                    }
                  </button>
                  <button
                    onClick={() => declineMut.mutate()}
                    disabled={isActing}
                    className="flex-1 flex items-center justify-center gap-1.5
                      py-[11px] rounded-xl border border-border/60
                      text-foreground/70 text-[13px] font-medium
                      hover:bg-bg-surface hover:text-foreground
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {declineMut.isPending
                      ? <><FaCircleNotch size={12} className="animate-spin" /> Declining…</>
                      : 'Decline'
                    }
                  </button>
                </div>
              )}

              {/* Signed-in context */}
              {user && (
                <p className="text-[11px] text-muted-foreground/40 text-center">
                  Signed in as <span className="text-muted-foreground/70">{user.email}</span>
                </p>
              )}

            </div>
          </Card>
        )}

      </main>
    </div>
  )
}
