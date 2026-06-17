import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FaSearch, FaTimes, FaCircleNotch, FaEye, FaTrashAlt,
  FaSyncAlt, FaEdit, FaCopy,
  FaChevronLeft, FaChevronRight,
} from 'react-icons/fa'
import {
  listUsers, getUserDetail,
  updateQuotaLimit, resetQuota, deleteUser,
} from '@/features/admin/services/adminService'

/* ─── Constants & helpers ─────────────────────────────────────────────────── */
const PAGE_LIMIT = 10

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

/* ─── ModalShell ──────────────────────────────────────────────────────────── */
function ModalShell({ onClose, maxWidth = 'max-w-md', children }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

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

/* ─── UserDetailModal ─────────────────────────────────────────────────────── */
function UserDetailModal({ userId, onClose, onEditQuota, onResetQuota, onDelete }) {
  const { data: user, isPending } = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn:  () => getUserDetail(userId).then(r => r.data.data.data),
    staleTime: 15_000,
  })

  const copyApiKey = () => {
    if (!user?.apiKey) return
    navigator.clipboard.writeText(user.apiKey)
    toast.success('API key copied!')
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="p-5 sm:p-6">
        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <FaCircleNotch size={20} className="animate-spin text-brand-primary" />
          </div>
        ) : !user ? (
          <p className="text-sm text-muted-foreground text-center py-8">User not found.</p>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-primary/15 flex items-center justify-center
                  text-[13px] font-semibold text-brand-primary select-none shrink-0">
                  {getInitials(user.name)}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground text-[15px]">{user.name}</h3>
                  <p className="text-[12px] text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <FaTimes size={14} />
              </button>
            </div>

            {/* Info rows */}
            <div className="space-y-3 border-t border-border pt-4">
              <InfoRow label="Platform role">
                <RoleBadge role={user.role} />
              </InfoRow>
              <InfoRow label="Quota used">
                <span className="font-mono text-[13px]">
                  {(user.quota?.used ?? 0).toLocaleString()} / {(user.quota?.limit ?? 0).toLocaleString()}
                </span>
              </InfoRow>
              <InfoRow label="API key">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {user.apiKey ? `${user.apiKey.slice(0, 8)}...${user.apiKey.slice(-4)}` : '—'}
                  </span>
                  {user.apiKey && (
                    <button onClick={copyApiKey} title="Copy API key"
                      className="text-muted-foreground hover:text-brand-primary transition-colors">
                      <FaCopy size={11} />
                    </button>
                  )}
                </div>
              </InfoRow>
              <InfoRow label="Joined">{fmtDate(user.createdAt)}</InfoRow>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-border">
              <ActionBtn
                icon={FaEdit} label="Edit quota"
                cls="bg-status-warning/8 text-status-warning hover:bg-status-warning/15"
                onClick={() => { onClose(); onEditQuota(user) }}
              />
              <ActionBtn
                icon={FaSyncAlt} label="Reset quota"
                cls="bg-status-success/8 text-status-success hover:bg-status-success/15"
                onClick={() => { onClose(); onResetQuota(user) }}
              />
              <ActionBtn
                icon={FaTrashAlt} label="Delete"
                cls="bg-status-danger/8 text-status-danger hover:bg-status-danger/15"
                onClick={() => { onClose(); onDelete(user) }}
              />
            </div>
          </>
        )}
      </div>
    </ModalShell>
  )
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[13px] text-foreground">{children}</span>
    </div>
  )
}

function ActionBtn({ icon: Icon, label, cls, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px]
        font-medium transition-colors ${cls}`}
    >
      <Icon size={11} /> {label}
    </button>
  )
}

function RoleBadge({ role }) {
  const isSA = role === 'superadmin'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
      isSA
        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
        : 'bg-bg-surface text-muted-foreground border-border'
    }`}>
      {isSA ? 'Superadmin' : 'User'}
    </span>
  )
}

