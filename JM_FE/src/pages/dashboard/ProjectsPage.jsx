import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FaSearch, FaPlus, FaTimes, FaLayerGroup, FaCircleNotch,
} from 'react-icons/fa'
import {
  listProjects,
  createProject,
} from '@/features/project/services/projectService'

/* ─── Helpers ─────────────────────────────────────────────────────────── */
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60);  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60);  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24);  if (d < 30)  return `${d}d ago`
  const mo = Math.floor(d / 30); if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

const ROLE_BADGE = {
  PM: 'bg-brand-primary/10 text-brand-primary',
  FE: 'bg-status-success/10 text-status-success',
  BE: 'bg-status-warning/10 text-status-warning',
}

const ACCENT_COLORS = [
  { bg: 'bg-brand-primary/10',  icon: 'text-brand-primary' },
  { bg: 'bg-status-success/10', icon: 'text-status-success' },
  { bg: 'bg-status-warning/10', icon: 'text-status-warning' },
  { bg: 'bg-status-danger/10',  icon: 'text-status-danger' },
]
const accentFor = (id = '') => {
  const n = parseInt(id.slice(-1), 16) || 0
  return ACCENT_COLORS[n % ACCENT_COLORS.length]
}

/* ─── Create modal ─────────────────────────────────────────────────────── */
function CreateModal({ onClose }) {
  const [name, setName] = useState('')
  const inputRef        = useRef(null)
  const queryClient     = useQueryClient()
  const navigate        = useNavigate()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => createProject(name.trim()),
    onSuccess: (res) => {
      const project = res.data.data.data
      // Optimistic prepend ke cache — hindari round-trip refetch
      queryClient.setQueryData(['projects'], (old) => {
        if (!old) return old
        return {
          ...old,
          data:      [{ ...project, myRole: 'PM' }, ...(old.data ?? [])],
          totalData: (old.totalData ?? 0) + 1,
        }
      })
      toast.success('Project created!')
      onClose()
      navigate(`/dashboard/projects/${project._id}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Something went wrong. Please try again.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2)   return toast.error('Name must be at least 2 characters.')
    if (trimmed.length > 100) return toast.error('Name must be under 100 characters.')
    mutation.mutate()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md rounded-2xl border border-border/50 bg-background shadow-2xl"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-[17px] text-foreground">
              New project
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full
                text-muted-foreground hover:text-foreground hover:bg-bg-surface
                transition-all duration-150"
            >
              <FaTimes size={12} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
                Project name
              </label>
              <input
                ref={inputRef}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. E-Commerce API"
                maxLength={100}
                className="w-full px-3.5 py-[10px] rounded-xl text-sm text-foreground
                  bg-background border border-border/60 placeholder:text-muted-foreground/30
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50
                  transition-all duration-150"
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] text-muted-foreground/50">
                  Minimum 2 characters
                </span>
                <span className="text-[11px] text-muted-foreground/40">
                  {name.length}/100
                </span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
                  text-muted-foreground hover:text-foreground hover:bg-bg-surface
                  transition-all duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending || name.trim().length < 2}
                className="flex-1 flex items-center justify-center gap-2 py-[10px] rounded-xl
                  bg-brand-primary text-white text-sm font-semibold
                  hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-150"
              >
                {mutation.isPending
                  ? <FaCircleNotch size={13} className="animate-spin" />
                  : <FaPlus size={11} />
                }
                Create
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Project card ─────────────────────────────────────────────────────── */
function ProjectCard({ project, onClick }) {
  const accent = accentFor(project._id)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className="group relative bg-background border border-border rounded-xl p-4 cursor-pointer
        hover:border-brand-primary/40 hover:shadow-sm transition-all duration-150"
    >
      {/* Icon */}
      <div className="mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent.bg}`}>
          <FaLayerGroup size={14} className={accent.icon} />
        </div>
      </div>

      {/* Name + slug */}
      <h3 className="font-medium text-[13px] text-foreground truncate mb-0.5">
        {project.name}
      </h3>
      <p className="text-[11px] text-muted-foreground/70 truncate mb-3 font-mono">
        /{project.slug}
      </p>

      {/* Footer: role badge + version + time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${ROLE_BADGE[project.myRole] ?? 'bg-bg-surface text-muted-foreground'}`}
          >
            {project.myRole}
          </span>
          <span className="text-[11px] text-muted-foreground">
            v{project.contractVersion}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground/60 shrink-0">
          {timeAgo(project.createdAt)}
        </span>
      </div>
    </motion.div>
  )
}

/* ─── Loading skeleton ─────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="h-6 w-28 rounded-lg bg-bg-surface animate-pulse mb-1.5" />
          <div className="h-4 w-20 rounded-md bg-bg-surface animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-xl bg-bg-surface animate-pulse shrink-0" />
      </div>
      <div className="h-10 w-full rounded-xl bg-bg-surface animate-pulse mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[136px] rounded-xl bg-bg-surface animate-pulse" />
        ))}
      </div>
    </div>
  )
}

/* ─── Main page ────────────────────────────────────────────────────────── */
export default function ProjectsPage() {
  const navigate = useNavigate()
  const [search,     setSearch]     = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn:  () => listProjects({ page: 1, limit: 200 }).then(r => r.data.data),
    staleTime: 30_000,
  })

  const projects  = data?.data      ?? []
  const totalData = data?.totalData ?? projects.length

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      p => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    )
  }, [projects, search])

  if (isLoading) return <Skeleton />

  const isFiltering    = search.trim().length > 0
  const displayedCount = isFiltering ? filteredProjects.length : totalData

  return (
    <>
      <div className="p-5 sm:p-6 lg:p-8 max-w-[1400px]">

        {/* ── Header ── */}
        <div className="flex items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground">
              My projects
            </h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {isFiltering
                ? `${displayedCount} result${displayedCount !== 1 ? 's' : ''} for "${search.trim()}"`
                : totalData > 0
                  ? `${totalData} project${totalData !== 1 ? 's' : ''}`
                  : 'No projects yet'
              }
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-brand-primary text-white text-sm font-semibold
              hover:opacity-90 transition-opacity duration-150 shrink-0"
          >
            <FaPlus size={11} />
            <span className="hidden sm:inline">New project</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* ── Search ── */}
        <div className="relative mb-5 sm:mb-6">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
            text-muted-foreground/50">
            <FaSearch size={13} />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-foreground
              bg-bg-surface border border-border/60 placeholder:text-muted-foreground/30
              focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/40
              transition-all duration-150"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2
                  text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                <FaTimes size={11} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Grid or empty state ── */}
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-bg-surface flex items-center justify-center mb-4">
              <FaLayerGroup size={22} className="text-muted-foreground/30" />
            </div>
            <h3 className="font-medium text-foreground mb-1.5">
              {isFiltering ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed">
              {isFiltering
                ? `No projects match "${search.trim()}". Try a different keyword.`
                : 'Create your first project and start building mock APIs for your team.'}
            </p>
            {!isFiltering && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl
                  bg-brand-primary text-white text-sm font-semibold
                  hover:opacity-90 transition-opacity duration-150"
              >
                <FaPlus size={11} />
                Create project
              </button>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onClick={() => navigate(`/dashboard/projects/${project._id}`)}
                />
              ))}
            </AnimatePresence>

            {/* New project dashed card — hide while filtering */}
            {!isFiltering && (
              <motion.div
                layout
                onClick={() => setShowCreate(true)}
                className="flex flex-col items-center justify-center gap-2 min-h-[136px]
                  rounded-xl border border-dashed border-border/60 cursor-pointer
                  text-muted-foreground hover:text-foreground hover:border-brand-primary/40
                  hover:bg-bg-surface/50 transition-all duration-150"
              >
                <FaPlus size={15} />
                <span className="text-[12px] font-medium">New project</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Create modal ── */}
      <AnimatePresence>
        {showCreate && (
          <CreateModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
