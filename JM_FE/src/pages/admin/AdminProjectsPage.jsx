import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FaSearch, FaTimes, FaCircleNotch, FaTrashAlt, FaLayerGroup,
  FaChevronLeft, FaChevronRight, FaUsers,
} from 'react-icons/fa'
import {
  listAllProjects, forceDeleteProject,
} from '@/features/admin/services/adminService'

const PAGE_LIMIT = 10

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

/* ─── ModalShell ──────────────────────────────────────────────────────────── */
function ModalShell({ onClose, children }) {
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
        className="w-full max-w-md rounded-2xl border border-border/50 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ─── DeleteProjectModal ──────────────────────────────────────────────────── */
function DeleteProjectModal({ project, onClose }) {
  const [confirm, setConfirm] = useState('')
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => forceDeleteProject(project._id),
    onMutate: () => toast.loading('Deleting project and all its data…', { id: 'delete-project' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success(`Project "${project.name}" has been deleted.`, { id: 'delete-project' })
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to delete project.', { id: 'delete-project' })
    },
  })

  const canDelete = confirm === project.name

  return (
    <ModalShell onClose={onClose}>
      <div className="p-5 sm:p-6">
        <h3 className="font-heading font-bold text-status-danger mb-2">Delete Project</h3>
        <p className="text-sm text-muted-foreground mb-1">
          This will permanently delete <strong className="text-foreground">{project.name}</strong> along
          with all its endpoints, responses, toggles, change requests, and contract versions.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Type <strong className="font-mono text-foreground">{project.name}</strong> to confirm.
        </p>
        <input
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={project.name}
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
            <div className="w-8 h-8 rounded-lg bg-bg-surface" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 rounded bg-bg-surface" />
              <div className="h-2.5 w-44 rounded bg-bg-surface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function AdminProjectsPage() {
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [deletingProject, setDeletingProject] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(search.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isPending, isError } = useQuery({
    queryKey: ['admin', 'projects', { page, q: debouncedQ }],
    queryFn:  () => listAllProjects({ page, limit: PAGE_LIMIT, q: debouncedQ || undefined })
      .then(r => ({ projects: r.data.data.data, meta: r.data.data.meta })),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  })

  const projects = data?.projects ?? []
  const meta     = data?.meta ?? {}

  return (
    <div className="p-5 sm:p-6 space-y-5">
      {/* Header + search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">Projects</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            View and manage all platform projects.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name..."
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
        <p className="text-sm text-status-danger">Failed to load projects.</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FaLayerGroup size={24} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">No projects found{debouncedQ ? ` matching "${debouncedQ}"` : ''}.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_2fr_1fr_0.8fr_1.2fr_auto] gap-2 px-4 py-2.5
              bg-bg-surface text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <span>Project</span>
              <span>Owner</span>
              <span>Slug</span>
              <span className="text-center">Members</span>
              <span>Created</span>
              <span className="text-right pr-1">Actions</span>
            </div>
            {projects.map((p) => (
              <div key={p._id}
                className="grid grid-cols-[2fr_2fr_1fr_0.8fr_1.2fr_auto] gap-2 px-4 py-3
                  border-t border-border items-center text-[13px] hover:bg-bg-surface/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center
                    text-brand-primary shrink-0">
                    <FaLayerGroup size={12} />
                  </div>
                  <span className="font-medium text-foreground truncate">{p.name}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-foreground truncate text-[13px]">{p.ownerId?.name ?? '—'}</p>
                  <p className="text-muted-foreground truncate text-[11px]">{p.ownerId?.email ?? ''}</p>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground truncate">{p.slug}</span>
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <FaUsers size={11} />
                  <span className="text-[12px]">{p.members?.length ?? 0}</span>
                </div>
                <span className="text-muted-foreground text-[12px]">{fmtDate(p.createdAt)}</span>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setDeletingProject(p)}
                    title="Delete project"
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors
                      text-muted-foreground hover:text-status-danger hover:bg-status-danger/8"
                  >
                    <FaTrashAlt size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {projects.map((p) => (
              <div key={p._id}
                className="border border-border rounded-xl p-4 bg-background space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center
                    text-brand-primary shrink-0">
                    <FaLayerGroup size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-[14px] truncate">{p.name}</p>
                    <p className="text-[12px] text-muted-foreground truncate">
                      by {p.ownerId?.name ?? 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[12px]">
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Slug</span>
                    <span className="font-mono text-foreground text-[11px] truncate block">{p.slug}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Members</span>
                    <span className="text-foreground flex items-center gap-1">
                      <FaUsers size={10} /> {p.members?.length ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5">Created</span>
                    <span className="text-foreground">{fmtDate(p.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-border">
                  <button onClick={() => setDeletingProject(p)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg
                      text-[12px] font-medium text-status-danger bg-status-danger/8
                      hover:bg-status-danger/15 transition-colors">
                    <FaTrashAlt size={11} /> Delete Project
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-[12px] text-muted-foreground">
                Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} projects
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

      {/* Delete modal */}
      <AnimatePresence>
        {deletingProject && (
          <DeleteProjectModal
            key="delete-project"
            project={deletingProject}
            onClose={() => setDeletingProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