/* ─── EditQuotaModal ──────────────────────────────────────────────────────── */
function EditQuotaModal({ user, onClose }) {
  const [limit, setLimit] = useState(user.quota?.limit ?? 10000)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => updateQuotaLimit(user._id, limit),
    onMutate: () => toast.loading('Updating quota limit…', { id: 'edit-quota' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(`Quota limit for ${user.name} updated to ${limit.toLocaleString()}.`, { id: 'edit-quota' })
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to update quota.', { id: 'edit-quota' })
    },
  })

  return (
    <ModalShell onClose={onClose}>
      <div className="p-5 sm:p-6">
        <h3 className="font-heading font-bold text-foreground mb-1">Edit Quota Limit</h3>
        <p className="text-[13px] text-muted-foreground mb-4">
          Set a new API call limit for <strong className="text-foreground">{user.name}</strong>.
          Currently used: <span className="font-mono">{(user.quota?.used ?? 0).toLocaleString()}</span>.
        </p>
        <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">New limit</label>
        <input
          type="number"
          min={0}
          value={limit}
          onChange={(e) => setLimit(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg-surface
            text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold border border-border
              text-foreground hover:bg-bg-surface transition-colors">
            Cancel
          </button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-brand-primary text-white hover:bg-brand-hover transition-colors
              disabled:opacity-50 flex items-center justify-center gap-1.5">
            {mutation.isPending && <FaCircleNotch size={12} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ─── ResetQuotaModal ─────────────────────────────────────────────────────── */
function ResetQuotaModal({ user, onClose }) {
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => resetQuota(user._id),
    onMutate: () => toast.loading('Resetting quota…', { id: 'reset-quota' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success(`Quota for ${user.name} has been reset to 0.`, { id: 'reset-quota' })
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to reset quota.', { id: 'reset-quota' })
    },
  })

  return (
    <ModalShell onClose={onClose}>
      <div className="p-5 sm:p-6">
        <h3 className="font-heading font-bold text-foreground mb-2">Reset Quota</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Reset the API usage counter for <strong className="text-foreground">{user.name}</strong> back to 0?
          Current usage: <span className="font-mono">{(user.quota?.used ?? 0).toLocaleString()}</span> / {(user.quota?.limit ?? 0).toLocaleString()}.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold border border-border
              text-foreground hover:bg-bg-surface transition-colors">
            Cancel
          </button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-status-success text-white hover:bg-status-success/90 transition-colors
              disabled:opacity-50 flex items-center justify-center gap-1.5">
            {mutation.isPending && <FaCircleNotch size={12} className="animate-spin" />}
            Reset
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ─── DeleteUserModal ─────────────────────────────────────────────────────── */
function DeleteUserModal({ user, onClose }) {
  const [confirm, setConfirm] = useState('')
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteUser(user._id),
    onMutate: () => toast.loading('Deleting user…', { id: 'delete-user' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success(`User "${user.name}" has been deleted.`, { id: 'delete-user' })
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to delete user.', { id: 'delete-user' })
    },
  })

  const canDelete = confirm === user.name

  return (
    <ModalShell onClose={onClose}>
      <div className="p-5 sm:p-6">
        <h3 className="font-heading font-bold text-status-danger mb-2">Delete User</h3>
        <p className="text-sm text-muted-foreground mb-1">
          This will permanently delete <strong className="text-foreground">{user.name}</strong> and
          transfer all their owned projects to you (superadmin).
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Type <strong className="font-mono text-foreground">{user.name}</strong> to confirm.
        </p>
        <input
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={user.name}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg-surface
            text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-status-danger/30"
        />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold border border-border
              text-foreground hover:bg-bg-surface transition-colors">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canDelete || mutation.isPending}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-status-danger text-white hover:bg-status-danger/90 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {mutation.isPending && <FaCircleNotch size={12} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <div className="space-y-0 border border-border rounded-xl overflow-hidden">
      <div className="h-10 bg-bg-surface" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 border-t border-border animate-pulse">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-bg-surface" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 rounded bg-bg-surface" />
              <div className="h-2.5 w-40 rounded bg-bg-surface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function AdminUsersPage() {
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')

  const [viewingId, setViewingId]         = useState(null)
  const [editingQuota, setEditingQuota]   = useState(null)
  const [resettingQuota, setResettingQuota] = useState(null)
  const [deletingUser, setDeletingUser]   = useState(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(search.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isPending, isError } = useQuery({
    queryKey: ['admin', 'users', { page, q: debouncedQ }],
    queryFn:  () => listUsers({ page, limit: PAGE_LIMIT, q: debouncedQ || undefined })
      .then(r => ({ users: r.data.data.data, meta: r.data.data.meta })),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  })

  const users = data?.users ?? []
  const meta  = data?.meta ?? {}

  return (
    <div className="p-5 sm:p-6 space-y-5">
      {/* Header + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">Users</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Manage platform users and quotas.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-8 pr-8 py-2 rounded-xl border border-border bg-bg-surface
              text-sm text-foreground placeholder:text-muted-foreground/50
              focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <FaTimes size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {isPending && !data ? (
        <TableSkeleton />
      ) : isError ? (
        <p className="text-sm text-status-danger">Failed to load users.</p>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FaSearch size={24} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">No users found{debouncedQ ? ` matching "${debouncedQ}"` : ''}.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_2.5fr_1fr_1.5fr_auto] gap-2 px-4 py-2.5
              bg-bg-surface text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Quota</span>
              <span className="text-right pr-1">Actions</span>
            </div>
            {users.map((u) => (
              <div key={u._id}
                className="grid grid-cols-[2fr_2.5fr_1fr_1.5fr_auto] gap-2 px-4 py-3
                  border-t border-border items-center text-[13px] hover:bg-bg-surface/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/15 flex items-center justify-center
                    text-[10px] font-semibold text-brand-primary shrink-0 select-none">
                    {getInitials(u.name)}
                  </div>
                  <span className="font-medium text-foreground truncate">{u.name}</span>
                </div>
                <span className="text-muted-foreground truncate">{u.email}</span>
                <span><RoleBadge role={u.role} /></span>
                <QuotaCell quota={u.quota} />
                <div className="flex items-center justify-end gap-1">
                  <IconBtn title="View detail" onClick={() => setViewingId(u._id)}>
                    <FaEye size={13} />
                  </IconBtn>
                  <IconBtn title="Delete user" danger onClick={() => setDeletingUser(u)}>
                    <FaTrashAlt size={12} />
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u._id}
                className="border border-border rounded-xl p-4 bg-background space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-primary/15 flex items-center justify-center
                    text-[11px] font-semibold text-brand-primary shrink-0 select-none">
                    {getInitials(u.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-[14px] truncate">{u.name}</p>
                    <p className="text-[12px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">Quota</span>
                  <QuotaCell quota={u.quota} />
                </div>
                <div className="flex gap-2 pt-1 border-t border-border">
                  <button onClick={() => setViewingId(u._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                      text-[12px] font-medium text-brand-primary bg-brand-primary/8
                      hover:bg-brand-primary/15 transition-colors">
                    <FaEye size={11} /> Detail
                  </button>
                  <button onClick={() => setDeletingUser(u)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg
                      text-[12px] font-medium text-status-danger bg-status-danger/8
                      hover:bg-status-danger/15 transition-colors">
                    <FaTrashAlt size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-[12px] text-muted-foreground">
                Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={!meta.hasPrevPage}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border
                    text-muted-foreground hover:text-foreground hover:bg-bg-surface
                    disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft size={11} />
                </button>
                <span className="text-[12px] font-medium text-foreground px-2">
                  {meta.page} / {meta.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={!meta.hasNextPage}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border
                    text-muted-foreground hover:text-foreground hover:bg-bg-surface
                    disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight size={11} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {viewingId && (
          <UserDetailModal
            key="detail"
            userId={viewingId}
            onClose={() => setViewingId(null)}
            onEditQuota={(u) => setEditingQuota(u)}
            onResetQuota={(u) => setResettingQuota(u)}
            onDelete={(u) => setDeletingUser(u)}
          />
        )}
        {editingQuota && (
          <EditQuotaModal key="quota" user={editingQuota} onClose={() => setEditingQuota(null)} />
        )}
        {resettingQuota && (
          <ResetQuotaModal key="reset" user={resettingQuota} onClose={() => setResettingQuota(null)} />
        )}
        {deletingUser && (
          <DeleteUserModal key="delete" user={deletingUser} onClose={() => setDeletingUser(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Small UI pieces ─────────────────────────────────────────────────────── */
function QuotaCell({ quota }) {
  const used  = quota?.used  ?? 0
  const limit = quota?.limit ?? 0
  const pct   = limit > 0 ? Math.round((used / limit) * 100) : 0
  const isHigh = pct >= 80

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-[5px] rounded-full bg-border/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isHigh ? 'bg-status-danger' : 'bg-brand-primary'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`font-mono text-[11px] ${isHigh ? 'text-status-danger' : 'text-muted-foreground'}`}>
        {used.toLocaleString()}/{limit.toLocaleString()}
      </span>
    </div>
  )
}

function IconBtn({ children, title, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
        danger
          ? 'text-muted-foreground hover:text-status-danger hover:bg-status-danger/8'
          : 'text-muted-foreground hover:text-foreground hover:bg-bg-surface'
      }`}
    >
      {children}
    </button>
  )
}
