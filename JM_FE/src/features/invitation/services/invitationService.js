import api from '@/lib/axios'

// Token-based (dari email link) — GET public, no auth
export const getInvitationByToken  = (token) => api.get(`/invitations/${token}`)

// Token-based accept/decline (dari email link) — auth required
export const acceptInvitation      = (token) => api.post(`/invitations/${token}/accept`)
export const declineInvitation     = (token) => api.post(`/invitations/${token}/decline`)

// ID-based accept/decline (dari dashboard) — auth required
export const acceptInvitationById  = (id)    => api.post(`/users/me/invitations/${id}/accept`)
export const declineInvitationById = (id)    => api.post(`/users/me/invitations/${id}/decline`)

// List semua pending invitation milik user yang sedang login
export const getMyInvitations      = ()      => api.get('/users/me/invitations')
