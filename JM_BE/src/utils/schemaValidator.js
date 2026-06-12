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

/*
  LOGIKA PEMROGRAMAN — schemaValidator.js
  ----------------------------------------
  Masalah yang diselesaikan:
  Ketika FE memanggil URL mock dengan method POST/PUT/PATCH, sistem harus
  memvalidasi apakah payload yang dikirim sesuai dengan Request Schema yang
  didefinisikan di kontrak. Library yang dipakai adalah Ajv (JSON Schema validator).

  Ajv({ allErrors: true }):
  - Instance Ajv dibuat sekali di scope module (singleton) agar tidak dibuat ulang tiap request
  - allErrors: true → kumpulkan SEMUA error, bukan berhenti di error pertama
  - Ini agar FE tahu semua field yang bermasalah sekaligus, bukan satu per satu

  fieldToJsonSchema(field):
  - Mengkonversi satu field dari format internal kita ke format JSON Schema standar
  - Jika type = 'object' → rekursif ke buildJsonSchema dengan child properties-nya
  - Jika type = 'array'  → bungkus dengan { type: 'array', items: ... } lalu rekursif lagi
  - Jika type primitif (string/number/boolean) → langsung return { type: field.type }
  - Rekursi ini yang memungkinkan nesting field berjalan otomatis

  buildJsonSchema(fields):
  - Mengkonversi array fields dari DB menjadi JSON Schema lengkap
  - Memisahkan field yang required ke array 'required' (format JSON Schema)
  - additionalProperties: true → FE boleh kirim field ekstra, tidak diblokir

  validateRequestBody(fields, body):
  - Titik masuk utama yang dipanggil dari mock.service.js
  - Jika endpoint tidak punya requestSchema (fields kosong) → langsung valid, skip validasi
  - ajv.compile() → compile schema menjadi fungsi validator (di-cache otomatis oleh Ajv)
  - Hasil error di-map ke format { field, message } agar mudah dibaca FE
  - instancePath berisi path seperti '/address/city', di-replace '/' menjadi nama field
*/
