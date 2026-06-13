export const inviteMemberSchema = {
  type: 'object',
  required: ['userId', 'role'],
  properties: {
    userId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
    role:   { type: 'string', enum: ['PM', 'FE', 'BE'] },
  },
  additionalProperties: false,
};

export const updateMemberSchema = {
  type: 'object',
  required: ['role'],
  properties: {
    role: { type: 'string', enum: ['PM', 'FE', 'BE'] },
  },
  additionalProperties: false,
};

export const transferOwnershipSchema = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
  },
  additionalProperties: false,
};
