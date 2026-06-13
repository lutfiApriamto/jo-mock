export const registerSchema = {
  type: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name:     { type: 'string', minLength: 2, maxLength: 50 },
    email:    { type: 'string', minLength: 5, maxLength: 100 },
    password: { type: 'string', minLength: 8, maxLength: 72 },
  },
  additionalProperties: false,
};

export const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email:    { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

export const forgotPasswordSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

export const resetPasswordSchema = {
  type: 'object',
  required: ['newPassword'],
  properties: {
    newPassword: { type: 'string', minLength: 8, maxLength: 72 },
  },
  additionalProperties: false,
};

