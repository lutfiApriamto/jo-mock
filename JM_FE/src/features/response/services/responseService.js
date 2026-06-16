import api from '@/lib/axios'

const base = (projectId, endpointId) =>
  `/projects/${projectId}/endpoints/${endpointId}/responses`

export const listResponses      = (projectId, endpointId)                          => api.get(base(projectId, endpointId))
export const createResponse     = (projectId, endpointId, body)                    => api.post(base(projectId, endpointId), body)
export const updateResponse     = (projectId, endpointId, responseId, body)        => api.put(`${base(projectId, endpointId)}/${responseId}`, body)
export const setDefaultResponse = (projectId, endpointId, responseId)              => api.patch(`${base(projectId, endpointId)}/${responseId}/set-default`)
export const deleteResponse     = (projectId, endpointId, responseId)              => api.delete(`${base(projectId, endpointId)}/${responseId}`)
