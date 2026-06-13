// Skema validasi untuk update profile.
// Tidak ada required di level Ajv — aturan bisnis (mis. currentPassword wajib jika email berubah)
// divalidasi di service layer karena bersifat kondisional.
export const updateProfileSchema = {
  type: 'object',
  properties: {
    name:            { type: 'string', minLength: 2, maxLength: 50 },
    avatar:          { type: 'string', minLength: 1, maxLength: 50 },
    email:           { type: 'string', minLength: 5, maxLength: 100 },
    currentPassword: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

// currentPassword diperlukan untuk verifikasi identitas sebelum ganti password.
// newPassword min 8 sesuai standar yang sama dengan register.
export const changePasswordSchema = {
  type: 'object',
  required: ['currentPassword', 'newPassword'],
  properties: {
    currentPassword: { type: 'string', minLength: 1 },
    newPassword:     { type: 'string', minLength: 8, maxLength: 72 },
  },
  additionalProperties: false,
};

// currentPassword diperlukan sebagai konfirmasi sebelum API key baru digenerate.
// Proteksi ekstra: API key yang bocor tidak bisa di-regenerate tanpa password.
export const regenerateApiKeySchema = {
  type: 'object',
  required: ['currentPassword'],
  properties: {
    currentPassword: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};
