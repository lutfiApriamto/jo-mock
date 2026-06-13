import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

const fieldToJsonSchema = (field) => {
  if (field.type === 'object' && field.properties?.length) {
    return buildJsonSchema(field.properties);
  }

  if (field.type === 'array' && field.items) {
    return {
      type: 'array',
      items: fieldToJsonSchema(field.items),
    };
  }

  return { type: field.type };
};

export const buildJsonSchema = (fields) => {
  const properties = {};
  const required   = [];

  for (const field of fields) {
    properties[field.name] = fieldToJsonSchema(field);
    if (field.required) required.push(field.name);
  }

  return {
    type: 'object',
    properties,
    required,
    additionalProperties: true,
  };
};

export const validateRequestBody = (fields, body) => {
  if (!fields || fields.length === 0) {
    return { valid: true, errors: null };
  }

  const schema   = buildJsonSchema(fields);
  const validate = ajv.compile(schema);
  const valid    = validate(body);

  if (!valid) {
    const errors = validate.errors.map((err) => ({
      field:   err.instancePath.replace('/', '') || err.params?.missingProperty || 'unknown',
      message: err.message,
    }));
    return { valid: false, errors };
  }

  return { valid: true, errors: null };
};

