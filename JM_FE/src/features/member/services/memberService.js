import api from '@/lib/axios'

const base        = (projectId) => `/projects/${projectId}/members`
const inviteBase  = (projectId) => `${base(projectId)}/invitations`

export const listMembers           = (projectId)                       => api.get(base(projectId))
export const inviteMember          = (projectId, userId, role)         => api.post(`${base(projectId)}/invite`, { userId, role })
export const updateMemberRole      = (projectId, userId, role)         => api.put(`${base(projectId)}/${userId}`, { role })
export const removeMember          = (projectId, userId)               => api.delete(`${base(projectId)}/${userId}`)
export const transferOwnership     = (projectId, userId)               => api.patch(`/projects/${projectId}/transfer-ownership`, { userId })
// Keluar project. Owner wajib kirim newOwnerId; member biasa cukup tanpa argumen.
export const leaveProject          = (projectId, newOwnerId)           => api.post(`/projects/${projectId}/leave`, newOwnerId ? { newOwnerId } : {})

export const listProjectInvitations = (projectId)                      => api.get(inviteBase(projectId))
export const resendInvitation       = (projectId, invitationId)        => api.post(`${inviteBase(projectId)}/${invitationId}/resend`)
export const cancelInvitation       = (projectId, invitationId)        => api.delete(`${inviteBase(projectId)}/${invitationId}`)
