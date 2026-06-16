import api from '@/lib/axios'

export const searchUsers      = (q)    => api.get('/users/search', { params: { q } })
export const getMyProfile     = ()     => api.get('/users/me')
export const updateMyProfile  = (body) => api.put('/users/me', body)
export const changePassword   = (body) => api.patch('/users/me/password', body)
export const regenerateApiKey = (body) => api.post('/users/me/api-key/regenerate', body)
