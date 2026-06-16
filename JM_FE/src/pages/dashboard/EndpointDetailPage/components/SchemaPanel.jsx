import { useState, useCallback, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FaSave, FaCode } from 'react-icons/fa'
import InfoTooltip from '@/shared/components/InfoTooltip'
import { updateEndpoint } from '@/features/endpoint/services/endpointService'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { projectKeys } from '@/pages/dashboard/ProjectDetailPage/queryKeys'
import { useEndpointCtx } from '../context'
import { endpointDetailKeys } from '../queryKeys'
import SchemaVisualEditor from './SchemaVisualEditor'

function hasShortName(fields) {
  return (fields ?? []).some(
    f =>
      (f.name.length > 0 && f.name.length < 2) ||
      hasShortName(f.properties) ||
      hasShortName(f.items?.properties),
  )
}

export default function SchemaPanel() {
  const { project, myRole }  = useProjectCtx()
  const { endpoint }         = useEndpointCtx()
  const queryClient          = useQueryClient()

  const initial = useMemo(() => endpoint?.requestSchema ?? [], [endpoint])

  const [fields, setFields] = useState(initial)
  const [dirty,  setDirty]  = useState(false)

  const isPM = myRole === 'PM'

  const handleVisualChange = useCallback((next) => {
    setFields(next)
    setDirty(true)
  }, [])

  const mutation = useMutation({
    mutationFn: () => updateEndpoint(project._id, endpoint._id, { requestSchema: fields }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.detail(project._id, endpoint._id) })
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(project._id) })
      toast.success('Request schema saved. Contract version bumped.')
      setDirty(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to save schema.')
    },
  })

  const handleSave = () => {
    if (hasShortName(fields)) return toast.error('Field names must be at least 2 characters.')
    mutation.mutate()
  }

  return (
    <div className="p-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h2 className="font-heading font-bold text-[15px] text-foreground">Request Schema</h2>
          <InfoTooltip content="Define the fields expected in the request body. PM can edit the schema; changes bump the contract version and notify all project members via email." />
        </div>
        {isPM && dirty && (
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl
              bg-brand-primary text-white text-[12px] font-semibold
              hover:opacity-90 disabled:opacity-50 transition-all duration-150"
          >
            <FaSave size={10} />
            {mutation.isPending ? 'Saving…' : 'Save'}
          </button>
        )}
      </div>

      <p className="text-[12px] text-muted-foreground/60 mb-5">
        Defines the fields expected in the request body.
        {isPM
          ? ' Changes will bump the contract version and notify all project members.'
          : ' Only the PM can modify this schema.'}
      </p>

      {/* Layout: visual editor kiri / JSON preview kanan (atau stacked di mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Editor */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-3">
            Fields
            {isPM && <span className="ml-1.5 font-normal normal-case tracking-normal">— press Enter to add next field</span>}
          </p>
          <SchemaVisualEditor
            fields={fields}
            onChange={handleVisualChange}
            readOnly={!isPM}
          />
        </div>

        {/* JSON Preview (read-only, auto-sync) */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <FaCode size={9} className="text-muted-foreground/40" />
            <p className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
              JSON Preview
            </p>
          </div>
          <pre className="px-4 py-3 rounded-xl bg-bg-surface border border-border/60
            text-[11.5px] font-mono text-foreground/70 overflow-x-auto whitespace-pre leading-relaxed
            max-h-[420px] overflow-y-auto">
            {JSON.stringify(fields, null, 2)}
          </pre>
        </div>
      </div>

      {/* Warning on schema change */}
      {isPM && dirty && (
        <div className="mt-5 px-3.5 py-2.5 rounded-xl border border-status-warning/30 bg-status-warning/5">
          <p className="text-[11.5px] text-status-warning font-medium">
            ⚠️ Saving changes will bump the contract version and send email notifications to all project members.
          </p>
        </div>
      )}
    </div>
  )
}
