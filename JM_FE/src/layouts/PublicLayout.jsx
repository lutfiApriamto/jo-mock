import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
