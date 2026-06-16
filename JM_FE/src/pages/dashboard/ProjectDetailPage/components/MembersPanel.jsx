import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FaUserPlus, FaChevronDown, FaTimes, FaCrown, FaUsers, FaSignOutAlt, FaTrash,
} from 'react-icons/fa'
import InfoTooltip from '@/shared/components/InfoTooltip'
import useAuthStore from '@/stores/authStore'
import { updateMemberRole, transferOwnership } from '@/features/member/services/memberService'
import { useProjectCtx } from '../context'
import { projectKeys } from '../queryKeys'
import InviteMemberModal from './InviteMemberModal'
import PendingInvitations from './PendingInvitations'
import LeaveProjectModal from './LeaveProjectModal'
import DeleteProjectModal from './DeleteProjectModal'
import RemoveMemberModal from './RemoveMemberModal'

const ROLE_LABEL = { PM: 'Manager', FE: 'Frontend', BE: 'Backend' }
const ROLE_BADGE = {
  PM: 'bg-brand-primary/10 text-brand-primary',
  FE: 'bg-status-success/10 text-status-success',
  BE: 'bg-blue-500/10 text-blue-500',
}
// PM (kuota 1 per project), FE, BE bisa diberikan ke member.
// Jika promote ke PM: auto-demote PM lama ke FE (ditangani backend).
const CHANGEABLE_ROLES = ['FE', 'BE', 'PM']

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'

function MemberRow({ member, isMe }) {
  const { project, myRole } = useProjectCtx()
  const authUser            = useAuthStore(s => s.user)
  const queryClient         = useQueryClient()
  const memKey              = projectKeys.members(project._id)

  const [roleMenuOpen,    setRoleMenuOpen]    = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  const roleMutation = useMutation({
    mutationFn: (newRole) => updateMemberRole(project._id, member.user._id, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memKey })
      toast.success('Role updated.')
      setRoleMenuOpen(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to update role.')
    },
  })

  const transferMutation = useMutation({
    mutationFn: () => transferOwnership(project._id, member.user._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memKey })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(project._id) })
      toast.success(`Ownership transferred to ${member.user.name}.`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to transfer ownership.')
    },
  })

  const isPM          = myRole === 'PM'
  const iAmTrueOwner  = project.ownerId?._id?.toString() === authUser?._id?.toString()
  const isOwner       = member.isOwner
  const canActOn      = isPM && !isOwner

  return (
    <>
    <div className="flex items-center gap-3 py-3">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center
        text-[12px] font-semibold text-brand-primary shrink-0 relative">
        {getInitials(member.user.name)}
        {isOwner && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full
            bg-status-warning/15 flex items-center justify-center">
            <FaCrown size={7} className="text-status-warning" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-foreground truncate">
          {member.user.name}
          {isMe && <span className="ml-1.5 text-[10px] text-brand-primary/70">(You)</span>}
          {isOwner && <span className="ml-1.5 text-[10px] text-status-warning/70">(owner)</span>}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">{member.user.email}</div>
      </div>

      {/* Role badge or dropdown */}
      {canActOn ? (
        <div className="relative shrink-0">
          <button
            onClick={() => setRoleMenuOpen(v => !v)}
            disabled={roleMutation.isPending}
            className={[
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold',
              'border border-transparent hover:border-border transition-all duration-150',
              ROLE_BADGE[member.role] ?? 'bg-bg-surface text-muted-foreground',
            ].join(' ')}
          >
            {ROLE_LABEL[member.role] ?? member.role}
            <FaChevronDown size={8} />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-border
              bg-background shadow-lg py-1">
              {CHANGEABLE_ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => roleMutation.mutate(r)}
                  disabled={roleMutation.isPending || r === member.role}
                  className={[
                    'w-full flex items-center justify-between px-3 py-1.5 text-[12px]',
                    'hover:bg-bg-surface transition-colors',
                    r === member.role ? 'opacity-40 cursor-default' : 'cursor-pointer',
                  ].join(' ')}
                >
                  <span>{ROLE_LABEL[r]}</span>
                  {r === member.role && (
                    <span className="text-[10px] text-muted-foreground">current</span>
                  )}
                  {r === 'PM' && member.role !== 'PM' && (
                    <span className="text-[9px] text-status-warning/60">Previous PM → FE</span>
                  )}
                </button>
              ))}
              <div className="my-1 border-t border-border/60" />
              {iAmTrueOwner && (
                <button
                  onClick={() => {
                    setRoleMenuOpen(false)
                    if (window.confirm(`Make ${member.user.name} the new owner? You will be downgraded to FE member.`)) {
                      transferMutation.mutate()
                    }
                  }}
                  disabled={transferMutation.isPending}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px]
                    text-status-warning/80 hover:bg-status-warning/8 transition-colors"
                >
                  <FaCrown size={9} />
                  Transfer Ownership
                </button>
              )}
              <button
                onClick={() => {
                  setRoleMenuOpen(false)
                  setShowRemoveModal(true)
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px]
                  text-status-danger/80 hover:bg-status-danger/8 transition-colors"
              >
                <FaTimes size={9} />
                Remove Member
              </button>
            </div>
          )}
        </div>
      ) : (
        <span className={[
          'shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold',
          ROLE_BADGE[member.role] ?? 'bg-bg-surface text-muted-foreground',
        ].join(' ')}>
          {ROLE_LABEL[member.role] ?? member.role}
        </span>
      )}
    </div>

    <AnimatePresence>
      {showRemoveModal && (
        <RemoveMemberModal
          member={member}
          onClose={() => setShowRemoveModal(false)}
        />
      )}
    </AnimatePresence>
    </>
  )
}

