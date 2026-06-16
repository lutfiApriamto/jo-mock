import { useNavigate, useParams } from 'react-router-dom'

const METHOD_BG = {
  GET:    'bg-blue-500/10 text-blue-500',
  POST:   'bg-status-success/10 text-status-success',
  PUT:    'bg-status-warning/10 text-status-warning',
  PATCH:  'bg-brand-primary/10 text-brand-primary',
  DELETE: 'bg-status-danger/10 text-status-danger',
}

export default function EndpointNode({ endpoint, indent = 0 }) {
  const navigate              = useNavigate()
  const { projectId, endpointId: activeEndpointId } = useParams()
  const isActive = endpoint._id === activeEndpointId

  return (
    <button
      onClick={() => navigate(`/dashboard/projects/${projectId}/endpoints/${endpoint._id}`)}
      style={{ paddingLeft: `${8 + indent * 12}px` }}
      className={[
        'w-full flex items-center gap-2 pr-2 py-[5px] rounded-lg text-left',
        'transition-all duration-100 group',
        isActive
          ? 'bg-brand-primary/10 text-brand-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-bg-surface',
      ].join(' ')}
    >
      <span className={[
        'shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded',
        METHOD_BG[endpoint.method] ?? 'bg-bg-surface text-muted-foreground',
      ].join(' ')}>
        {endpoint.method}
      </span>
      <span className="text-[12px] font-mono truncate flex-1">
        {endpoint.path}
      </span>
    </button>
  )
}
