import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FaExclamationTriangle } from 'react-icons/fa'
import { getEndpointDetail } from '@/features/endpoint/services/endpointService'
import { listResponses } from '@/features/response/services/responseService'
import { getMyToggle } from '@/features/toggle/services/toggleService'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { EndpointContext } from './context'
import { endpointDetailKeys } from './queryKeys'
import EndpointHeader from './components/EndpointHeader'
import ResponsesPanel from './components/ResponsesPanel'
import SchemaPanel from './components/SchemaPanel'
import SettingsPanel from './components/SettingsPanel'
import UsagePanel from './components/UsagePanel'

function EndpointSkeleton() {
  return (
    <div className="animate-pulse p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-7 rounded-lg bg-bg-surface" />
        <div className="h-5 w-48 rounded bg-bg-surface" />
      </div>
      <div className="flex gap-2 mb-6">
        {[1,2,3].map(i => <div key={i} className="h-7 w-24 rounded-lg bg-bg-surface" />)}
      </div>
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-bg-surface" />)}
      </div>
    </div>
  )
}

function ErrorPanel({ message }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <FaExclamationTriangle size={28} className="mx-auto mb-3 text-status-danger/40" />
        <h2 className="font-heading font-bold text-foreground mb-1">Gagal memuat endpoint</h2>
        <p className="text-sm text-muted-foreground">{message ?? 'Terjadi kesalahan. Coba lagi.'}</p>
      </div>
    </div>
  )
}

export default function EndpointDetailPage() {
  const { projectId, endpointId } = useParams()
  const { myRole }                = useProjectCtx()

  const [activeTab, setActiveTab] = useState('responses')

  // ── Queries ────────────────────────────────────────────────────────────────
  const endpointQuery = useQuery({
    queryKey: endpointDetailKeys.detail(projectId, endpointId),
    queryFn:  () => getEndpointDetail(projectId, endpointId).then(r => r.data.data.data),
    staleTime: 60_000,
  })

  const responsesQuery = useQuery({
    queryKey: endpointDetailKeys.responses(projectId, endpointId),
    queryFn:  () => listResponses(projectId, endpointId).then(r => r.data.data.data),
    staleTime: 30_000,
  })

  const toggleQuery = useQuery({
    queryKey: endpointDetailKeys.toggle(projectId, endpointId),
    queryFn:  () => getMyToggle(projectId, endpointId).then(r => r.data.data.data),
    staleTime: 30_000,
  })

  // ── Context value ──────────────────────────────────────────────────────────
  const ctx = useMemo(() => ({
    endpoint:     endpointQuery.data,
    responsesQuery,
    toggleQuery,
  }), [endpointQuery.data, responsesQuery, toggleQuery])

  // ── Render states ──────────────────────────────────────────────────────────
  if (endpointQuery.isPending) return <EndpointSkeleton />
  if (endpointQuery.isError) {
    const msg = endpointQuery.error?.response?.data?.errors?.[0]?.message
    return <ErrorPanel message={msg} />
  }

  const endpoint = endpointQuery.data
  const showSchema   = ['POST', 'PUT', 'PATCH'].includes(endpoint?.method)
  const showSettings = myRole === 'PM'

  // Jika tab aktif tidak lagi valid (mis. pindah dari POST ke GET → hilangkan schema tab)
  const validTab = (activeTab === 'schema' && !showSchema)
    || (activeTab === 'settings' && !showSettings)
    ? 'responses'
    : activeTab

  return (
    <EndpointContext.Provider value={ctx}>
      {/* key={endpointId} resets all local state (SchemaPanel, SettingsPanel) when switching endpoints */}
      <div key={endpointId}>
        {/* Sticky header so the tab bar stays visible while scrolling panel content */}
        <div className="sticky top-0 z-10 bg-background">
          <EndpointHeader
            activeTab={validTab}
            onTabChange={setActiveTab}
          />
        </div>

        {validTab === 'responses' && <ResponsesPanel />}
        {validTab === 'schema'    && showSchema    && <SchemaPanel />}
        {validTab === 'usage'                      && <UsagePanel />}
        {validTab === 'settings'  && showSettings  && <SettingsPanel />}
      </div>
    </EndpointContext.Provider>
  )
}
