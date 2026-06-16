import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FaExchangeAlt, FaPlus, FaCheck, FaTimes, FaCircleNotch,
} from 'react-icons/fa'
import useAuthStore from '@/stores/authStore'
import {
  listCRs, submitCR, approveCR, cancelCR, rejectCR,
} from '@/features/changeRequest/services/changeRequestService'
import { useProjectCtx } from '../context'
import { projectKeys } from '../queryKeys'

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const STATUS_FILTERS = [
  { value: 'all',      label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const STATUS_META = {
  pending:  { label: 'Pending',  cls: 'bg-status-warning/10 text-status-warning border-status-warning/20' },
  approved: { label: 'Approved', cls: 'bg-status-success/10 text-status-success border-status-success/20' },
  rejected: { label: 'Rejected', cls: 'bg-status-danger/10 text-status-danger border-status-danger/20' },
}

const ROLE_LABEL = { PM: 'Manager', FE: 'Frontend', BE: 'Backend' }

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const extractProposedText = (proposedChanges) => {
  if (!proposedChanges) return ''
  if (typeof proposedChanges === 'string') return proposedChanges
  if (proposedChanges.text) return proposedChanges.text
  return JSON.stringify(proposedChanges, null, 2)
}

/* ─── Shared modal backdrop/card ─────────────────────────────────────────────── */
function ModalShell({ onClose, maxWidth = 'max-w-lg', children }) {
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
        className={`w-full ${maxWidth} rounded-2xl border border-border/50 bg-background shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ─── SubmitCRModal ─────────────────────────────────────────────────────────── */
function SubmitCRModal({ onClose }) {
  const { project } = useProjectCtx()
  const queryClient = useQueryClient()
  const [description, setDescription] = useState('')
  const [changes,     setChanges]     = useState('')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => submitCR(project._id, {
      description,
      proposedChanges: { text: changes.trim() },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id, 'changeRequests'] })
      toast.success('Change request submitted. The PM will be notified.')
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to submit change request.')
    },
  })

  const descLen   = description.length
  const canSubmit = descLen >= 10 && descLen <= 500 && changes.trim().length > 0

  return (
    <ModalShell onClose={onClose}>
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
              <FaExchangeAlt size={12} className="text-brand-primary" />
            </div>
            <h2 className="font-heading font-bold text-[17px] text-foreground">
              Submit Change Request
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
            <FaTimes size={12} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12.5px] font-medium text-foreground">
                Description <span className="text-status-danger">*</span>
              </label>
              <span className={`text-[11px] ${descLen > 500 ? 'text-status-danger' : 'text-muted-foreground/50'}`}>
                {descLen}/500
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe why this change is needed…"
              rows={3}
              className="w-full px-3.5 py-3 rounded-xl text-sm text-foreground resize-none
                bg-background border border-border/60 placeholder:text-muted-foreground/30
                focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50
                transition-all duration-150"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-foreground mb-1">
              Proposed Changes <span className="text-status-danger">*</span>
            </label>
            <p className="text-[11.5px] text-muted-foreground/60 mb-2">
              Describe the specific changes you need — endpoint path, method, response format, fields, etc.
            </p>
            <textarea
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="e.g. Add a 404 response to GET /users/:id, returning { error: 'User not found' }"
              rows={5}
              className="w-full px-3.5 py-3 rounded-xl text-sm text-foreground resize-none
                bg-background border border-border/60 placeholder:text-muted-foreground/30
                focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50
                transition-all duration-150"
            />
          </div>
        </div>

        <div className="flex gap-2.5 mt-5">
          <button type="button" onClick={onClose} disabled={mutation.isPending}
            className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
              text-muted-foreground hover:text-foreground hover:bg-bg-surface
              disabled:opacity-40 transition-all duration-150">
            Cancel
          </button>
          <button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}
            className="flex-1 py-[10px] rounded-xl bg-brand-primary text-white text-sm font-semibold
              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150">
            {mutation.isPending ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ─── CancelCRModal ─────────────────────────────────────────────────────────── */
function CancelCRModal({ cr, onClose }) {
  const { project } = useProjectCtx()
  const queryClient = useQueryClient()

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => cancelCR(project._id, cr._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id, 'changeRequests'] })
      toast.success('Change request cancelled.')
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to cancel.')
    },
  })

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-status-warning/10 flex items-center justify-center">
              <FaTimes size={12} className="text-status-warning" />
            </div>
            <h2 className="font-heading font-bold text-[17px] text-foreground">Cancel Request</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
            <FaTimes size={12} />
          </button>
        </div>

        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Cancel your change request? This action is permanent and cannot be undone.
        </p>
        <p className="mt-2 text-[12px] text-muted-foreground/60 italic line-clamp-2">
          "{cr.description}"
        </p>

        <div className="flex gap-2.5 mt-5">
          <button type="button" onClick={onClose} disabled={mutation.isPending}
            className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
              text-muted-foreground hover:text-foreground hover:bg-bg-surface
              disabled:opacity-40 transition-all duration-150">
            Keep it
          </button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="flex-1 py-[10px] rounded-xl bg-status-warning text-white text-sm font-semibold
              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150">
            {mutation.isPending ? 'Cancelling…' : 'Yes, Cancel Request'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ─── RejectCRModal ─────────────────────────────────────────────────────────── */
function RejectCRModal({ cr, onClose }) {
  const { project } = useProjectCtx()
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () =>
      rejectCR(project._id, cr._id, reason.trim() ? { reason: reason.trim() } : {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id, 'changeRequests'] })
      toast.success('Change request rejected.')
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to reject change request.')
    },
  })

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-md">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-status-danger/10 flex items-center justify-center">
              <FaTimes size={12} className="text-status-danger" />
            </div>
            <h2 className="font-heading font-bold text-[17px] text-foreground">Reject Request</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
            <FaTimes size={12} />
          </button>
        </div>

        <p className="text-[13px] text-muted-foreground mb-4">
          Rejecting the request from{' '}
          <span className="font-semibold text-foreground">{cr.submittedBy?.name}</span>.
          They will be notified via email.
        </p>

        <div>
          <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
            Reason{' '}
            <span className="text-muted-foreground/50 font-normal">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this request is being rejected…"
            rows={4}
            maxLength={500}
            className="w-full px-3.5 py-3 rounded-xl text-sm text-foreground resize-none
              bg-background border border-border/60 placeholder:text-muted-foreground/30
              focus:outline-none focus:ring-2 focus:ring-status-danger/15 focus:border-status-danger/50
              transition-all duration-150"
          />
        </div>

        <div className="flex gap-2.5 mt-5">
          <button type="button" onClick={onClose} disabled={mutation.isPending}
            className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
              text-muted-foreground hover:text-foreground hover:bg-bg-surface
              disabled:opacity-40 transition-all duration-150">
            Cancel
          </button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="flex-1 py-[10px] rounded-xl bg-status-danger text-white text-sm font-semibold
              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150">
            {mutation.isPending ? 'Rejecting…' : 'Reject Request'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ─── CRDetailModal ─────────────────────────────────────────────────────────── */
function CRDetailModal({ cr, onClose, onReject, onCancel }) {
  const { project, myRole, membersQuery } = useProjectCtx()
  const authUser    = useAuthStore(s => s.user)
  const queryClient = useQueryClient()

  const isMine       = cr.submittedBy?._id === authUser?._id
  const meta         = STATUS_META[cr.status] ?? STATUS_META.pending
  const proposedText = extractProposedText(cr.proposedChanges)

  const submitterRole = useMemo(() => {
    const members = membersQuery.data ?? []
    const found   = members.find(m => m.user._id === cr.submittedBy?._id)
    return found?.role ?? null
  }, [membersQuery.data, cr.submittedBy?._id])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const approveMut = useMutation({
    mutationFn: () => approveCR(project._id, cr._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id, 'changeRequests'] })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(project._id) })
      toast.success('Approved! Contract version bumped and team notified.')
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to approve.')
    },
  })

  return (
    <ModalShell onClose={onClose}>
      <div className="px-6 py-5 max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.cls}`}>
                {meta.label}
              </span>
              <span className="text-[11px] text-muted-foreground/50">{fmtDate(cr.createdAt)}</span>
            </div>
            <h2 className="font-heading font-bold text-[17px] text-foreground">Change Request</h2>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
            <FaTimes size={12} />
          </button>
        </div>

        {/* Submitter */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border/50">
          <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center
            text-[12px] font-bold text-brand-primary shrink-0 select-none">
            {getInitials(cr.submittedBy?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-[13px] text-foreground">
                {cr.submittedBy?.name}
              </span>
              {isMine && (
                <span className="text-[10px] text-brand-primary/60">(you)</span>
              )}
              {submitterRole && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md
                  bg-bg-surface text-muted-foreground border border-border/60">
                  {ROLE_LABEL[submitterRole] ?? submitterRole}
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {cr.submittedBy?.email}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2">
            Description
          </p>
          <p className="text-[13px] text-foreground/80 leading-relaxed">{cr.description}</p>
        </div>

        {/* Proposed changes */}
        {proposedText && (
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2">
              Proposed Changes
            </p>
            <pre className="px-3.5 py-3 rounded-xl bg-bg-surface border border-border/60
              text-[12px] text-foreground/80 whitespace-pre-wrap break-words font-mono
              leading-relaxed max-h-52 overflow-y-auto">
              {proposedText}
            </pre>
          </div>
        )}

        {/* Review info */}
        {cr.status !== 'pending' && cr.reviewedBy && (
          <div className={[
            'mb-4 px-3.5 py-3 rounded-xl border',
            cr.status === 'approved'
              ? 'border-status-success/20 bg-status-success/5'
              : 'border-status-danger/20 bg-status-danger/5',
          ].join(' ')}>
            <div className={`flex items-center gap-1.5 text-[12px] font-medium ${
              cr.status === 'approved' ? 'text-status-success' : 'text-status-danger'
            }`}>
              {cr.status === 'approved' ? <FaCheck size={10} /> : <FaTimes size={10} />}
              <span>
                {cr.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                <span className="font-semibold">{cr.reviewedBy?.name}</span>
                {cr.reviewedAt && ` · ${fmtDate(cr.reviewedAt)}`}
              </span>
            </div>
            {cr.status === 'rejected' && cr.rejectionReason && (
              <p className="mt-1.5 text-[12px] text-muted-foreground italic leading-relaxed">
                "{cr.rejectionReason}"
              </p>
            )}
          </div>
        )}

        {/* Action buttons — pending only */}
        {cr.status === 'pending' && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/40">
            {myRole === 'PM' && (
              <>
                <button
                  onClick={() => onReject(cr)}
                  disabled={approveMut.isPending}
                  className="flex items-center gap-1.5 px-3.5 py-[9px] rounded-xl text-[12.5px]
                    font-medium border border-border text-muted-foreground
                    hover:text-status-danger hover:border-status-danger/40
                    disabled:opacity-40 transition-all duration-150"
                >
                  <FaTimes size={10} />
                  Reject
                </button>
                <button
                  onClick={() => approveMut.mutate()}
                  disabled={approveMut.isPending}
                  className="flex items-center gap-1.5 px-3.5 py-[9px] rounded-xl text-[12.5px]
                    font-semibold bg-status-success text-white
                    hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                >
                  {approveMut.isPending
                    ? <><FaCircleNotch size={10} className="animate-spin" /> Approving…</>
                    : <><FaCheck size={10} /> Approve</>
                  }
                </button>
              </>
            )}

            {myRole !== 'PM' && isMine && (
              <button
                onClick={() => onCancel(cr)}
                className="flex items-center gap-1.5 px-3.5 py-[9px] rounded-xl text-[12.5px]
                  font-medium border border-border text-muted-foreground
                  hover:text-status-danger hover:border-status-danger/40 transition-all duration-150"
              >
                <FaTimes size={10} />
                Cancel Request
              </button>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  )
}

/* ─── CRCard (compact, clickable) ────────────────────────────────────────────── */
function CRCard({ cr, onClick }) {
  const { membersQuery } = useProjectCtx()

  const meta = STATUS_META[cr.status] ?? STATUS_META.pending

  const submitterRole = useMemo(() => {
    const members = membersQuery.data ?? []
    const found   = members.find(m => m.user._id === cr.submittedBy?._id)
    return found?.role ?? null
  }, [membersQuery.data, cr.submittedBy?._id])

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border/60 bg-background
        hover:border-border hover:bg-bg-surface/30 transition-all duration-150 cursor-pointer"
    >
      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center
          text-[12px] font-bold text-brand-primary shrink-0 select-none">
          {getInitials(cr.submittedBy?.name)}
        </div>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium text-[13px] text-foreground truncate">
              {cr.submittedBy?.name}
            </span>
            {submitterRole && (
              <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md
                bg-bg-surface text-muted-foreground border border-border/60">
                {ROLE_LABEL[submitterRole] ?? submitterRole}
              </span>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground/80 truncate">
            {cr.description}
          </p>
        </div>

        {/* Status + date */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.cls}`}>
            {meta.label}
          </span>
          <span className="text-[11px] text-muted-foreground/50">{fmtDate(cr.createdAt)}</span>
        </div>
      </div>
    </motion.button>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-[860px]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-7 w-48 rounded-lg bg-bg-surface animate-pulse mb-1.5" />
          <div className="h-4 w-36 rounded-md bg-bg-surface animate-pulse" />
        </div>
      </div>
      <div className="flex gap-1 mb-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-7 w-20 rounded-lg bg-bg-surface animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[72px] rounded-xl bg-bg-surface animate-pulse" />
        ))}
      </div>
    </div>
  )
}

/* ─── Main panel ─────────────────────────────────────────────────────────────── */
export default function ChangeRequestsPanel() {
  const { project, myRole } = useProjectCtx()

  const [statusFilter,  setStatusFilter]  = useState('all')
  const [showSubmit,    setShowSubmit]    = useState(false)
  const [viewingCR,     setViewingCR]     = useState(null)
  const [rejectingCR,   setRejectingCR]   = useState(null)
  const [cancellingCR,  setCancellingCR]  = useState(null)

  const { data: crs = [], isLoading } = useQuery({
    queryKey: projectKeys.changeRequests(project._id, statusFilter),
    queryFn: () => {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {}
      return listCRs(project._id, params).then(r => r.data.data.data ?? [])
    },
    staleTime: 30_000,
  })

  const pendingCount = crs.filter(cr => cr.status === 'pending').length

  if (isLoading) return <Skeleton />

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-[860px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
            Change Requests
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {crs.length === 0
              ? 'No change requests'
              : `${crs.length} request${crs.length !== 1 ? 's' : ''}${
                  pendingCount > 0 ? ` · ${pendingCount} pending review` : ''
                }`}
          </p>
        </div>

        {/* Submit button — FE/BE only */}
        {myRole !== 'PM' && (
          <button
            onClick={() => setShowSubmit(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl
              bg-brand-primary text-white text-[12.5px] font-semibold
              hover:opacity-90 transition-all duration-150"
          >
            <FaPlus size={10} />
            Submit Request
          </button>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 mb-5 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={[
              'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150',
              statusFilter === f.value
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-bg-surface',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {crs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-bg-surface flex items-center justify-center mb-4">
            <FaExchangeAlt size={20} className="text-muted-foreground/30" />
          </div>
          <h3 className="font-medium text-foreground mb-1">No change requests</h3>
          <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed">
            {statusFilter !== 'all'
              ? `No ${statusFilter} change requests found.`
              : myRole === 'PM'
                ? 'Team members can submit change requests to propose API updates.'
                : 'Submit a change request to propose API changes to the PM.'
            }
          </p>
        </div>
      ) : (
        <motion.div layout className="space-y-2">
          <AnimatePresence mode="popLayout">
            {crs.map(cr => (
              <CRCard
                key={cr._id}
                cr={cr}
                onClick={() => setViewingCR(cr)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showSubmit && <SubmitCRModal onClose={() => setShowSubmit(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {viewingCR && (
          <CRDetailModal
            cr={viewingCR}
            onClose={() => setViewingCR(null)}
            onReject={(cr) => { setViewingCR(null); setRejectingCR(cr) }}
            onCancel={(cr) => { setViewingCR(null); setCancellingCR(cr) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rejectingCR && (
          <RejectCRModal cr={rejectingCR} onClose={() => setRejectingCR(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cancellingCR && (
          <CancelCRModal cr={cancellingCR} onClose={() => setCancellingCR(null)} />
        )}
      </AnimatePresence>

    </div>
  )
}
