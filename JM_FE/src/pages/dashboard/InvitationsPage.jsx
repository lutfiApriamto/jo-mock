import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaBell, FaCircleNotch, FaCheck, FaTimes, FaUserPlus } from 'react-icons/fa'
import {
  getMyInvitations,
  acceptInvitationById,
  declineInvitationById,
} from '@/features/invitation/services/invitationService'

/* ─── Query key ─────────────────────────────────────────────────────────── */
export const INVITATIONS_KEY = ['invitations', 'mine']

/* ─── Constants ──────────────────────────────────────────────────────────── */
const ROLE_META = {
  PM: { label: 'Project Manager',    cls: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' },
  FE: { label: 'Frontend Developer', cls: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' },
  BE: { label: 'Backend Developer',  cls: 'bg-status-success/10 text-status-success border-status-success/20' },
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function daysUntil(isoDate) {
  const diff = new Date(isoDate) - Date.now()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (diff <= 0)  return { label: 'Expired',         urgent: true }
  if (days === 0) return { label: 'Expires today',    urgent: true }
  if (days === 1) return { label: 'Expires in 1 day', urgent: true }
  return { label: `Expires in ${days} days`, urgent: false }
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-[860px]">
      <div className="mb-6">
        <div className="h-7 w-36 rounded-lg bg-bg-surface animate-pulse mb-1.5" />
        <div className="h-4 w-52 rounded-md bg-bg-surface animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[88px] rounded-xl bg-bg-surface animate-pulse" />
        ))}
      </div>
    </div>
  )
}

/* ─── Invitation card ────────────────────────────────────────────────────── */
function InvitationCard({ inv, onAccept, onDecline, actingId }) {
  const meta        = ROLE_META[inv.role] ?? ROLE_META.FE
  const expiry      = daysUntil(inv.expiry)
  const isAccepting = actingId === inv._id + ':accept'
  const isDeclining = actingId === inv._id + ':decline'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-4 p-4 rounded-xl border border-border/50
        bg-background hover:border-border transition-colors duration-150"
    >
      {/* Avatar initials */}
      <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center
        text-[12px] font-bold text-brand-primary select-none shrink-0">
        {getInitials(inv.invitedBy?.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[13px] text-foreground truncate">
            {inv.projectId?.name ?? '—'}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${meta.cls}`}>
            {inv.role}
          </span>
        </div>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Invited by <span className="text-foreground/70">{inv.invitedBy?.name}</span>
          {' · '}
          <span className={expiry.urgent ? 'text-status-warning' : 'text-muted-foreground/60'}>
            {expiry.label}
          </span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onDecline(inv._id)}
          disabled={!!actingId}
          title="Decline"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/60
            text-muted-foreground/60 hover:text-status-danger hover:border-status-danger/40
            disabled:opacity-40 transition-all duration-150"
        >
          {isDeclining
            ? <FaCircleNotch size={11} className="animate-spin" />
            : <FaTimes size={11} />
          }
        </button>
        <button
          onClick={() => onAccept(inv._id)}
          disabled={!!actingId}
          title="Accept"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
            bg-brand-primary text-white text-[12px] font-semibold
            hover:opacity-90 disabled:opacity-40 transition-opacity duration-150"
        >
          {isAccepting
            ? <FaCircleNotch size={11} className="animate-spin" />
            : <FaCheck size={10} />
          }
          Accept
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function InvitationsPage() {
  const queryClient = useQueryClient()
  const navigate    = useNavigate()

  // Track which invitation is currently being acted on: `id:accept` or `id:decline`
  const [actingId, setActingId] = useState(null)

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: INVITATIONS_KEY,
    queryFn:  () => getMyInvitations().then(r => r.data.data.data ?? []),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

  const acceptMut  = useMutation({ mutationFn: (id) => acceptInvitationById(id) })
  const declineMut = useMutation({ mutationFn: (id) => declineInvitationById(id) })

  const handleAccept = async (id) => {
    if (actingId) return
    setActingId(id + ':accept')
    const tid = toast.loading('Accepting invitation…')
    try {
      const res = await acceptMut.mutateAsync(id)
      const d   = res.data.data.data
      queryClient.setQueryData(INVITATIONS_KEY, (old = []) => old.filter(i => i._id !== id))
      toast.success(`Joined "${d?.projectName}"!`, { id: tid })
      navigate(`/dashboard/projects/${d?.projectId}?tab=members`)
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to accept invitation.', { id: tid })
    } finally {
      setActingId(null)
    }
  }

  const handleDecline = async (id) => {
    if (actingId) return
    setActingId(id + ':decline')
    const tid = toast.loading('Declining invitation…')
    try {
      await declineMut.mutateAsync(id)
      queryClient.setQueryData(INVITATIONS_KEY, (old = []) => old.filter(i => i._id !== id))
      toast.success('Invitation declined.', { id: tid })
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to decline invitation.', { id: tid })
    } finally {
      setActingId(null)
    }
  }

  if (isLoading) return <Skeleton />

  /* ── Empty state — full viewport width, centered ── */
  if (invitations.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-5 sm:p-6 lg:p-8 max-w-[860px]">
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
            Invitations
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">No pending invitations</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-16">
          <div className="w-14 h-14 rounded-2xl bg-bg-surface flex items-center justify-center mb-4">
            <FaBell size={20} className="text-muted-foreground/30" />
          </div>
          <h3 className="font-medium text-foreground mb-1.5">No pending invitations</h3>
          <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed">
            When someone invites you to a project, it will appear here so you can accept or decline.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-[860px]">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
          Invitations
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''} waiting for your response
        </p>
      </div>

      {/* List */}
      <motion.div layout className="space-y-3">
        <AnimatePresence mode="popLayout">
          {invitations.map(inv => (
            <InvitationCard
              key={inv._id}
              inv={inv}
              onAccept={handleAccept}
              onDecline={handleDecline}
              actingId={actingId}
            />
          ))}
        </AnimatePresence>
      </motion.div>

    </div>
  )
}

