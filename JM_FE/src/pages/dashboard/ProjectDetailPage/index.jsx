import { useState, useMemo, Suspense } from 'react'
import { useParams, Outlet, useMatch, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FaCode, FaUsers, FaExchangeAlt, FaExclamationTriangle } from 'react-icons/fa'
import useAuthStore from '@/stores/authStore'
import { getProjectDetail } from '@/features/project/services/projectService'
import { listFolders } from '@/features/folder/services/folderService'
import { listEndpoints } from '@/features/endpoint/services/endpointService'
import { listMembers, listProjectInvitations } from '@/features/member/services/memberService'
import { ProjectContext } from './context'
import { projectKeys } from './queryKeys'
import ProjectHeader from './components/ProjectHeader'
import TreeSidebar from './components/TreeSidebar'
import MembersPanel from './components/MembersPanel'
import ChangeRequestsPanel from './components/ChangeRequestsPanel'

function ProjectSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="h-16 border-b border-border bg-bg-surface/50 px-6 flex items-center gap-4">
        <div className="h-5 w-40 rounded bg-bg-surface" />
        <div className="h-4 w-20 rounded bg-bg-surface" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[260px] border-r border-border bg-bg-surface/30 p-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 rounded-lg bg-bg-surface" style={{ width: `${60 + i * 5}%` }} />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-4">
          <div className="h-6 w-48 rounded bg-bg-surface" />
          <div className="h-4 w-72 rounded bg-bg-surface" />
        </div>
      </div>
    </div>
  )
}

function ErrorPanel({ message }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <FaExclamationTriangle size={28} className="mx-auto mb-3 text-status-danger/40" />
        <h2 className="font-heading font-bold text-foreground mb-1">Failed to load project</h2>
        <p className="text-sm text-muted-foreground">{message ?? 'Something went wrong. Please try again.'}</p>
      </div>
    </div>
  )
}

function WelcomePanel({ myRole }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-sm">
        <FaCode size={28} className="mx-auto mb-3 text-muted-foreground/20" />
        <h3 className="font-heading font-semibold text-foreground mb-1.5">Select an endpoint</h3>
        <p className="text-sm text-muted-foreground">
          {myRole === 'PM'
            ? 'Pick an endpoint from the sidebar, or create a new one.'
            : 'Pick an endpoint from the sidebar to view its details.'}
        </p>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const authUser       = useAuthStore(s => s.user)

  const isEndpointRoute    = useMatch('/dashboard/projects/:projectId/endpoints/:endpointId')
  const [searchParams]     = useSearchParams()
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab')
    return (tab === 'members' || tab === 'requests') ? tab : 'endpoints'
  })

  // ── Queries ──────────────────────────────────────────────────────────────
  const projectQuery = useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn:  () => getProjectDetail(projectId).then(r => r.data.data.data),
    staleTime: 30_000,
  })

  const foldersQuery = useQuery({
    queryKey: projectKeys.folders(projectId),
    queryFn:  () => listFolders(projectId).then(r => r.data.data.data),
    staleTime: 60_000,
  })

  const endpointsQuery = useQuery({
    queryKey: projectKeys.endpoints(projectId),
    queryFn:  () => listEndpoints(projectId).then(r => r.data.data.data),
    staleTime: 60_000,
  })

  const membersQuery = useQuery({
    queryKey: projectKeys.members(projectId),
    queryFn:  () => listMembers(projectId).then(r => r.data.data.data),
    staleTime: 60_000,
  })

  // ── Derived: myRole ───────────────────────────────────────────────────────
  const project = projectQuery.data
  const myRole  = useMemo(() => {
    if (!project || !authUser) return null
    if (project.ownerId._id === authUser._id) return 'PM'
    const m = project.members.find(m => m.userId._id === authUser._id)
    return m?.role ?? null
  }, [project, authUser])

  const invitationsQuery = useQuery({
    queryKey: projectKeys.invitations(projectId),
    queryFn:  () => listProjectInvitations(projectId).then(r => r.data.data.data),
    staleTime: 60_000,
    enabled:  !!project && myRole === 'PM',
  })

  // ── Context value ─────────────────────────────────────────────────────────
  const ctx = useMemo(() => ({
    project,
    myRole,
    foldersQuery,
    endpointsQuery,
    membersQuery,
    invitationsQuery,
  }), [project, myRole, foldersQuery, endpointsQuery, membersQuery, invitationsQuery])

  // ── Render states ─────────────────────────────────────────────────────────
  if (projectQuery.isPending) return <ProjectSkeleton />
  if (projectQuery.isError) {
    const msg = projectQuery.error?.response?.data?.errors?.[0]?.message
    return <ErrorPanel message={msg} />
  }

  const TABS = [
    { id: 'endpoints', label: 'Endpoints',       icon: FaCode },
    { id: 'members',   label: 'Members',         icon: FaUsers },
    { id: 'requests',  label: 'Change Requests', icon: FaExchangeAlt },
  ]

  return (
    <ProjectContext.Provider value={ctx}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Project header */}
        <ProjectHeader />

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-3 pt-2 pb-0 border-b border-border bg-background shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                'flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-semibold',
                'border-b-2 -mb-px transition-all duration-150',
                activeTab === id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              <Icon size={11} />
              {label}
              {id === 'members' && (
                <span className="ml-0.5 text-[10px] text-muted-foreground/60">
                  ({membersQuery.data?.length ?? '…'})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Tree sidebar — only on endpoints tab */}
          {activeTab === 'endpoints' && <TreeSidebar />}

          {/* Main panel */}
          <div className="flex-1 overflow-y-auto" data-lenis-prevent>
            {activeTab === 'requests' ? (
              <ChangeRequestsPanel />
            ) : activeTab === 'members' ? (
              <MembersPanel />
            ) : isEndpointRoute ? (
              <Suspense fallback={
                <div className="p-6 space-y-4 animate-pulse">
                  <div className="h-7 w-64 rounded-lg bg-bg-surface" />
                  <div className="h-4 w-48 rounded bg-bg-surface" />
                </div>
              }>
                <Outlet />
              </Suspense>
            ) : (
              <WelcomePanel myRole={myRole} />
            )}
          </div>
        </div>
      </div>
    </ProjectContext.Provider>
  )
}
