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

/*
  LOGIKA PEMROGRAMAN — validate.middleware.js
  ---------------------------------------------
  Middleware ini berbeda dari schemaValidator.js:
  - schemaValidator.js → validasi payload FE saat hit URL mock (terhadap kontrak di DB)
  - validate.middleware.js → validasi request body yang masuk ke API dashboard kita sendiri

  Pola factory function:
  - validate() menerima 'schema' (JSON Schema object) dan mengembalikan middleware
  - Ini disebut "middleware factory" atau "higher-order middleware"
  - Cara pemakaian di routes:
      const createProjectSchema = {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 }
        }
      }
      router.post('/', auth, validate(createProjectSchema), projectController.create)
  - Setiap route bisa punya schema validasinya sendiri

  Ajv instance:
  - Dibuat sekali di scope module (singleton) — tidak dibuat ulang setiap request
  - allErrors: true → kumpulkan semua error sekaligus, bukan berhenti di error pertama
  - ajv.compile() → compile schema menjadi fungsi validator (di-cache otomatis oleh Ajv)

  Mapping error:
  - err.instancePath → path field yang error, mis. '/name' → distrip jadi 'name'
  - err.params.missingProperty → nama field yang wajib tapi tidak dikirim (untuk error 'required')
  - Format hasil: [{ field: 'name', message: 'must be string' }]
  - Error dikirim via sendError dengan status 400 dan array errors di field terpisah

  Kenapa tidak async?
  - Validasi JSON Schema adalah operasi sinkron (tidak ada I/O)
  - Tidak butuh async/await, tidak butuh asyncHandler
*/
