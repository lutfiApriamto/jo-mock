import api from '@/lib/axios'

const base = (projectId) => `/projects/${projectId}/folders`

export const listFolders   = (projectId)                  => api.get(base(projectId))
export const createFolder  = (projectId, name, parentId)  => api.post(base(projectId), { name, ...(parentId && { parentId }) })
export const renameFolder  = (projectId, folderId, name)  => api.put(`${base(projectId)}/${folderId}`, { name })
export const deleteFolder  = (projectId, folderId)        => api.delete(`${base(projectId)}/${folderId}`)
