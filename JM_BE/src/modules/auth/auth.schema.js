// Validation schemas untuk setiap endpoint auth — dipakai oleh validate() middleware

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

/*
  LOGIKA PEMROGRAMAN — auth.schema.js
  -------------------------------------
  File ini mengekspor JSON Schema objects yang dipakai oleh validate() middleware
  di auth.routes.js untuk memvalidasi req.body sebelum menyentuh controller.

  Pemisahan schema ke file sendiri (bukan ditulis langsung di routes):
  - Membuat routes.js tetap ringkas dan fokus pada mapping URL → handler
  - Schema bisa ditest atau direuse secara independen jika diperlukan

  Penjelasan per schema:

  registerSchema:
  - name: minimal 2 karakter (menghindari inisial saja), maksimal 50
  - email: validasi format dasar via panjang minimum — format email sepenuhnya
    dipercayakan ke Mongoose unique constraint dan error handling DB (error 11000)
  - password: minimal 8 karakter (standar keamanan dasar), maksimal 72 karakter
    karena bcrypt memotong input di 72 byte — lebih dari itu diabaikan oleh bcrypt

  loginSchema:
  - Validasi minimal — hanya cek bahwa field tidak kosong
  - Pesan error yang informatif (field yang mana) datang dari validate middleware
  - Cek kredensial (apakah email/password cocok) dilakukan di service, bukan di schema

  forgotPasswordSchema:
  - Hanya butuh email
  - Tidak ada cek format ketat — service akan silently succeed meski email tidak ada di DB
    (mencegah user enumeration attack: attacker tidak bisa tahu email mana yang terdaftar)

  resetPasswordSchema:
  - Token reset tidak ada di body — diambil dari req.params.token (URL path)
  - Hanya newPassword yang perlu divalidasi
  - confirmPassword adalah urusan frontend — tidak perlu duplikasi cek di backend

  additionalProperties: false:
  - Mencegah user mengirim field ekstra yang tidak diharapkan
  - Diterapkan di register karena data langsung dipakai untuk membuat dokumen User
  - Di login/forgot/reset tidak kritis tapi tetap ditulis sebagai good practice
*/
