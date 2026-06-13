import Ajv        from 'ajv';
import { sendError } from '../utils/apiResponse.js';

const ajv = new Ajv({ allErrors: true });

const validate = (schema) => (req, res, next) => {
  const validateFn = ajv.compile(schema);
  const valid      = validateFn(req.body);

  if (!valid) {
    const errors = validateFn.errors.map((err) => ({
      field:   err.instancePath.replace('/', '') || err.params?.missingProperty || 'unknown',
      message: err.message,
    }));
    return sendError(res, 'Data yang dikirim tidak valid', 400, errors);
  }

  next();
};

export default validate;

