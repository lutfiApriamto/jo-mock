// proposedChanges bertipe bebas (Opsi C) — FE/BE bisa mengisi format apapun.
// Ajv hanya memastikan key ada, tidak membatasi strukturnya.
export const submitCRSchema = {
  type: 'object',
  required: ['description', 'proposedChanges'],
  properties: {
    description:     { type: 'string', minLength: 10, maxLength: 500 },
    proposedChanges: {},
  },
  additionalProperties: false,
};

// reason bersifat opsional — PM boleh menolak tanpa memberikan alasan tertulis.
export const rejectCRSchema = {
  type: 'object',
  properties: {
    reason: { type: 'string', minLength: 1, maxLength: 500 },
  },
  additionalProperties: false,
};
