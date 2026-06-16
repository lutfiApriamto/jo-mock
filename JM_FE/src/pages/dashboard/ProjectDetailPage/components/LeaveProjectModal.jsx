import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes, FaSignOutAlt, FaCrown } from 'react-icons/fa'
import { leaveProject } from '@/features/member/services/memberService'
import { useProjectCtx } from '../context'

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?'

// candidates: daftar member selain diri sendiri (untuk owner memilih penerus)
export default function LeaveProjectModal({ isOwner, candidates = [], onClose }) {
  const { project } = useProjectCtx()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [newOwnerId, setNewOwnerId] = useState('')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => leaveProject(project._id, isOwner ? newOwnerId : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('You have left the project.')
      navigate('/dashboard')
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to leave project.')
    },
  })

  // Owner tanpa kandidat penerus tidak bisa keluar
  const noCandidates  = isOwner && candidates.length === 0
  const canSubmit     = isOwner ? !!newOwnerId : true

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md rounded-2xl border border-border/50 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-status-danger/10 flex items-center justify-center">
                <FaSignOutAlt size={13} className="text-status-danger" />
              </div>
              <h2 className="font-heading font-bold text-[17px] text-foreground">Leave Project</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              <FaTimes size={12} />
            </button>
          </div>

          {isOwner ? (
            noCandidates ? (
              <p className="text-[13px] text-muted-foreground">
                You are the owner and there are no other members. Invite members first so one can become
                the new owner, or delete this project entirely.
              </p>
            ) : (
              <>
                <p className="text-[13px] text-muted-foreground mb-4">
                  As the owner, you must transfer ownership of{' '}
                  <span className="font-semibold text-foreground">{project?.name}</span>{' '}
                  to another member before leaving. The selected member will become the new owner (PM).
                </p>

                <label className="block text-[12.5px] font-medium text-foreground/65 mb-2">
                  Select new owner
                </label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {candidates.map(m => (
                    <label
                      key={m.user._id}
                      className={[
                        'flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-150',
                        newOwnerId === m.user._id
                          ? 'border-brand-primary/40 bg-brand-primary/5'
                          : 'border-border/60 hover:border-border hover:bg-bg-surface',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="newOwner"
                        value={m.user._id}
                        checked={newOwnerId === m.user._id}
                        onChange={() => setNewOwnerId(m.user._id)}
                        className="accent-brand-primary"
                      />
                      <div className="w-7 h-7 rounded-full bg-brand-primary/10 flex items-center justify-center
                        text-[11px] font-semibold text-brand-primary shrink-0">
                        {getInitials(m.user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-foreground truncate">{m.user.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{m.user.email}</div>
                      </div>
                      {newOwnerId === m.user._id && (
                        <FaCrown size={11} className="text-status-warning shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
              </>
            )
          ) : (
            <p className="text-[13px] text-muted-foreground">
              You will leave{' '}
              <span className="font-semibold text-foreground">{project?.name}</span>.
              You will lose access until you are invited again.
            </p>
          )}

          <div className="flex gap-2.5 mt-5">
            <button type="button" onClick={onClose}
              className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
                text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              Cancel
            </button>
            {!noCandidates && (
              <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !canSubmit}
                className="flex-1 py-[10px] rounded-xl bg-status-danger text-white text-sm font-semibold
                  hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150">
                {mutation.isPending
                  ? 'Processing…'
                  : isOwner ? 'Transfer & Leave' : 'Leave Project'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
