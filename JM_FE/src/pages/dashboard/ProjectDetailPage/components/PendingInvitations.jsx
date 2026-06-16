import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FaRedo, FaTimes, FaEnvelope } from 'react-icons/fa'
import { resendInvitation, cancelInvitation } from '@/features/member/services/memberService'
import { useProjectCtx } from '../context'
import { projectKeys } from '../queryKeys'

const ROLE_LABEL = { PM: 'Manager', FE: 'Frontend', BE: 'Backend' }

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'

function InvitationRow({ invitation }) {
  const { project } = useProjectCtx()
  const queryClient = useQueryClient()
  const invKey      = projectKeys.invitations(project._id)

  const resendMutation = useMutation({
    mutationFn: () => resendInvitation(project._id, invitation._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invKey })
      toast.success(`Invitation resent to ${invitation.invitedUserId.name}.`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to resend.')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelInvitation(project._id, invitation._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invKey })
      toast.success('Invitation cancelled.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to cancel.')
    },
  })

  const daysLeft = Math.ceil(
    (new Date(invitation.expiry) - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl border border-border/50 bg-bg-surface/50">
      <div className="w-9 h-9 rounded-full bg-status-warning/10 flex items-center justify-center
        text-[11px] font-semibold text-status-warning shrink-0">
        {getInitials(invitation.invitedUserId?.name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-foreground truncate">
          {invitation.invitedUserId?.name}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {invitation.invitedUserId?.email}
          {' · '}
          <span className="text-status-warning">{ROLE_LABEL[invitation.role] ?? invitation.role}</span>
          {' · '}
          <span className={daysLeft <= 1 ? 'text-status-danger' : 'text-muted-foreground'}>
            {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending || cancelMutation.isPending}
          title="Resend invitation"
          className="w-7 h-7 flex items-center justify-center rounded-lg
            text-muted-foreground hover:text-foreground hover:bg-bg-surface
            disabled:opacity-40 transition-all duration-150"
        >
          <FaRedo size={10} />
        </button>
        <button
          onClick={() => cancelMutation.mutate()}
          disabled={cancelMutation.isPending || resendMutation.isPending}
          title="Cancel invitation"
          className="w-7 h-7 flex items-center justify-center rounded-lg
            text-status-danger/60 hover:text-status-danger hover:bg-status-danger/8
            disabled:opacity-40 transition-all duration-150"
        >
          <FaTimes size={10} />
        </button>
      </div>
    </div>
  )
}

export default function PendingInvitations() {
  const { invitationsQuery } = useProjectCtx()
  const payload = invitationsQuery.data

  if (!payload) return null

  const { invitations, availableSlots } = payload

  if (invitations.length === 0) return (
    <div className="text-center py-6">
      <FaEnvelope size={22} className="mx-auto mb-2 text-muted-foreground/20" />
      <p className="text-[12.5px] text-muted-foreground/50">No pending invitations.</p>
    </div>
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Pending Invitations
        </h3>
        <span className="text-[11px] text-muted-foreground/50">{availableSlots} slot{availableSlots !== 1 ? 's' : ''} available</span>
      </div>
      {invitations.map(inv => (
        <InvitationRow key={inv._id} invitation={inv} />
      ))}
    </div>
  )
}
