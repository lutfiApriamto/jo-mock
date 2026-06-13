export const createResponseSchema = {
  type: 'object',
  required: ['statusCode'],
  properties: {
    statusCode: { type: 'integer', minimum: 100, maximum: 599 },
    body:       { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

// Schema untuk update response — minimal satu field harus dikirim.
export const updateResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer', minimum: 100, maximum: 599 },
    body:       { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
  minProperties: 1,
};
