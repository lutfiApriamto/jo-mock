import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FaTrash, FaCog } from 'react-icons/fa'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { useEndpointCtx } from '../context'
import DeleteEndpointModal from './DeleteEndpointModal'

const METHOD_STYLE = {
  GET:    'bg-blue-500/10 text-blue-500 border-blue-500/20',
  POST:   'bg-status-success/10 text-status-success border-status-success/20',
  PUT:    'bg-status-warning/10 text-status-warning border-status-warning/20',
  PATCH:  'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  DELETE: 'bg-status-danger/10 text-status-danger border-status-danger/20',
}

export default function EndpointHeader({ activeTab, onTabChange }) {
  const { myRole }   = useProjectCtx()
  const { endpoint } = useEndpointCtx()
  const [showDelete, setShowDelete] = useState(false)

  const TABS = [
    { id: 'responses', label: 'Responses' },
    ...(
      endpoint?.method && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)
        ? [{ id: 'schema', label: 'Request Schema' }]
        : []
    ),
    { id: 'usage', label: 'Usage' },
    ...(myRole === 'PM' ? [{ id: 'settings', label: 'Settings' }] : []),
  ]

  return (
    <>
      <div className="px-5 pt-5 pb-0 border-b border-border">
        {/* Method + path row */}
        <div className="flex items-start gap-3 mb-4">
          <span className={[
            'shrink-0 text-[12px] font-bold px-2.5 py-1 rounded-lg border',
            METHOD_STYLE[endpoint?.method] ?? 'bg-bg-surface text-muted-foreground border-border',
          ].join(' ')}>
            {endpoint?.method}
          </span>

          <div className="flex-1 min-w-0">
            <h1 className="font-mono text-[15px] font-semibold text-foreground break-all">
              {endpoint?.path}
            </h1>
          </div>

          {myRole === 'PM' && (
            <button
              onClick={() => setShowDelete(true)}
              title="Hapus endpoint"
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
                text-status-danger/50 hover:text-status-danger hover:bg-status-danger/8
                transition-all duration-150"
            >
              <FaTrash size={12} />
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={[
                'px-3 py-2 text-[12.5px] font-semibold border-b-2 -mb-px transition-all duration-150',
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showDelete && <DeleteEndpointModal onClose={() => setShowDelete(false)} />}
      </AnimatePresence>
    </>
  )
}