export default function MembersPanel() {
  const { project, myRole, membersQuery, invitationsQuery } = useProjectCtx()
  const authUser = useAuthStore(s => s.user)
  const members  = membersQuery.data ?? []

  const [showInvite, setShowInvite] = useState(false)
  const [showLeave,  setShowLeave]  = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const hasPendingInvitations = (invitationsQuery.data?.invitations?.length ?? 0) > 0

  // iAmTrueOwner: hanya true untuk pemilik project sesungguhnya (bukan sekadar PM member)
  const iAmTrueOwner = project.ownerId?._id?.toString() === authUser?._id?.toString()
  // Kandidat penerus untuk owner yang ingin keluar = semua member selain diri sendiri
  const candidates = members.filter(m => m.user._id !== authUser?._id)
  // Tampilkan tombol keluar hanya jika user memang anggota project ini
  const isMember   = members.some(m => m.user._id === authUser?._id)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaUsers size={16} className="text-muted-foreground/50" />
          <h2 className="font-heading font-bold text-[17px] text-foreground">Members</h2>
          <span className="text-[12px] text-muted-foreground/50 font-medium">
            ({members.length}/10)
          </span>
          <InfoTooltip content="Manage your project's members and roles. PM can invite new members, change roles, and transfer ownership. Each project can have at most 1 PM at a time." />
        </div>

        <div className="flex items-center gap-2">
          {isMember && (
            iAmTrueOwner && candidates.length === 0 ? (
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold
                  border border-status-danger/30 text-status-danger
                  hover:bg-status-danger/8 transition-all duration-150"
              >
                <FaTrash size={10} />
                Delete Project
              </button>
            ) : (
              <button
                onClick={() => setShowLeave(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-semibold
                  border border-status-danger/30 text-status-danger
                  hover:bg-status-danger/8 transition-all duration-150"
              >
                <FaSignOutAlt size={10} />
                Leave
              </button>
            )
          )}
          {myRole === 'PM' && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                bg-brand-primary text-white text-[12.5px] font-semibold
                hover:opacity-90 transition-all duration-150"
            >
              <FaUserPlus size={10} />
              Invite
            </button>
          )}
        </div>
      </div>

      {/* Members list */}
      <div className="divide-y divide-border/50 mb-8">
        {members.map(m => (
          <MemberRow key={m.user._id} member={m} isMe={m.user._id === authUser?._id} />
        ))}
      </div>

      {/* Pending invitations — PM only */}
      {myRole === 'PM' && hasPendingInvitations && (
        <PendingInvitations />
      )}

      {/* Modals */}
      <AnimatePresence>
        {showInvite && <InviteMemberModal onClose={() => setShowInvite(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showLeave && (
          <LeaveProjectModal
            isOwner={iAmTrueOwner}
            candidates={candidates}
            onClose={() => setShowLeave(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDelete && <DeleteProjectModal onClose={() => setShowDelete(false)} />}
      </AnimatePresence>
    </div>
  )
}
