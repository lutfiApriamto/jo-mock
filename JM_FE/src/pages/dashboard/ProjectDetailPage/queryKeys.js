export const projectKeys = {
  detail:         (id)              => ['project', id],
  folders:        (id)              => ['project', id, 'folders'],
  endpoints:      (id)              => ['project', id, 'endpoints'],
  members:        (id)              => ['project', id, 'members'],
  invitations:    (id)              => ['project', id, 'invitations'],
  changeRequests: (id, status = 'all') => ['project', id, 'changeRequests', status],
}
