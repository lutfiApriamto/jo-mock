import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes } from 'react-icons/fa'
import { updateProject } from '@/features/project/services/projectService'
import { useProjectCtx } from '../context'
import { projectKeys } from '../queryKeys'

export default function RenameProjectModal({ onClose }) {
  const { project } = useProjectCtx()
  const queryClient = useQueryClient()
  const inputRef    = useRef(null)
  const [name, setName] = useState(project?.name ?? '')

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: (newName) => updateProject(project._id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(project._id) })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project renamed.')
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to rename.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2)   return toast.error('Name must be at least 2 characters.')
    if (trimmed.length > 100) return toast.error('Name must be under 100 characters.')
    if (trimmed === project.name) return onClose()
    mutation.mutate(trimmed)
  }

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
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-[17px] text-foreground">Rename project</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
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
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full px-3.5 py-[10px] rounded-xl text-sm text-foreground
                  bg-background border border-border/60
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50
                  transition-all duration-150"
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] text-muted-foreground/50">Minimum 2 characters</span>
                <span className="text-[11px] text-muted-foreground/40">{name.length}/100</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button type="button" onClick={onClose}
                className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
                  text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
                Cancel
              </button>
              <button type="submit" disabled={mutation.isPending || name.trim().length < 2}
                className="flex-1 py-[10px] rounded-xl bg-brand-primary text-white text-sm font-semibold
                  hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150">
                {mutation.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
