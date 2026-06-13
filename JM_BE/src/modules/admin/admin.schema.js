export const updateQuotaSchema = {
  type: 'object',
  required: ['limit'],
  properties: {
    limit: { type: 'number', minimum: 0 },
  },
  additionalProperties: false,
};

export const updateRoleSchema = {
  type: 'object',
  required: ['role'],
  properties: {
    role: { type: 'string', enum: ['user', 'superadmin'] },
  },
  additionalProperties: false,
};
