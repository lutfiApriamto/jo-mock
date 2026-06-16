import { useState, useEffect, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DesktopSidebar from './components/DesktopSidebar'
import MobileSidebar from './components/MobileSidebar'
import Topbar from './components/Topbar'

export default function DashboardLayout() {
  const { pathname }              = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile drawer on every route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <DesktopSidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <Topbar onMenuOpen={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto" data-lenis-prevent>
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>

      </div>
    </div>
  )
}

function PageFallback() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 rounded-lg bg-bg-surface animate-pulse" />
      <div className="h-4 w-72 rounded bg-bg-surface animate-pulse" />
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-36 rounded-xl bg-bg-surface animate-pulse" />
        ))}
      </div>
    </div>
  )
}
