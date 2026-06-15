import { filterXSS } from 'xss';

// Ganti karakter operator MongoDB pada key object ($ di awal, . sebagai path)
// dengan '_' untuk mencegah NoSQL injection. Menggantikan express-mongo-sanitize
// yang tidak kompatibel dengan Express 5.
const cleanKey = (key) => {
  if (key.startsWith('$')) key = `_${key.slice(1)}`;
  return key.replace(/\./g, '_');
};

const sanitizeValue = (value) => {
  if (typeof value === 'string') return filterXSS(value);
  if (Array.isArray(value))      return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [cleanKey(k), sanitizeValue(v)])
    );
  }
  return value;
};

// Satu middleware untuk MongoDB-operator stripping + XSS filtering.
export const sanitizer = (req, res, next) => {
  // req.body adalah property biasa (di-set express.json) — boleh di-assign langsung.
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  // Express 5: req.query adalah getter-only — TIDAK bisa di-assign.
  // Shadow getter prototype dengan own data property yang writable.
  if (req.query && typeof req.query === 'object') {
    Object.defineProperty(req, 'query', {
      value: sanitizeValue(req.query),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  next();
};
