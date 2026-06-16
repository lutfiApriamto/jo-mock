import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes } from 'react-icons/fa'
import { updateResponse } from '@/features/response/services/responseService'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { useEndpointCtx } from '../context'
import { endpointDetailKeys } from '../queryKeys'

export default function EditResponseModal({ response, onClose }) {
  const { project }  = useProjectCtx()
  const { endpoint } = useEndpointCtx()
  const queryClient  = useQueryClient()

  const [statusCode, setStatusCode] = useState(response.statusCode)
  const [body,       setBody]       = useState(response.body)
  const [bodyError,  setBodyError]  = useState(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => updateResponse(project._id, endpoint._id, response._id, {
      ...(statusCode !== response.statusCode && { statusCode }),
      ...(body !== response.body && { body }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.responses(project._id, endpoint._id) })
      toast.success('Response updated.')
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to update response.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    try { JSON.parse(body) } catch { return setBodyError('Body must be valid JSON.') }
    if (statusCode === response.statusCode && body === response.body) return onClose()
    mutation.mutate()
  }

  const statusColorClass = statusCode >= 500
    ? 'text-status-danger'
    : statusCode >= 400
    ? 'text-status-warning'
    : statusCode >= 300
    ? 'text-blue-500'
    : 'text-status-success'

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
        className="w-full max-w-lg rounded-2xl border border-border/50 bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-[17px] text-foreground">Edit Response</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              <FaTimes size={12} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
                Status Code
              </label>
              {response.isDefault && (
                <p className="text-[11px] text-status-warning mb-1.5">
                  ⚠️ Default response cannot be changed to a non-2xx status.
                </p>
              )}
              <input
                type="number"
                value={statusCode}
                min={100} max={599}
                onChange={(e) => { setStatusCode(parseInt(e.target.value) || response.statusCode) }}
                className={[
                  'w-28 px-3 py-[8px] rounded-xl text-sm font-semibold border',
                  'bg-background focus:outline-none focus:ring-2 focus:ring-brand-primary/15',
                  'transition-all duration-150',
                  statusColorClass,
                ].join(' ')}
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
                Body (JSON)
              </label>
              <textarea
                value={body}
                onChange={(e) => { setBody(e.target.value); setBodyError(null) }}
                rows={7}
                spellCheck={false}
                className={[
                  'w-full px-3.5 py-3 rounded-xl text-[12.5px] font-mono text-foreground',
                  'bg-background border placeholder:text-muted-foreground/30 resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50',
                  'transition-all duration-150',
                  bodyError ? 'border-status-danger/50' : 'border-border/60',
                ].join(' ')}
              />
              {bodyError && (
                <p className="mt-1 text-[11px] text-status-danger">{bodyError}</p>
              )}
            </div>

            <div className="flex gap-2.5 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-[10px] rounded-xl border border-border text-sm font-medium
                  text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
                Cancel
              </button>
              <button type="submit" disabled={mutation.isPending}
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
