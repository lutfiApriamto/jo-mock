import mongoSanitize from 'express-mongo-sanitize';
import { filterXSS }  from 'xss';

const sanitizeValue = (value) => {
  if (typeof value === 'string')  return filterXSS(value);
  if (Array.isArray(value))       return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)])
    );
  }
  return value;
};

export const mongoSanitizer = mongoSanitize({ replaceWith: '_' });

export const xssSanitizer = (req, res, next) => {
  if (req.body)  req.body  = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  next();
};

