import { useState, useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FaEllipsisH, FaEdit, FaTrash } from 'react-icons/fa'
import { useProjectCtx } from '../context'
import RenameProjectModal from './RenameProjectModal'
import DeleteProjectModal from './DeleteProjectModal'

const METHOD_COLORS = {
  GET:    'bg-blue-500/10 text-blue-500',
  POST:   'bg-status-success/10 text-status-success',
  PUT:    'bg-status-warning/10 text-status-warning',
  PATCH:  'bg-brand-primary/10 text-brand-primary',
  DELETE: 'bg-status-danger/10 text-status-danger',
}

export default function ProjectHeader() {
  const { project, myRole, endpointsQuery } = useProjectCtx()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const endpoints = endpointsQuery.data ?? []
  const members   = project?.members?.length ?? 0

  return (
    <>
      <div className="flex items-start gap-4 p-5 sm:p-6 pb-0">
        {/* Left: name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-foreground truncate">
              {project?.name}
            </h1>
            <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full
              bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              v{project?.contractVersion}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="font-mono text-[12px] text-muted-foreground">
              /{project?.slug}
            </span>
            <span className="text-muted-foreground/40 text-[12px]">·</span>
            <span className="text-[12px] text-muted-foreground">
              {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}
            </span>
            <span className="text-muted-foreground/40 text-[12px]">·</span>
            <span className="text-[12px] text-muted-foreground">
              {members + 1} member{members + 1 !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Right: PM actions */}
        {myRole === 'PM' && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                text-muted-foreground hover:text-foreground hover:bg-bg-surface
                transition-all duration-150"
            >
              <FaEllipsisH size={13} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-border
                bg-background shadow-lg py-1">
                <button
                  onClick={() => { setMenuOpen(false); setShowRename(true) }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px]
                    text-foreground hover:bg-bg-surface transition-colors duration-100"
                >
                  <FaEdit size={12} className="text-muted-foreground" />
                  Rename project
                </button>
                <div className="my-1 border-t border-border/60" />
                <button
                  onClick={() => { setMenuOpen(false); setShowDelete(true) }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px]
                    text-status-danger hover:bg-status-danger/8 transition-colors duration-100"
                >
                  <FaTrash size={11} />
                  Delete project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRename && <RenameProjectModal onClose={() => setShowRename(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showDelete && <DeleteProjectModal onClose={() => setShowDelete(false)} />}
      </AnimatePresence>
    </>
  )
}
