export const createEndpointSchema = {
  type: 'object',
  required: ['method', 'path'],
  properties: {
    method:        { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
    path:          { type: 'string', minLength: 1, maxLength: 500 },
    folderId:      { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
    requestSchema: { type: 'array' },
  },
  additionalProperties: false,
};

export const updateEndpointSchema = {
  type: 'object',
  properties: {
    method:        { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
    path:          { type: 'string', minLength: 1, maxLength: 500 },
    folderId:      { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
    requestSchema: { type: 'array' },
  },
  additionalProperties: false,
  minProperties: 1,
};
