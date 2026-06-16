import { createContext, useContext } from 'react'

export const ProjectContext = createContext(null)

export const useProjectCtx = () => {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjectCtx must be used inside ProjectDetailPage')
  return ctx
}
