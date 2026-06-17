import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaEdit, FaStar, FaTrash, FaPlay, FaCheck, FaDownload } from 'react-icons/fa'
import { downloadJson } from '@/shared/utils/jsonImportExport'
import { setDefaultResponse, deleteResponse } from '@/features/response/services/responseService'
import { upsertToggle } from '@/features/toggle/services/toggleService'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { projectKeys } from '@/pages/dashboard/ProjectDetailPage/queryKeys'
import { useEndpointCtx } from '../context'
import { endpointDetailKeys } from '../queryKeys'
import EditResponseModal from './EditResponseModal'

const statusColor = (code) => {
  if (code >= 500) return { badge: 'bg-status-danger/10 text-status-danger border-status-danger/20',   ring: 'border-status-danger/30' }
  if (code >= 400) return { badge: 'bg-status-warning/10 text-status-warning border-status-warning/20', ring: 'border-status-warning/30' }
  if (code >= 300) return { badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',                  ring: 'border-blue-500/30' }
  return             { badge: 'bg-status-success/10 text-status-success border-status-success/20',     ring: 'border-status-success/30' }
}

function formatJson(str) {
  try { return JSON.stringify(JSON.parse(str), null, 2) }
  catch { return str }
}

export default function ResponseCard({ response, activeResponseId }) {
  const { project, myRole } = useProjectCtx()
  const { endpoint }        = useEndpointCtx()
  const queryClient         = useQueryClient()

  const [expanded,   setExpanded]   = useState(false)
  const [showEdit,   setShowEdit]   = useState(false)

  const isActive  = response._id === activeResponseId
  const is2xx     = response.statusCode >= 200 && response.statusCode < 300
  const colors    = statusColor(response.statusCode)

  const setDefaultMutation = useMutation({
    mutationFn: () => setDefaultResponse(project._id, endpoint._id, response._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.responses(project._id, endpoint._id) })
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.detail(project._id, endpoint._id) })
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.toggle(project._id, endpoint._id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.endpoints(project._id) })
      toast.success(`Response ${response.statusCode} set as default.`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to update default.')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: () => upsertToggle(project._id, endpoint._id, response._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.toggle(project._id, endpoint._id) })
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to update toggle.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteResponse(project._id, endpoint._id, response._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.responses(project._id, endpoint._id) })
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.detail(project._id, endpoint._id) })
      toast.success(`Response ${response.statusCode} deleted.`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to delete response.')
    },
  })

  return (
    <>
      <div className={[
        'rounded-xl border transition-all duration-150',
        isActive ? colors.ring + ' bg-bg-surface/50' : 'border-border/60 hover:border-border',
      ].join(' ')}>
        {/* Card header */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Status badge */}
          <span className={[
            'shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md border',
            colors.badge,
          ].join(' ')}>
            {response.statusCode}
          </span>

          {/* Default badge */}
          {response.isDefault && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold
              bg-status-success/10 text-status-success px-1.5 py-0.5 rounded">
              <FaStar size={8} /> Default
            </span>
          )}

          {/* Active badge */}
          {isActive && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold
              bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded">
              <FaCheck size={8} /> Active
            </span>
          )}

          {/* Body preview — collapsed */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex-1 min-w-0 text-left"
          >
            <span className="text-[12px] font-mono text-muted-foreground truncate block">
              {response.body}
            </span>
          </button>

          {/* Actions */}
          <div className="shrink-0 flex items-center gap-1">
            {/* Export body as JSON */}
            <button
              onClick={() => downloadJson(response.body, `response-${response.statusCode}.json`)}
              title="Export body as JSON"
              className="w-7 h-7 flex items-center justify-center rounded-lg
                text-muted-foreground/60 hover:text-brand-primary hover:bg-brand-primary/8
                transition-all duration-150"
            >
              <FaDownload size={10} />
            </button>

            {/* Activate toggle (semua role) */}
            {!isActive && (
              <button
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
                title="Activate for me"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium
                  text-muted-foreground hover:text-brand-primary hover:bg-brand-primary/8
                  disabled:opacity-40 transition-all duration-150"
              >
                <FaPlay size={9} />
                Activate
              </button>
            )}

            {myRole === 'PM' && (
              <>
                {/* Set as default (hanya 2xx, bukan yang sudah default) */}
                {is2xx && !response.isDefault && (
                  <button
                    onClick={() => setDefaultMutation.mutate()}
                    disabled={setDefaultMutation.isPending}
                    title="Set as endpoint default"
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                      text-muted-foreground/60 hover:text-status-success hover:bg-status-success/8
                      disabled:opacity-40 transition-all duration-150"
                  >
                    <FaStar size={10} />
                  </button>
                )}

                {/* Edit */}
                <button
                  onClick={() => setShowEdit(true)}
                  title="Edit response"

                  className="w-7 h-7 flex items-center justify-center rounded-lg
                    text-muted-foreground/60 hover:text-foreground hover:bg-bg-surface
                    transition-all duration-150"
                >
                  <FaEdit size={10} />
                </button>

                {/* Delete (tidak bisa hapus default) */}
                {!response.isDefault && (
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    title="Delete response"
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                      text-muted-foreground/60 hover:text-status-danger hover:bg-status-danger/8
                      disabled:opacity-40 transition-all duration-150"
                  >
                    <FaTrash size={9} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Expanded body */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t border-border/40"
            >
              <pre className="px-4 py-3 text-[12px] font-mono text-foreground/80 overflow-x-auto">
                {formatJson(response.body)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showEdit && (
          <EditResponseModal response={response} onClose={() => setShowEdit(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
