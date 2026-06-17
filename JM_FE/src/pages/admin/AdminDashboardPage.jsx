import { useQuery } from '@tanstack/react-query'
import { FaUsers, FaLayerGroup, FaCode, FaBolt } from 'react-icons/fa'
import { getPlatformStats } from '@/features/admin/services/adminService'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl bg-bg-surface border border-border p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={14} />
        </div>
        <span className="text-[12px] text-muted-foreground font-medium">{label}</span>
      </div>
      <span className="text-2xl font-heading font-bold text-foreground pl-0.5">
        {value}
      </span>
    </div>
  )
}

function TopUsersTable({ users }) {
  if (!users?.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">No data available.</p>
    )
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-2 px-4 py-2.5
        bg-bg-surface text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        <span>Name</span>
        <span className="hidden sm:block">Email</span>
        <span className="sm:hidden">Email</span>
        <span className="text-right">Used</span>
        <span className="text-right">Limit</span>
      </div>

      {/* Rows */}
      {users.map((u, i) => {
        const pct = u.quota?.limit ? Math.round((u.quota.used / u.quota.limit) * 100) : 0
        const isHigh = pct >= 80
        return (
          <div
            key={u._id ?? i}
            className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-2 px-4 py-3
              border-t border-border items-center text-[13px]"
          >
            <span className="font-medium text-foreground truncate">{u.name}</span>
            <span className="text-muted-foreground truncate">{u.email}</span>
            <span className={`text-right font-mono text-[12px] ${isHigh ? 'text-status-danger' : 'text-foreground'}`}>
              {(u.quota?.used ?? 0).toLocaleString()}
            </span>
            <span className="text-right font-mono text-[12px] text-muted-foreground">
              {(u.quota?.limit ?? 0).toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-7 w-48 rounded-lg bg-bg-surface animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[88px] rounded-xl bg-bg-surface animate-pulse" />
        ))}
      </div>
      <div className="h-5 w-40 rounded bg-bg-surface animate-pulse" />
      <div className="h-48 rounded-xl bg-bg-surface animate-pulse" />
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: stats, isPending, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn:  () => getPlatformStats().then(r => r.data.data.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

  if (isPending) return <DashboardSkeleton />

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-sm text-status-danger">Failed to load platform stats.</p>
      </div>
    )
  }

  const cards = [
    { icon: FaUsers,      label: 'Total Users',     value: (stats.totalUsers ?? 0).toLocaleString(),     color: 'bg-brand-primary/10 text-brand-primary' },
    { icon: FaLayerGroup, label: 'Total Projects',  value: (stats.totalProjects ?? 0).toLocaleString(),  color: 'bg-status-success/10 text-status-success' },
    { icon: FaCode,       label: 'Total Endpoints', value: (stats.totalEndpoints ?? 0).toLocaleString(), color: 'bg-status-warning/10 text-status-warning' },
    { icon: FaBolt,       label: 'Total API Calls', value: (stats.totalApiCalls ?? 0).toLocaleString(),  color: 'bg-status-danger/10 text-status-danger' },
  ]

  return (
    <div className="p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-heading font-bold text-foreground">Platform Overview</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Real-time statistics across the platform.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Top users */}
      <div className="space-y-3">
        <h2 className="text-[15px] font-heading font-semibold text-foreground">
          Top Users by API Usage
        </h2>
        <TopUsersTable users={stats.topUsersByUsage} />
      </div>
    </div>
  )
}
