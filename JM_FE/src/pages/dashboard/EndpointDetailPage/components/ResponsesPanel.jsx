import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaPlus, FaUndo, FaLayerGroup } from 'react-icons/fa'
import { resetToggle } from '@/features/toggle/services/toggleService'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { useEndpointCtx } from '../context'
import { endpointDetailKeys } from '../queryKeys'
import InfoTooltip from '@/shared/components/InfoTooltip'
import ResponseCard from './ResponseCard'
import CreateResponseModal from './CreateResponseModal'

const TOOLTIP = 'Manage mock responses for this endpoint. Each response has a status code and JSON body. Use the toggle to activate a specific response — that\'s what the mock server returns for your requests.'

export default function ResponsesPanel() {
  const { project, myRole } = useProjectCtx()
  const { endpoint, responsesQuery, toggleQuery } = useEndpointCtx()
  const queryClient = useQueryClient()

  const [showCreate, setShowCreate] = useState(false)

  const responses        = responsesQuery.data ?? []
  const toggleData       = toggleQuery.data
  const activeResponseId = toggleData?.activeResponseId
  const isCustomized     = toggleData?.isCustomized ?? false

  const resetMutation = useMutation({
    mutationFn: () => resetToggle(project._id, endpoint._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: endpointDetailKeys.toggle(project._id, endpoint._id) })
      toast.success('Toggle reset to endpoint default.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.errors?.[0]?.message ?? 'Failed to reset toggle.')
    },
  })

  return (
    <div className="p-5 max-w-3xl">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <FaLayerGroup size={14} className="text-muted-foreground/50" />
            <h2 className="font-heading font-bold text-[15px] text-foreground">Responses</h2>
            <span className="text-[11px] text-muted-foreground/50">({responses.length})</span>
            <InfoTooltip content={TOOLTIP} />
          </div>
          {!endpoint?.defaultResponseId && (
            <p className="text-[11px] text-status-warning mt-0.5">
              ⚠️ No default response set. Add a 2xx response to activate this endpoint.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCustomized && (
            <button
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium
                border border-border text-muted-foreground hover:text-foreground hover:bg-bg-surface
                disabled:opacity-40 transition-all duration-150"
            >
              <FaUndo size={9} />
              Reset to default
            </button>
          )}

          {myRole === 'PM' && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl
                bg-brand-primary text-white text-[12px] font-semibold
                hover:opacity-90 transition-all duration-150"
            >
              <FaPlus size={9} />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Toggle info */}
      {toggleData && (
        <div className={[
          'mb-4 px-3.5 py-2.5 rounded-xl border text-[12px]',
          isCustomized
            ? 'border-brand-primary/30 bg-brand-primary/5 text-brand-primary'
            : 'border-border/60 bg-bg-surface/50 text-muted-foreground',
        ].join(' ')}>
          {isCustomized
            ? '✓ You are using a custom response.'
            : '→ You are using the endpoint\'s default response.'}
        </div>
      )}

      {/* Responses list */}
      {responses.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <FaLayerGroup size={28} className="mb-3 text-muted-foreground/20" />
          <p className="text-[13px] font-medium text-foreground mb-1">No responses yet</p>
          <p className="text-[12px] text-muted-foreground/60">
            {myRole === 'PM'
              ? 'Add the first response for this endpoint.'
              : 'The PM has not added any responses yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {responses.map(resp => (
            <ResponseCard
              key={resp._id}
              response={resp}
              activeResponseId={activeResponseId}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateResponseModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  )
}
