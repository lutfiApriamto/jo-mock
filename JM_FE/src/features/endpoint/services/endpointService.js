import api from '@/lib/axios'

const base = (projectId) => `/projects/${projectId}/endpoints`

export const listEndpoints     = (projectId, params)                => api.get(base(projectId), { params })
export const getEndpointDetail = (projectId, endpointId)            => api.get(`${base(projectId)}/${endpointId}`)
export const createEndpoint    = (projectId, body)                   => api.post(base(projectId), body)
export const updateEndpoint    = (projectId, endpointId, body)       => api.put(`${base(projectId)}/${endpointId}`, body)
export const deleteEndpoint    = (projectId, endpointId)             => api.delete(`${base(projectId)}/${endpointId}`)
