import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaTimes } from 'react-icons/fa'
import { createResponse } from '@/features/response/services/responseService'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { useEndpointCtx } from '../context'
import { endpointDetailKeys } from '../queryKeys'

const STATUS_PRESETS = [200, 201, 204, 400, 401, 403, 404, 409, 422, 500]

const defaultBody = (code) => {
  if (code >= 200 && code < 300) return '{"message":"success"}'
  if (code === 400) return '{"message":"bad request"}'
  if (code === 401) return '{"message":"unauthorized"}'
  if (code === 403) return '{"message":"forbidden"}'
  if (code === 404) return '{"message":"not found"}'
  if (code === 409) return '{"message":"conflict"}'
  if (code === 422) return '{"message":"unprocessable entity"}'
  return '{"message":"internal server error"}'
}

export default function CreateResponseModal({ onClose }) {
  const { project }  = useProjectCtx()
  const { endpoint } = useEndpointCtx()
  const queryClient  = useQueryClient()

  const [statusCode, setStatusCode] = useState(200)
  const [body,       setBody]       = useState(defaultBody(200))
  const [bodyError,  setBodyError]  = useState(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleStatusChange = (code) => {
    setStatusCode(code)
    setBody(defaultBody(code))
    setBodyError(null)
  }

  const validateBody = (val) => {
    try { JSON.parse(val); return null }
    catch { return 'Body must be valid JSON.' }
  }

  const mutation = useMutation({
    mutationFn: () => createResponse(project._id, endpoint._id, { statusCode, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.responses(project._id, endpoint._id) })
      // Endpoint defaultResponseId bisa berubah (auto-default)
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.detail(project._id, endpoint._id) })
      toast.success(`Response ${statusCode} created.`)
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to create response.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validateBody(body)
    if (err) return setBodyError(err)
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
            <h2 className="font-heading font-bold text-[17px] text-foreground">Add Response</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full
              text-muted-foreground hover:text-foreground hover:bg-bg-surface transition-all duration-150">
              <FaTimes size={12} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status code */}
            <div>
              <label className="block text-[12.5px] font-medium text-foreground/65 mb-2">
                Status Code
              </label>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {STATUS_PRESETS.map(code => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleStatusChange(code)}
                    className={[
                      'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all duration-150',
                      statusCode === code
                        ? code >= 500 ? 'bg-status-danger/10 text-status-danger border-status-danger/30'
                          : code >= 400 ? 'bg-status-warning/10 text-status-warning border-status-warning/30'
                          : code >= 300 ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                          : 'bg-status-success/10 text-status-success border-status-success/30'
                        : 'bg-bg-surface text-muted-foreground border-border/60 hover:border-border',
                    ].join(' ')}
                  >
                    {code}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground">Custom:</span>
                <input
                  type="number"
                  value={statusCode}
                  min={100} max={599}
                  onChange={(e) => handleStatusChange(parseInt(e.target.value) || 200)}
                  className={[
                    'w-24 px-3 py-[7px] rounded-lg text-sm font-semibold border',
                    'bg-background focus:outline-none focus:ring-2 focus:ring-brand-primary/15',
                    'transition-all duration-150',
                    statusColorClass,
                  ].join(' ')}
                />
              </div>
            </div>

            {/* Body JSON */}
            <div>
              <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
                Body (JSON)
              </label>
              <textarea
                value={body}
                onChange={(e) => { setBody(e.target.value); setBodyError(null) }}
                rows={6}
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
