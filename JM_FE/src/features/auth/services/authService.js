import api from '@/lib/axios'

export const register        = (data)  => api.post('/auth/register', data)
export const login           = (data)  => api.post('/auth/login', data)
export const logout          = ()      => api.post('/auth/logout')
export const refreshToken    = ()      => api.post('/auth/refresh')
export const forgotPassword  = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword   = (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword })
export const getProfile      = ()      => api.get('/auth/profile')
