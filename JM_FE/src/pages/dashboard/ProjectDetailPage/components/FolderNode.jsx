import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FaChevronRight, FaFolder, FaFolderOpen,
  FaEllipsisH, FaEdit, FaTrash, FaFolderPlus, FaPlus,
} from 'react-icons/fa'
import { renameFolder, deleteFolder } from '@/features/folder/services/folderService'
import { useProjectCtx } from '../context'
import { projectKeys } from '../queryKeys'
import EndpointNode from './EndpointNode'
import CreateFolderModal from './CreateFolderModal'
import CreateEndpointModal from './CreateEndpointModal'

export default function FolderNode({ folder, depth }) {
  const { project, myRole } = useProjectCtx()
  const queryClient         = useQueryClient()

  const [open,              setOpen]              = useState(depth === 0)
  const [renaming,          setRenaming]          = useState(false)
  const [renameValue,       setRenameValue]       = useState(folder.name)
  const [menuOpen,          setMenuOpen]          = useState(false)
  const [showNewFolder,     setShowNewFolder]     = useState(false)
  const [showNewEndpoint,   setShowNewEndpoint]   = useState(false)
  const menuRef  = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const renameMutation = useMutation({
    mutationFn: () => renameFolder(project._id, folder._id, renameValue.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.folders(project._id) })
      toast.success('Folder renamed.')
      setRenaming(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to rename.')
      setRenaming(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteFolder(project._id, folder._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.folders(project._id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.endpoints(project._id) })
      toast.success('Folder deleted.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to delete folder.')
    },
  })

  const handleRenameSubmit = (e) => {
    e?.preventDefault()
    const trimmed = renameValue.trim()
    if (!trimmed) return setRenaming(false)
    if (trimmed === folder.name) return setRenaming(false)
    renameMutation.mutate()
  }

  const indent = depth * 12

  return (
    <div>
      {/* Folder row */}
      <div
        className="group relative flex items-center gap-1.5 py-[5px] rounded-lg
          hover:bg-bg-surface transition-all duration-100 cursor-pointer"
        style={{ paddingLeft: `${8 + indent}px`, paddingRight: '4px' }}
        onClick={() => !renaming && setOpen(v => !v)}
      >
        {/* Chevron */}
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-muted-foreground/40 shrink-0"
        >
          <FaChevronRight size={9} />
        </motion.span>

        {/* Icon */}
        <span className="text-muted-foreground/60 shrink-0 text-[13px]">
          {open ? <FaFolderOpen /> : <FaFolder />}
        </span>

        {/* Name (or rename input) */}
        {renaming ? (
          <form
            onSubmit={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0"
          >
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => { if (e.key === 'Escape') setRenaming(false) }}
              className="w-full text-[12px] font-medium text-foreground
                bg-background border border-brand-primary/40 rounded px-1.5 py-0.5
                focus:outline-none"
            />
          </form>
        ) : (
          <span className="flex-1 text-[12px] font-medium text-foreground truncate">
            {folder.name}
          </span>
        )}

        {/* PM context menu */}
        {myRole === 'PM' && !renaming && (
          <div
            className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-auto shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowNewFolder(true)}
              title="New subfolder"
              className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground/50
                hover:text-foreground hover:bg-bg-surface transition-all duration-100"
            >
              <FaFolderPlus size={9} />
            </button>
            <button
              onClick={() => setShowNewEndpoint(true)}
              title="New endpoint here"
              className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground/50
                hover:text-foreground hover:bg-bg-surface transition-all duration-100"
            >
              <FaPlus size={8} />
            </button>
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground/50
                  hover:text-foreground hover:bg-bg-surface transition-all duration-100"
              >
                <FaEllipsisH size={9} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-6 z-30 w-36 rounded-xl border border-border
                  bg-background shadow-lg py-1">
                  <button
                    onClick={() => { setMenuOpen(false); setRenaming(true) }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px]
                      text-foreground hover:bg-bg-surface transition-colors"
                  >
                    <FaEdit size={10} className="text-muted-foreground" />
                    Rename
                  </button>
                  <div className="my-1 border-t border-border/60" />
                  <button
                    onClick={() => { setMenuOpen(false); deleteMutation.mutate() }}
                    disabled={deleteMutation.isPending}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px]
                      text-status-danger hover:bg-status-danger/8 transition-colors"
                  >
                    <FaTrash size={9} />
                    Delete folder
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5">
              {folder.children.map(child => (
                <FolderNode key={child._id} folder={child} depth={depth + 1} />
              ))}
              {folder.endpoints.map(ep => (
                <EndpointNode key={ep._id} endpoint={ep} indent={depth + 1} />
              ))}
              {folder.children.length === 0 && folder.endpoints.length === 0 && (
                <p
                  className="text-[11px] text-muted-foreground/40 py-1"
                  style={{ paddingLeft: `${8 + (depth + 1) * 12 + 16}px` }}
                >
                  Empty
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-modals */}
      <AnimatePresence>
        {showNewFolder && (
          <CreateFolderModal
            parentId={folder._id}
            parentName={folder.name}
            onClose={() => setShowNewFolder(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showNewEndpoint && (
          <CreateEndpointModal
            defaultFolderId={folder._id}
            onClose={() => setShowNewEndpoint(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
