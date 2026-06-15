import { Suspense, useState } from 'react'
import { Outlet, useMatches } from 'react-router-dom'
import DocsNavbar from '@/shared/components/DocsNavbar'
import DocsSidebar from '@/shared/components/DocsSidebar'
import TableOfContents from '@/shared/components/TableOfContents'

export default function DocsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const matches = useMatches()
  const toc = matches.at(-1)?.handle?.toc ?? []

  return (
    <div className="min-h-screen bg-background">
      <DocsNavbar
        menuOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen(v => !v)}
      />

      <div className="flex">
        <DocsSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
            <Suspense
              fallback={
                <div className="space-y-4 animate-pulse">
                  <div className="h-10 bg-muted rounded-xl w-2/3" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                  <div className="h-4 bg-muted rounded w-4/6" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>

        <TableOfContents items={toc} />
      </div>
    </div>
  )
}
