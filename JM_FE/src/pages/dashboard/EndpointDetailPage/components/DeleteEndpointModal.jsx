import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa'
import { deleteEndpoint } from '@/features/endpoint/services/endpointService'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { projectKeys } from '@/pages/dashboard/ProjectDetailPage/queryKeys'
import { useEndpointCtx } from '../context'

export default function DeleteEndpointModal({ onClose }) {
  const { project }  = useProjectCtx()
  const { endpoint } = useEndpointCtx()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => deleteEndpoint(project._id, endpoint._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.endpoints(project._id) })
      toast.success('Endpoint deleted.')
      navigate(`/dashboard/projects/${project._id}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to delete endpoint.')
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
              <h2 className="font-heading font-bold text-[17px] text-foreground">Delete Endpoint</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              <FaTimes size={12} />
            </button>
          </div>

          <p className="text-[13px] text-muted-foreground mb-1">
            Endpoint{' '}
            <span className="font-semibold text-foreground font-mono">
              {endpoint?.method} {endpoint?.path}
            </span>{' '}
            along with all its responses and toggles will be permanently deleted. This action cannot be undone.
          </p>

          <div className="flex gap-2.5 mt-5">
            <button type="button" onClick={onClose}
              className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
                text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              Cancel
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 py-[10px] rounded-xl bg-status-danger text-white text-sm font-semibold
                hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150">
              {mutation.isPending ? 'Deleting…' : 'Delete Endpoint'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
