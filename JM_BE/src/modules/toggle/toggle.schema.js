export const upsertToggleSchema = {
  type: 'object',
  required: ['responseId'],
  properties: {
    responseId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
  },
  additionalProperties: false,
};
