import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 border-r border-border shrink-0" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border shrink-0" />

        <main className="flex-1 p-6 overflow-auto">
          <Suspense fallback={<div className="w-full h-32 animate-pulse bg-bg-surface rounded-xl" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
