import { Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar — akan diisi saat development fitur */}
      <aside className="w-64 border-r border-border shrink-0" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — akan diisi saat development fitur */}
        <header className="h-14 border-b border-border shrink-0" />

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
