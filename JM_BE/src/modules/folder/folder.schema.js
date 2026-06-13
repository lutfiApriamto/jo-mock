export const createFolderSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name:     { type: 'string', minLength: 1, maxLength: 100 },
    parentId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
  },
  additionalProperties: false,
};

export const renameFolderSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
  },
  additionalProperties: false,
};
