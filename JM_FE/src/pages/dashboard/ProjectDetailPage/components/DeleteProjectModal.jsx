import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa'
import { deleteProject } from '@/features/project/services/projectService'
import { useProjectCtx } from '../context'

export default function DeleteProjectModal({ onClose }) {
  const { project }   = useProjectCtx()
  const navigate      = useNavigate()
  const queryClient   = useQueryClient()
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => deleteProject(project._id),
    onMutate:  () => toast.loading('Deleting project…'),
    onSuccess: (data, vars, tid) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted.', { id: tid })
      navigate('/dashboard')
    },
    onError: (err, vars, tid) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to delete project.', { id: tid })
    },
  })

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
                <FaExclamationTriangle size={13} className="text-status-danger" />
              </div>
              <h2 className="font-heading font-bold text-[17px] text-foreground">Delete project</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              <FaTimes size={12} />
            </button>
          </div>

          <p className="text-[13px] text-muted-foreground mb-1">
            This will permanently delete{' '}
            <span className="font-semibold text-foreground">{project?.name}</span>{' '}
            and all its folders, endpoints, responses, and toggles. This cannot be undone.
          </p>

          <div className="mt-4 space-y-1.5">
            <label className="block text-[12.5px] font-medium text-foreground/65">
              Type <span className="font-semibold text-foreground">{project?.name}</span> to confirm
            </label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={project?.name}
              className="w-full px-3.5 py-[10px] rounded-xl text-sm text-foreground
                bg-background border border-border/60 placeholder:text-muted-foreground/30
                focus:outline-none focus:ring-2 focus:ring-status-danger/15 focus:border-status-danger/50
                transition-all duration-150"
            />
          </div>

          <div className="flex gap-2.5 mt-5">
            <button type="button" onClick={onClose}
              className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
                text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || confirm !== project?.name}
              className="flex-1 py-[10px] rounded-xl bg-status-danger text-white text-sm font-semibold
                hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150">
              {mutation.isPending ? 'Deleting…' : 'Delete project'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
