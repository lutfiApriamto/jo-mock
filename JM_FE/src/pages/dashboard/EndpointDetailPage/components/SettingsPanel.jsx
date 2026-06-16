import { useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FaSave, FaExclamationTriangle } from 'react-icons/fa'
import { updateEndpoint } from '@/features/endpoint/services/endpointService'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { projectKeys } from '@/pages/dashboard/ProjectDetailPage/queryKeys'
import { useEndpointCtx } from '../context'
import { endpointDetailKeys } from '../queryKeys'
import InfoTooltip from '@/shared/components/InfoTooltip'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const METHOD_COLORS = {
  GET:    'text-blue-500',
  POST:   'text-status-success',
  PUT:    'text-status-warning',
  PATCH:  'text-brand-primary',
  DELETE: 'text-status-danger',
}

const TOOLTIP = 'Edit this endpoint\'s HTTP method, path, or folder. Changing the method or path is a contract change — it bumps the contract version and sends email notifications to all project members.'

export default function SettingsPanel() {
  const { project, foldersQuery } = useProjectCtx()
  const { endpoint }              = useEndpointCtx()
  const queryClient               = useQueryClient()
  const folders                   = foldersQuery.data ?? []

  const [method,   setMethod]   = useState(endpoint?.method   ?? 'GET')
  const [path,     setPath]     = useState(endpoint?.path     ?? '')
  const [folderId, setFolderId] = useState(endpoint?.folderId ?? '')

  const isContractChange = useMemo(() => {
    if (!endpoint) return false
    return method !== endpoint.method || path !== endpoint.path
  }, [method, path, endpoint])

  const hasChanges = useMemo(() => {
    if (!endpoint) return false
    const folderChanged = folderId && folderId !== (endpoint.folderId ?? '')
    return method !== endpoint.method || path !== endpoint.path || !!folderChanged
  }, [method, path, folderId, endpoint])

  const mutation = useMutation({
    mutationFn: () => {
      const body = {}
      if (method !== endpoint.method) body.method = method
      if (path   !== endpoint.path)   body.path   = path
      if (folderId && folderId !== (endpoint.folderId ?? '')) body.folderId = folderId
      return updateEndpoint(project._id, endpoint._id, body)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.detail(project._id, endpoint._id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.endpoints(project._id) })
      if (isContractChange) {
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(project._id) })
        toast.success('Endpoint updated. Contract version bumped & notifications sent.')
      } else {
        toast.success('Endpoint updated.')
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to update endpoint.')
    },
  })

  return (
    <div className="p-5 max-w-xl">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-heading font-bold text-[15px] text-foreground">Endpoint Settings</h2>
        <InfoTooltip content={TOOLTIP} />
      </div>

      <div className="space-y-4">
        {/* Method + Path */}
        <div>
          <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
            Method & Path
          </label>
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={[
                'px-3 py-[10px] rounded-xl text-sm font-semibold border border-border/60',
                'bg-background focus:outline-none focus:ring-2 focus:ring-brand-primary/15',
                'transition-all duration-150 cursor-pointer shrink-0',
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
              placeholder="/api/users/:id"
              maxLength={500}
              className="flex-1 px-3.5 py-[10px] rounded-xl text-sm font-mono text-foreground
                bg-background border border-border/60 placeholder:text-muted-foreground/30
                focus:outline-none focus:ring-2 focus:ring-brand-primary/15 focus:border-brand-primary/50
                transition-all duration-150"
            />
          </div>
        </div>

        {/* Folder */}
        <div>
          <label className="block text-[12.5px] font-medium text-foreground/65 mb-1.5">
            Move to folder <span className="text-muted-foreground/40">(optional)</span>
          </label>
          <p className="text-[11px] text-muted-foreground/50 mb-1.5">
            Select a destination folder. Moving back to root is not yet supported via this form.
          </p>
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

        {/* Warning: contract change */}
        {isContractChange && (
          <div className="flex gap-2.5 px-3.5 py-3 rounded-xl border border-status-warning/30 bg-status-warning/5">
            <FaExclamationTriangle size={13} className="text-status-warning shrink-0 mt-0.5" />
            <p className="text-[12px] text-status-warning">
              Changing the <strong>method</strong> or <strong>path</strong> will bump the contract version and send email notifications to all project members.
            </p>
          </div>
        )}

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !hasChanges || !path.trim()}
          className="flex items-center gap-1.5 px-4 py-[10px] rounded-xl
            bg-brand-primary text-white text-sm font-semibold
            hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
        >
          <FaSave size={11} />
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
