export const endpointDetailKeys = {
  detail:    (projectId, endpointId) => ['endpoint', projectId, endpointId],
  responses: (projectId, endpointId) => ['endpoint', projectId, endpointId, 'responses'],
  toggle:    (projectId, endpointId) => ['endpoint', projectId, endpointId, 'toggle'],
}
