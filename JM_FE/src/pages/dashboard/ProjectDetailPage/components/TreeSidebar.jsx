import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaPlus, FaSearch, FaTimes, FaFolderPlus } from 'react-icons/fa'
import { useProjectCtx } from '../context'
import FolderNode from './FolderNode'
import EndpointNode from './EndpointNode'
import CreateFolderModal from './CreateFolderModal'
import CreateEndpointModal from './CreateEndpointModal'

function buildTree(folders, endpoints) {
  const folderMap = {}
  folders.forEach(f => {
    folderMap[f._id] = { ...f, children: [], endpoints: [] }
  })

  const rootFolders = []
  folders.forEach(f => {
    if (f.parentId && folderMap[f.parentId]) {
      folderMap[f.parentId].children.push(folderMap[f._id])
    } else {
      rootFolders.push(folderMap[f._id])
    }
  })

  endpoints.forEach(ep => {
    if (ep.folderId && folderMap[ep.folderId]) {
      folderMap[ep.folderId].endpoints.push(ep)
    }
  })

  const rootEndpoints = endpoints.filter(ep => !ep.folderId)

  return { rootFolders, rootEndpoints }
}

export default function TreeSidebar() {
  const { myRole, foldersQuery, endpointsQuery } = useProjectCtx()
  const folders   = foldersQuery.data   ?? []
  const endpoints = endpointsQuery.data ?? []

  const [search,         setSearch]         = useState('')
  const [showNewFolder,  setShowNewFolder]  = useState(false)
  const [showNewEndpoint,setShowNewEndpoint]= useState(false)

  const { rootFolders, rootEndpoints } = useMemo(
    () => buildTree(folders, endpoints),
    [folders, endpoints]
  )

  const filteredEndpoints = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    return endpoints.filter(
      ep => ep.path.toLowerCase().includes(q) || ep.method.toLowerCase().includes(q)
    )
  }, [endpoints, search])

  const isFiltering = search.trim().length > 0

  return (
    <aside className="w-[260px] shrink-0 border-r border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-muted-foreground/50 tracking-widest uppercase px-1">
            Explorer
          </span>
          {myRole === 'PM' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowNewFolder(true)}
                title="New folder"
                className="w-6 h-6 flex items-center justify-center rounded-md
                  text-muted-foreground hover:text-foreground hover:bg-bg-surface
                  transition-all duration-150"
              >
                <FaFolderPlus size={11} />
              </button>
              <button
                onClick={() => setShowNewEndpoint(true)}
                title="New endpoint"
                className="w-6 h-6 flex items-center justify-center rounded-md
                  text-muted-foreground hover:text-foreground hover:bg-bg-surface
                  transition-all duration-150"
              >
                <FaPlus size={10} />
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2
            text-muted-foreground/40 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter endpoints…"
            className="w-full pl-7 pr-7 py-1.5 rounded-lg text-[12px] text-foreground
              bg-bg-surface border border-border/60 placeholder:text-muted-foreground/30
              focus:outline-none focus:ring-1 focus:ring-brand-primary/20
              transition-all duration-150"
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2
                  text-muted-foreground/40 hover:text-muted-foreground"
              >
                <FaTimes size={9} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-y-auto px-1.5 pb-3" data-lenis-prevent>
        {isFiltering ? (
          /* Flat filtered list */
          filteredEndpoints.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <p className="text-[12px] text-muted-foreground/50">No endpoints match</p>
            </div>
          ) : (
            <div className="space-y-0.5 pt-1">
              {filteredEndpoints.map(ep => (
                <EndpointNode key={ep._id} endpoint={ep} />
              ))}
            </div>
          )
        ) : (
          /* Structured tree */
          <>
            {rootFolders.length === 0 && rootEndpoints.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center gap-2">
                <p className="text-[12px] text-muted-foreground/50">
                  {myRole === 'PM' ? 'Add folders or endpoints to get started.' : 'No endpoints yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5 pt-1">
                {rootFolders.map(folder => (
                  <FolderNode key={folder._id} folder={folder} depth={0} />
                ))}
                {rootEndpoints.map(ep => (
                  <EndpointNode key={ep._id} endpoint={ep} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNewFolder && (
          <CreateFolderModal onClose={() => setShowNewFolder(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showNewEndpoint && (
          <CreateEndpointModal onClose={() => setShowNewEndpoint(false)} />
        )}
      </AnimatePresence>
    </aside>
  )
}
