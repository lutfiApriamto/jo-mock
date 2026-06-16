import { createContext, useContext } from 'react'

export const EndpointContext = createContext(null)

export const useEndpointCtx = () => {
  const ctx = useContext(EndpointContext)
  if (!ctx) throw new Error('useEndpointCtx must be used inside EndpointDetailPage')
  return ctx
}
