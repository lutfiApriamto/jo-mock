import api from '@/lib/axios'

export const getPlatformStats  = ()                    => api.get('/admin/stats')
export const listUsers         = (params = {})         => api.get('/admin/users', { params })
export const getUserDetail     = (userId)              => api.get(`/admin/users/${userId}`)
export const updateUserRole    = (userId, role)        => api.patch(`/admin/users/${userId}/role`, { role })
export const updateQuotaLimit  = (userId, limit)       => api.patch(`/admin/users/${userId}/quota`, { limit })
export const resetQuota        = (userId)              => api.post(`/admin/users/${userId}/quota/reset`)
export const deleteUser        = (userId)              => api.delete(`/admin/users/${userId}`)
export const listAllProjects   = (params = {})         => api.get('/admin/projects', { params })
export const forceDeleteProject = (projectId)          => api.delete(`/admin/projects/${projectId}`)
