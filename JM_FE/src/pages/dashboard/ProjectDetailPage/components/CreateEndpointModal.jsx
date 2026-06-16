import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes } from 'react-icons/fa'
import { createEndpoint } from '@/features/endpoint/services/endpointService'
import { useProjectCtx } from '../context'
import { projectKeys } from '../queryKeys'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const METHOD_COLORS = {
  GET:    'text-blue-500',
  POST:   'text-status-success',
  PUT:    'text-status-warning',
  PATCH:  'text-brand-primary',
  DELETE: 'text-status-danger',
}

export default function CreateEndpointModal({ defaultFolderId = null, onClose }) {
  const { project, foldersQuery } = useProjectCtx()
  const queryClient = useQueryClient()
  const navigate    = useNavigate()
  const folders     = foldersQuery.data ?? []

  const [method,   setMethod]   = useState('GET')
  const [path,     setPath]     = useState('/')
  const [folderId, setFolderId] = useState(defaultFolderId ?? '')

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => createEndpoint(project._id, {
      method,
      path: path.trim(),
      ...(folderId && { folderId }),
    }),
    onSuccess: (res) => {
      const endpoint = res.data.data.data
      queryClient.invalidateQueries({ queryKey: projectKeys.endpoints(project._id) })
      toast.success('Endpoint created.')
      onClose()
      navigate(`/dashboard/projects/${project._id}/endpoints/${endpoint._id}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to create endpoint.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedPath = path.trim()
    if (!trimmedPath) return toast.error('Path is required.')
    mutation.mutate()
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
            <h2 className="font-heading font-bold text-[17px] text-foreground">New endpoint</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              <FaTimes size={12} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Method + path row */}
            <div>
              <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
                Method & path
              </label>
              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className={[
                    'px-3 py-[10px] rounded-xl text-sm font-semibold border border-border/60',
                    'bg-background focus:outline-none focus:ring-2 focus:ring-brand-primary/15',
                    'transition-all duration-150 cursor-pointer',
                    METHOD_COLORS[method],
                  ].join(' ')}
                >
                  {METHODS.map(m => (
                    <option key={m} value={m} className="text-foreground font-semibold">{m}</option>
                  ))}
                </select>
                <input
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/api/users"
                  maxLength={500}
                  className="flex-1 px-3.5 py-[10px] rounded-xl text-sm font-mono text-foreground
                    bg-background border border-border/60 placeholder:text-muted-foreground/30
                    focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50
                    transition-all duration-150"
                />
              </div>
            </div>

            {/* Folder selector */}
            <div>
              <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
                Folder <span className="text-muted-foreground/40">(optional)</span>
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3.5 py-[10px] rounded-xl text-sm text-foreground
                  bg-background border border-border/60
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50
                  transition-all duration-150 cursor-pointer"
              >
                <option value="">— No folder (root) —</option>
                {folders.map(f => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
                  text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
                Cancel
              </button>
              <button type="submit" disabled={mutation.isPending || !path.trim()}
                className="flex-1 py-[10px] rounded-xl bg-brand-primary text-white text-sm font-semibold
                  hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150">
                {mutation.isPending ? 'Creating…' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}
