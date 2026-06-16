import api from '@/lib/axios'

const toggleBase = (projectId, endpointId) =>
  `/projects/${projectId}/endpoints/${endpointId}/toggle`

export const getMyToggle    = (projectId, endpointId)              => api.get(toggleBase(projectId, endpointId))
export const upsertToggle   = (projectId, endpointId, responseId)  => api.put(toggleBase(projectId, endpointId), { responseId })
export const resetToggle    = (projectId, endpointId)              => api.delete(toggleBase(projectId, endpointId))
export const listMyToggles  = (projectId)                          => api.get(`/projects/${projectId}/toggles`)
