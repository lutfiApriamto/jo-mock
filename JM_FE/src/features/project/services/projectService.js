import api from '@/lib/axios'

export const listProjects     = (params)            => api.get('/projects', { params })
export const searchProjects   = (q)                 => api.get('/projects/search', { params: { q } })
export const createProject    = (name)              => api.post('/projects', { name })
export const updateProject    = (projectId, name)   => api.put(`/projects/${projectId}`, { name })
export const deleteProject    = (projectId)         => api.delete(`/projects/${projectId}`)
export const getProjectDetail = (projectId)         => api.get(`/projects/${projectId}`)
