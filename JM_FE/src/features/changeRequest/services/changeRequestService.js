import api from '@/lib/axios'

export const listCRs     = (projectId, params = {})     => api.get(`/projects/${projectId}/change-requests`, { params })
export const getCRDetail = (projectId, crId)            => api.get(`/projects/${projectId}/change-requests/${crId}`)
export const submitCR    = (projectId, data)            => api.post(`/projects/${projectId}/change-requests`, data)
export const approveCR   = (projectId, crId)            => api.patch(`/projects/${projectId}/change-requests/${crId}/approve`)
export const rejectCR    = (projectId, crId, data = {}) => api.patch(`/projects/${projectId}/change-requests/${crId}/reject`, data)
export const cancelCR    = (projectId, crId)            => api.delete(`/projects/${projectId}/change-requests/${crId}`)
