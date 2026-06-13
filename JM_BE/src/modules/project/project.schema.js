export const createProjectSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
  },
  additionalProperties: false,
};

export const updateProjectSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 100 },
  },
  additionalProperties: false,
};

