# JO-MOCK Backend — Developer Guidelines

Dokumen ini adalah referensi teknis bagi developer yang bekerja pada codebase backend JO-MOCK. Baca dokumen ini sebelum menambahkan modul, middleware, atau fitur baru.

---

## Daftar Isi

1. [Arsitektur Overview](#arsitektur-overview)
2. [ESM & Konvensi Import](#esm--konvensi-import)
3. [Request Pipeline (Middleware Chain)](#request-pipeline-middleware-chain)
4. [Pola Modul (Routes → Controller → Service)](#pola-modul-routes--controller--service)
5. [Sistem Autentikasi & Otorisasi](#sistem-autentikasi--otorisasi)
6. [Format Response & Error Handling](#format-response--error-handling)
7. [Validasi Input](#validasi-input)
8. [Database & Model Conventions](#database--model-conventions)
9. [Relasi Antar Model & Cascade Delete](#relasi-antar-model--cascade-delete)
10. [Utilities Reference](#utilities-reference)
11. [Sistem Email](#sistem-email)
12. [Sistem Mock](#sistem-mock)
13. [Sistem Invitation & Kuota Slot](#sistem-invitation--kuota-slot)
14. [Contract Versioning & Diff System](#contract-versioning--diff-system)
15. [Aturan Bisnis & Batasan](#aturan-bisnis--batasan)
16. [Konvensi Penamaan & Kode](#konvensi-penamaan--kode)
17. [Cara Menambahkan Modul Baru](#cara-menambahkan-modul-baru)
18. [Deployment (Vercel Serverless)](#deployment-vercel-serverless)

---

## Arsitektur Overview

```
Request
  │
  ▼
api/index.js       ← Vercel serverless entry point
  │
  ▼
src/app.js         ← Express instance, global middleware, route mounting
  │
  ├── Global Middleware (CORS, JSON, cookie-parser, sanitizer)
  ├── DB Middleware (connectDB per-request, serverless caching)
  │
  ▼
Route Handler
  │
  ├── auth.middleware.js       ← Validasi JWT, populate req.user
  ├── admin.middleware.js      ← Cek req.user.role === 'superadmin'
  ├── permission.middleware.js ← Cek project membership + role, populate req.project
  ├── quota.middleware.js      ← (Mock routes only) cek & increment quota
  ├── validate.middleware.js   ← Ajv JSON Schema validation
  │
  ▼
Controller        ← asyncHandler wrapper, memanggil service, memanggil sendSuccess/sendError
  │
  ▼
Service           ← Logika bisnis, query DB, throw AppError jika kondisi tidak terpenuhi
  │
  ▼
Model             ← Mongoose schema + pre-hooks + index definitions
  │
  ▼
MongoDB Atlas     ← Cloud database
```

---

## ESM & Konvensi Import

Project ini menggunakan **ES Modules**. `package.json` memiliki `"type": "module"`.

```js
// ✅ Benar — gunakan import/export
import express from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
export default router;

// ❌ Salah — jangan gunakan require() / module.exports
const express = require('express'); // AKAN ERROR
```

**Wajib sertakan `.js` extension** pada semua relative import:

```js
// ✅ Benar
import asyncHandler from '../../utils/asyncHandler.js';

// ❌ Salah
import asyncHandler from '../../utils/asyncHandler';
```

---

## Request Pipeline (Middleware Chain)

### Untuk route dashboard (JWT-based)

```
Request
  │
  ├── CORS check
  ├── express.json()           — parse body
  ├── cookieParser()           — parse cookie (untuk refresh token)
  ├── mongoSanitizer           — strip $ dan . dari input (prevent NoSQL injection)
  ├── xssSanitizer             — strip HTML tags dari string fields
  ├── connectDB()              — koneksi MongoDB (dengan caching serverless)
  │
  ├── auth                     — validasi JWT, set req.user (full Mongoose doc)
  ├── validate(schema)         — (jika ada) validasi body via Ajv
  ├── permission(roles[])      — (jika ada) validasi project membership
  │
  ▼
  Controller → Service → Response
```

### Untuk route mock server (/mock/*)

```
Request
  │
  ├── (global middleware sama di atas)
  ├── apiKey                   — validasi x-api-key header, set req.mockUser
  ├── quota                    — cek quota.used < quota.limit, increment setelah sukses
  │
  ▼
  Mock Controller → Mock Service → Response (raw, bukan wrapper)
```

---

## Pola Modul (Routes → Controller → Service)

Setiap modul terdiri dari 3 file utama (plus schema jika ada validasi input):

```
src/modules/<nama>/
├── <nama>.routes.js      ← Express Router, definisi path & middleware
├── <nama>.controller.js  ← Thin layer: baca req, panggil service, kirim response
├── <nama>.service.js     ← Logika bisnis, query DB, validasi semantik
└── <nama>.schema.js      ← Ajv JSON Schema untuk validasi request body
```

### routes.js — Template

```js
import { Router }    from 'express';
import auth          from '../../middlewares/auth.middleware.js';
import permission    from '../../middlewares/permission.middleware.js';
import validate      from '../../middlewares/validate.middleware.js';
import * as schema   from './example.schema.js';
import * as ctrl     from './example.controller.js';

const router = Router();

// GET /api/projects/:projectId/examples — PM, FE, BE boleh akses
router.get(
  '/:projectId/examples',
  auth,
  permission(['PM', 'FE', 'BE']),
  ctrl.listExamples,
);

// POST /api/projects/:projectId/examples — PM saja
router.post(
  '/:projectId/examples',
  auth,
  permission(['PM']),
  validate(schema.createExampleSchema),
  ctrl.createExample,
);

export default router;
```

### controller.js — Template

```js
import asyncHandler     from '../../utils/asyncHandler.js';
import { sendSuccess }  from '../../utils/apiResponse.js';
import * as service     from './example.service.js';

// Controller hanya bertanggung jawab untuk:
// 1. Membaca req (params, query, body, user, project)
// 2. Memanggil satu fungsi service
// 3. Memanggil sendSuccess
// Logika bisnis TIDAK boleh ada di controller.

export const listExamples = asyncHandler(async (req, res) => {
  const result = await service.listExamples(req.project);
  sendSuccess(res, result, 'Daftar berhasil diambil');
});

export const createExample = asyncHandler(async (req, res) => {
  const example = await service.createExample(req.project, req.user._id, req.body);
  sendSuccess(res, example, 'Berhasil dibuat', 201);
});
```

### service.js — Template

```js
import AppError   from '../../utils/AppError.js'; // jika ada
import Example    from '../../models/example.model.js';

export const listExamples = async (project) => {
  return Example.find({ projectId: project._id }).lean();
};

export const createExample = async (project, userId, body) => {
  const { name } = body;

  // Validasi semantik di sini (bukan di controller)
  const exists = await Example.findOne({ projectId: project._id, name });
  if (exists) {
    const err = new Error('Nama sudah digunakan dalam project ini');
    err.statusCode = 409;  // errorType 'Conflict' di-derive otomatis dari 409
    throw err;
  }

  const example = await Example.create({ projectId: project._id, createdBy: userId, name });
  return example;
};
```

---

## Sistem Autentikasi & Otorisasi

### JWT (Access Token)

- **Secret:** `process.env.KEY`
- **Durasi:** 15 menit
- **Payload:** `{ id: <user._id>, role: <user.role> }`
- **Header:** `Authorization: Bearer <token>`

```js
// jwtHelper.js
signToken(payload, '15m')  // generate token
verifyToken(token)          // returns { valid, decoded, errorName }
```

### Refresh Token (Opaque)

- **Generate:** `crypto.randomBytes(40)` → hex string (80 karakter)
- **Simpan di DB:** `crypto.createHash('sha256').update(rawToken).digest('hex')`
- **Kirim ke client:** via HttpOnly cookie `jm_refresh`
- **Cookie options:**
  ```js
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 hari
    path: '/api/auth',                   // hanya dikirim ke route auth
  }
  ```
- **Rotasi:** Setiap `POST /api/auth/refresh` → token lama langsung diinvalidasi → token baru digenerate

### auth.middleware.js — Detail

```js
// 1. Extract token dari header
const token = req.headers.authorization?.split(' ')[1];
// 2. Verify JWT
const { valid, decoded, errorName } = verifyToken(token);
// 3. Jika invalid/expired → 401
// 4. Fetch FULL user dari DB (bukan dari JWT payload saja)
const user = await User.findById(decoded.id);
// 5. req.user = user (Mongoose document, bukan plain object)
```

**PENTING:** `req.user` adalah **Mongoose document**, bukan plain object. Gunakan `req.user._id` untuk ObjectId. Jangan gunakan `req.user.id` — meskipun Mongoose menyediakan virtual getter `.id` (string), WAJIB konsisten menggunakan `._id` di seluruh codebase untuk menghindari kebingungan di aggregation dan direct comparison.

```js
// ✅ Benar — selalu gunakan ini
req.user._id

// ❌ Salah — meskipun secara fungsional sering tidak error karena Mongoose casting
req.user.id
```

### permission.middleware.js — Detail

```js
// Dipanggil dengan: permission(['PM']) atau permission(['PM', 'FE', 'BE'])
// 1. Extract projectId dari req.params (nama param bisa :projectId, :id)
// 2. Fetch project dari DB (Project.findById) → req.project (Mongoose doc)
// 3. Jika superadmin → bypass semua cek
// 4. Cek apakah req.user._id ada di project.members → req.projectRole
// 5. Cek apakah role ada di allowed list
// 6. req.project = project, req.projectRole = role
```

**Superadmin** selalu bypass permission check dan dapat mengakses semua project.

### API Key (Mock Server)

```js
// apiKey.middleware.js
// Header: x-api-key: <uuid>
// Cek: User.findOne({ apiKey: key })
// Jika tidak ada → 401
// req.mockUser = user (Mongoose doc)
```

---

## Format Response & Error Handling

### sendSuccess

```js
import { sendSuccess } from '../../utils/apiResponse.js';

// Signature
sendSuccess(res, data, message, statusCode = 200, meta = null)

// meta adalah objek dari buildPaginationMeta()
// Jika meta ada, response akan menyertakan totalData dan totalPage

// Contoh tanpa pagination
sendSuccess(res, project, 'Project berhasil dibuat', 201);

// Contoh dengan pagination
const { page, limit, skip } = getPaginationParams(req.query);
const [data, total] = await Promise.all([...]);
const meta = buildPaginationMeta(total, page, limit);
sendSuccess(res, data, 'Daftar berhasil diambil', 200, meta);
```

### sendError

```js
import { sendError } from '../../utils/apiResponse.js';

// Signature — URUTAN PENTING (sering tertukar)
sendError(res, message, statusCode, errors = null, errorType = null)
//                                  ^4th: array  ^5th: string override

// Penggunaan umum (errorType di-derive otomatis dari statusCode)
sendError(res, 'Project tidak ditemukan', 404);

// Dengan errors detail (misal validation errors dari Ajv/Mongoose)
sendError(res, 'Validasi gagal', 400, [{ message: 'name terlalu pendek', code: 400 }], 'ValidationError');
```

### Cara Melempar Error dari Service

Tidak ada class `AppError` tersendiri — cukup buat Error biasa dengan `statusCode`. `errorType` di-derive otomatis dari statusCode oleh `sendError` via `HTTP_ERROR_TYPES`.

```js
const err = new Error('Email sudah terdaftar');
err.statusCode = 409;   // wajib — menentukan HTTP status + errorType otomatis
throw err;
// → errorType otomatis: 'Conflict' (dari HTTP_ERROR_TYPES[409])
```

HTTP_ERROR_TYPES mapping lengkap:

| statusCode | errorType |
|---|---|
| 400 | `BadRequest` |
| 401 | `Unauthorized` |
| 403 | `Forbidden` |
| 404 | `NotFound` |
| 409 | `Conflict` |
| 410 | `Gone` |
| 422 | `UnprocessableEntity` |
| 429 | `TooManyRequests` |
| 500 | `InternalServerError` |

HTTP 410 digunakan khusus untuk token/undangan yang sudah kedaluwarsa (bukan NotFound, karena token ditemukan tapi sudah tidak valid).

### errorHandler.js — Apa yang Ditangani Otomatis

Error handler global (`src/middlewares/errorHandler.js`) menangani beberapa error khusus secara otomatis:

| Tipe Error | Kondisi | HTTP Status |
|---|---|---|
| `ValidationError` (Mongoose) | `err.name === 'ValidationError'` | 400 |
| Duplicate key | `err.code === 11000` | 409 |
| `CastError` (ObjectId invalid) | `err.name === 'CastError'` | 400 |
| JWT `TokenExpiredError` | `err.name === 'TokenExpiredError'` | 401 |
| JWT `JsonWebTokenError` | `err.name === 'JsonWebTokenError'` | 401 |
| Error kustom dari service | `err.statusCode + err.errorType` ada | sesuai err.statusCode |
| Semua lainnya | fallback | 500 InternalServerError |

### asyncHandler

```js
// Setiap controller WAJIB dibungkus asyncHandler
// Ini menangkap semua error async dan meneruskannya ke errorHandler via next(err)
import asyncHandler from '../../utils/asyncHandler.js';

export const myController = asyncHandler(async (req, res) => {
  // Tidak perlu try-catch di sini
  const result = await myService.doSomething();
  sendSuccess(res, result, 'Berhasil');
});
```

---

## Validasi Input

### validate.middleware.js

Middleware validasi menggunakan **Ajv** (Another JSON Validator). Schema ditulis sebagai JSON Schema standar.

```js
// Cara penggunaan di routes.js
import validate from '../../middlewares/validate.middleware.js';
import * as schema from './example.schema.js';

router.post('/path', auth, validate(schema.createSchema), ctrl.create);
```

### Menulis Schema (example.schema.js)

```js
// Tipe yang didukung Ajv: string, number, integer, boolean, object, array, null
// Semua field di req.body yang tidak ada di schema langsung DITOLAK
// (additionalProperties: false)

export const createProjectSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
    },
  },
  additionalProperties: false,
};

export const updateRoleSchema = {
  type: 'object',
  required: ['role'],
  properties: {
    role: {
      type: 'string',
      enum: ['PM', 'FE', 'BE'],
    },
  },
  additionalProperties: false,
};
```

### Validasi Body Mock Request (schemaValidator.js)

Khusus untuk mock server, `requestSchema` dari endpoint dikonversi menjadi JSON Schema Ajv secara runtime:

```js
import { validateRequestBody } from '../../utils/schemaValidator.js';

// requestSchema = array of { name, type, required, properties? }
const errors = validateRequestBody(endpoint.requestSchema, req.body);
if (errors.length > 0) {
  // throw 422 UnprocessableEntity
}
```

**Batasan nesting requestSchema:** Maksimal **3 level** kedalaman. Dibatasi di app layer saat `createEndpoint`/`updateEndpoint`, bukan di Mongoose schema.

---

## Database & Model Conventions

### Koneksi DB (db.js)

Karena project dideploy di Vercel (serverless), koneksi MongoDB di-cache menggunakan `global.mongoose`:

```js
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

if (cached.conn) return cached.conn; // reuse koneksi yang ada
```

`bufferCommands: false` — Mongoose tidak akan buffer query jika koneksi belum ready; akan langsung error. Ini aman karena `connectDB()` selalu dipanggil sebelum route handler.

### Konvensi Model

```js
// Selalu export default sebagai nama singular PascalCase
export default mongoose.model('User', userSchema);

// Nama collection otomatis plural lowercase: 'users', 'projects', dst.
```

### Field Timestamps

Semua model HARUS menggunakan `{ timestamps: true }` di option schema:

```js
const exampleSchema = new Schema({...}, { timestamps: true });
```

Ini otomatis menambahkan `createdAt` dan `updatedAt`.

### Index

Definisikan index di level schema, bukan di model:

```js
// Unique index biasa
userSchema.index({ email: 1 }, { unique: true });

// Unique index partial (hanya berlaku untuk dokumen tertentu)
invitationSchema.index(
  { projectId: 1, invitedUserId: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

// TTL index (auto-delete dokumen saat field date tercapai)
invitationSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });
```

### Lean Queries

Untuk read-only query yang tidak perlu Mongoose methods (save, populate, dll), gunakan `.lean()` untuk performa lebih baik:

```js
// Dengan lean — plain JS object, lebih cepat
const users = await User.find({}).lean();

// Tanpa lean — Mongoose document, gunakan jika perlu .save() atau .populate()
const user = await User.findById(id);
await user.save();
```

---

## Relasi Antar Model & Cascade Delete

### Skema Relasi

```
User
  ├── apiKey (embedded, UUID)
  ├── quota (embedded: { limit, used })
  └── refreshTokenHash (string)

Project
  ├── ownerId → User._id
  ├── members[] (embedded array)
  │     ├── userId → User._id
  │     ├── role (PM/FE/BE)
  │     └── joinedAt
  └── contractVersion (number, auto-increment)

Folder
  ├── projectId → Project._id
  └── parentId → Folder._id (nullable, null = root)

Endpoint
  ├── projectId → Project._id
  ├── folderId → Folder._id (nullable)
  ├── defaultResponseId → Response._id (nullable)
  └── requestSchema (embedded array of fieldSchema)

Response
  ├── projectId → Project._id
  ├── endpointId → Endpoint._id
  ├── statusCode (number)
  ├── body (string — JSON serialized)
  └── isDefault (boolean)

Toggle
  ├── userId → User._id
  ├── projectId → Project._id
  ├── endpointId → Endpoint._id
  └── responseId → Response._id
  (unique index: { userId, endpointId })

ChangeRequest
  ├── projectId → Project._id
  └── submittedBy → User._id

ContractVersion
  ├── projectId → Project._id
  ├── changedBy → User._id
  ├── changeRequestId → ChangeRequest._id (nullable)
  └── diff (embedded object)

Invitation
  ├── projectId → Project._id
  ├── invitedBy → User._id
  └── invitedUserId → User._id
```

### Cascade Delete Rules

Ketika sebuah entitas dihapus, semua entitas yang bergantung padanya HARUS dihapus secara manual (MongoDB tidak melakukan cascade otomatis).

| Hapus | Cascade ke |
|---|---|
| **Project** | Folder, Endpoint, Response, Toggle, ChangeRequest, ContractVersion, Invitation |
| **Folder** | Subfolder rekursif (BFS), Endpoint di folder ini (+ Response + Toggle per endpoint) |
| **Endpoint** | Response (semua milik endpoint ini), Toggle (semua yang menunjuk ke endpoint ini) |
| **Response** | Toggle (semua yang activeResponseId menunjuk ke response ini) — catatan: response default TIDAK BISA dihapus (constraint 409), sehingga `endpoint.defaultResponseId` tidak perlu di-clear |
| **User (via admin)** | Project miliknya di-transfer ke superadmin, User dihapus dari project.members, Invitation dihapus |

### Contoh Cascade Delete Project

```js
// project.service.js — deleteProject
// PENTING: Response dan Toggle TIDAK punya field projectId.
// Keduanya hanya punya endpointId, jadi harus ambil endpointIds dulu.
import Folder         from '../../models/folder.model.js';
import Endpoint       from '../../models/endpoint.model.js';
import Response       from '../../models/response.model.js';
import Toggle         from '../../models/toggle.model.js';
import ChangeRequest  from '../../models/changeRequest.model.js';
import ContractVersion from '../../models/contractVersion.model.js';
import Invitation     from '../../models/invitation.model.js';

const projectId = project._id;

// Ambil semua endpoint ID terlebih dahulu
const endpoints   = await Endpoint.find({ projectId }).select('_id').lean();
const endpointIds = endpoints.map((e) => e._id);

await Promise.all([
  Folder.deleteMany({ projectId }),
  Endpoint.deleteMany({ projectId }),
  Response.deleteMany({ endpointId: { $in: endpointIds } }),   // bukan projectId!
  Toggle.deleteMany({ endpointId: { $in: endpointIds } }),     // bukan projectId!
  ChangeRequest.deleteMany({ projectId }),
  ContractVersion.deleteMany({ projectId }),
  Invitation.deleteMany({ projectId }),
]);
await project.deleteOne();
```

---

## Utilities Reference

### `apiResponse.js`

```js
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

sendSuccess(res, data, message, statusCode = 200, meta = null)
// meta = { totalData, totalPage } dari buildPaginationMeta()

sendError(res, message, statusCode, errors = null, errorType = null)
// Parameter ke-4 = errors (array), ke-5 = errorType (string override, opsional)
```

### `asyncHandler.js`

```js
import asyncHandler from '../../utils/asyncHandler.js';

// Bungkus semua async controller dengan ini
export const myCtrl = asyncHandler(async (req, res) => { ... });
```

### `jwtHelper.js`

```js
import { signToken, verifyToken } from '../../utils/jwtHelper.js';

// Generate token
const accessToken = signToken({ id: user._id, role: user.role }, '15m');
const refreshToken = signToken({ id: user._id }, '30d'); // hanya untuk refresh flow

// Verify token
const { valid, decoded, errorName } = verifyToken(token);
// decoded = payload jika valid, errorName = 'TokenExpiredError' | 'JsonWebTokenError' jika tidak
```

### `paginate.js`

```js
import { getPaginationParams, buildPaginationMeta } from '../../utils/paginate.js';

// Di controller/service
const { page, limit, skip } = getPaginationParams(req.query);
// page: default 1, limit: default 10, max 100, skip: (page-1)*limit

const [data, total] = await Promise.all([
  Model.find(query).skip(skip).limit(limit).lean(),
  Model.countDocuments(query),
]);

const meta = buildPaginationMeta(total, page, limit);
// meta = { totalData: total, totalPage: Math.ceil(total/limit) }

sendSuccess(res, data, 'Berhasil', 200, meta);
```

### `pathMatcher.js`

```js
import matchPath from '../../utils/pathMatcher.js';

// Mencari endpoint yang cocok dengan request path
// Static match (exact string) menang atas dynamic match (:param)
// Contoh: GET /api/users/me → static, menang atas /api/users/:id → dynamic

const matched = matchPath(endpoints, requestMethod, requestPath);
// matched = Endpoint document atau null
```

### `schemaValidator.js`

```js
import { validateRequestBody, buildJsonSchema } from '../../utils/schemaValidator.js';

// Validasi body request berdasarkan requestSchema endpoint
// errors = [] artinya valid
const errors = validateRequestBody(endpoint.requestSchema, req.body);
// errors = array of string — pesan error per field

// buildJsonSchema mengonversi requestSchema array ke JSON Schema Ajv
const jsonSchema = buildJsonSchema(fields); // internal use
```

### `contractDiff.js`

```js
import { createDiff, formatDiffForEmail, CHANGE_TYPES } from '../../utils/contractDiff.js';

// CHANGE_TYPES — keys SCREAMING_SNAKE_CASE, values lowercase string
// CHANGE_TYPES.ENDPOINT_ADDED    → 'endpoint_added'
// CHANGE_TYPES.ENDPOINT_DELETED  → 'endpoint_deleted'
// CHANGE_TYPES.ENDPOINT_MODIFIED → 'endpoint_modified'
// CHANGE_TYPES.RESPONSE_ADDED    → 'response_added'
// CHANGE_TYPES.RESPONSE_MODIFIED → 'response_modified'
// CHANGE_TYPES.RESPONSE_DELETED  → 'response_deleted'
// CHANGE_TYPES.SCHEMA_MODIFIED   → 'schema_modified'
// Catatan: 'cr_approved' TIDAK ada di CHANGE_TYPES — ditulis sebagai string literal langsung
// di changeRequest.service.js saat membuat ContractVersion untuk CR yang disetujui.

// Membuat objek diff — gunakan SCREAMING_SNAKE_CASE key
const diff = createDiff(CHANGE_TYPES.ENDPOINT_MODIFIED, {
  method: 'POST',
  path: '/api/users',
  changes: [{ field: 'requestSchema', changed: true }],
});

// Format untuk email (array maupun single object diterima)
const textSummary = formatDiffForEmail(diff); // → '• Endpoint diubah: POST /api/users'
```

### `generateSlug.js`

```js
import { generateUniqueSlug } from '../../utils/generateSlug.js'; // named export

// Generate slug unik dari nama project
// Contoh: "My Project!" → "my-project"
// Jika sudah ada "my-project" di DB → coba "my-project-1", "my-project-2", dst.
// Melempar Error jika nama menghasilkan slug kosong (misal nama hanya karakter spesial)
const slug = await generateUniqueSlug(name);
```

---

## Sistem Email

### Konfigurasi (mailer.js)

```js
// Gmail SMTP dengan connection pooling
// pool: true, maxConnections: 1 — satu koneksi dipertahankan
// Ini diperlukan untuk sequential email delivery
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  maxConnections: 1,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Cara Kirim Email (dari Service)

`mailer.js` mengekspos fungsi `sendMail` — **jangan import `transporter` langsung**. Field `from` sudah di-set otomatis di dalam wrapper.

```js
import { sendMail } from '../../config/mailer.js';
import { myEmailTemplate } from '../../templates/myEmail.template.js';

// Kirim ke satu penerima
const { subject, html, text } = myEmailTemplate({ name: user.name, link: '...' });
await sendMail({ to: user.email, subject, html, text });

// Kirim ke banyak penerima — WAJIB sequential, bukan Promise.all
for (const member of members) {
  try {
    await sendMail({ to: member.email, subject, html, text });
  } catch (emailErr) {
    console.error(`Gagal kirim ke ${member.email}:`, emailErr.message);
    // Jangan throw — kegagalan email tidak boleh gagalkan request
  }
}
```

**ATURAN:** Email ke banyak penerima WAJIB dikirim secara sequential dengan `for...of`. Jangan gunakan `Promise.all()` untuk pengiriman email — ini bisa menyebabkan SMTP connection overload.

**ATURAN:** Kegagalan pengiriman email **tidak boleh menyebabkan request gagal**. Selalu bungkus dalam try-catch per penerima.

### Membuat Template Baru (templates/)

```js
// templates/myNotification.template.js
// Ikuti struktur template yang sudah ada:
// 1. Background gelap (#1a1a2e atau sejenisnya)
// 2. Card putih di tengah
// 3. Logo / Badge berwarna di atas
// 4. Konten informasi
// 5. CTA Button (jika ada)
// 6. Footer dengan info kontak

export const myNotificationTemplate = ({ name, data }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notifikasi</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f1a;font-family:Arial,sans-serif;">
  <!-- Ikuti style dari template yang sudah ada -->
</body>
</html>
`;
```

**Wajib:** Semua template menggunakan inline CSS (bukan class) karena banyak email client tidak mendukung `<style>` tag.

### Daftar Template yang Ada

| File | Trigger |
|---|---|
| `forgotPassword.template.js` | Request reset password |
| `resetPassword.template.js` | Konfirmasi reset sukses |
| `emailChange.template.js` | Ubah email (2 email: lama & baru) |
| `passwordChange.template.js` | Konfirmasi ubah password |
| `projectInvitation.template.js` | Undangan project ke user |
| `memberJoined.template.js` | Notifikasi ke PM saat undangan diterima |
| `crSubmitted.template.js` | Notifikasi ke PM saat CR diajukan |
| `crApproved.template.js` | Notifikasi ke semua member saat CR disetujui |
| `crRejected.template.js` | Notifikasi ke submitter saat CR ditolak |
| `contractChange.template.js` | Notifikasi perubahan kontrak ke semua member |

---

## Sistem Mock

### Cara Kerja Mock Server

```
1. User kirim request:
   GET /mock/project-alpha/api/users/123
   Header: x-api-key: <uuid>

2. apiKey.middleware
   → Cari user berdasarkan apiKey
   → req.mockUser = user

3. quota.middleware
   → Cek quota.used >= quota.limit → jika penuh: 429
   → Increment quota.used SEKARANG (await, bukan fire & forget) → next()
   (Kuota berkurang meski controller gagal karena middleware sudah increment sebelum next())

4. mock.controller → mock.service.executeMock()

5. executeMock (urutan penting — sesuai kode):
   a. Cari project berdasarkan slug ("project-alpha") → 404 jika tidak ada
   b. Cek mockUser adalah member atau owner project → 403 jika bukan
   c. Ambil semua endpoint project yang method-nya cocok
   d. Jalankan pathMatcher(endpoints, path)
      → Static match menang atas dynamic (:param)
      → 404 jika tidak ada yang cocok
   e. Jika method POST/PUT/PATCH DAN endpoint punya requestSchema:
      → Validasi req.body dengan schemaValidator (Ajv, additionalProperties: true)
      → Jika gagal → 422 dengan detail error per field
   f. Resolusi response:
      → Cek Toggle user untuk endpoint ini
      → Jika ada → gunakan toggle.activeResponseId
      → Jika tidak ada toggle → gunakan endpoint.defaultResponseId
      → Jika tidak ada default sama sekali → error 503
   g. Fetch dokumen Response dari DB → 503 defensif jika hilang (cascade delete seharusnya mencegah ini)
   h. Kembalikan response ke controller

6. Controller kirim response.body (parsed JSON) dengan response.statusCode → RAW, tanpa wrapper

7. Response yang dikirim ke client adalah JSON LANGSUNG (bukan wrapper)
   Contoh: { "message": "success", "data": { "id": 1, "name": "Budi" } }
```

### pathMatcher — Prioritas Matching

```
Endpoint yang ada di DB:
  GET /api/users
  GET /api/users/me
  GET /api/users/:id

Request: GET /api/users/me
→ Cocok secara static dengan /api/users/me ✓ (menang)
→ Cocok secara dynamic dengan /api/users/:id ✗ (kalah)

Request: GET /api/users/123
→ Tidak cocok secara static
→ Cocok secara dynamic dengan /api/users/:id ✓
```

---

## Sistem Invitation & Kuota Slot

### Konstanta

```js
const MAX_MEMBER_SLOTS = 9; // termasuk owner
```

### Kalkulasi Slot Tersedia

```js
const getAvailableSlots = async (project) => {
  const pendingCount = await Invitation.countDocuments({
    projectId: project._id,
    status: 'pending',
  });
  // Slot = max - (anggota aktif) - (undangan pending)
  return MAX_MEMBER_SLOTS - project.members.length - pendingCount;
};
```

**Penting:** `project.members` sudah termasuk owner, sehingga formula ini konsisten.

### Alur Invitation

```
PM → POST /invite
  │
  ├── Cek userId bukan sudah anggota
  ├── Cek tidak ada pending invitation untuk userId ini
  ├── Hitung availableSlots
  │   └── Jika ≤ 0 → 409 Conflict
  │
  ├── Generate raw token (40 bytes hex)
  ├── Hash token dengan SHA-256 → simpan di DB
  ├── Kirim raw token via email (bukan hash)
  └── Response 201

User klik link di email → FE buka halaman accept
  │
  ├── GET /api/invitations/:rawToken
  │   → Cari Invitation by hash(rawToken)
  │   → Return detail undangan (bukan token)
  │
  └── POST /api/invitations/:rawToken/accept
      ├── Validate hash(rawToken) ada di DB
      ├── Cek status 'pending' (belum expired/accepted/declined)
      ├── Cek req.user._id === invitation.invitedUserId
      ├── Tambahkan ke project.members
      ├── Set invitation.status = 'accepted'
      └── Kirim email ke PM
```

### TTL Auto-Delete

MongoDB TTL index `{ expiry: 1 }, { expireAfterSeconds: 0 }` secara otomatis menghapus dokumen invitation ketika tanggal `expiry` tercapai. Background MongoDB process mengecek index ini setiap ~60 detik.

Slot yang direservasi oleh invitation expired otomatis tersedia kembali setelah dokumen dihapus.

---

## Contract Versioning & Diff System

### Kapan ContractVersion Dibuat

1. **PM direct edit endpoint** — saat `PUT /api/projects/:id/endpoints/:id` mengubah `method`, `path`, atau `requestSchema`
2. **CR approved** — saat PM approve change request

### Struktur Diff Object

```js
// CHANGE_TYPES dari contractDiff.js — keys SCREAMING_SNAKE_CASE, values string lowercase
// CHANGE_TYPES.ENDPOINT_ADDED    = 'endpoint_added'
// CHANGE_TYPES.ENDPOINT_DELETED  = 'endpoint_deleted'
// CHANGE_TYPES.ENDPOINT_MODIFIED = 'endpoint_modified'
// CHANGE_TYPES.RESPONSE_ADDED    = 'response_added'
// CHANGE_TYPES.RESPONSE_MODIFIED = 'response_modified'
// CHANGE_TYPES.RESPONSE_DELETED  = 'response_deleted'
// CHANGE_TYPES.SCHEMA_MODIFIED   = 'schema_modified'
//
// PENTING: 'cr_approved' TIDAK ada di CHANGE_TYPES.
// Pada saat CR disetujui, ContractVersion dibuat dengan type: 'cr_approved' sebagai STRING LITERAL,
// bukan sebagai CHANGE_TYPES property.

// Contoh diff object
{
  type: 'endpoint_modified',
  summary: 'Endpoint diubah: POST /api/users',
  changes: [
    { field: 'requestSchema', changed: true },
    { field: 'method', from: 'POST', to: 'PUT' },
  ]
}
```

### Auto-increment contractVersion

```js
// Setelah membuat ContractVersion baru
await Project.findByIdAndUpdate(project._id, { $inc: { contractVersion: 1 } });
```

---

## Aturan Bisnis & Batasan

### Project

- Maksimal anggota + pending invitations: **9** (termasuk owner)
- Nama project: 2–100 karakter
- Slug auto-generate dari nama, unik di seluruh platform

### Endpoint

- Method: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Kombinasi `method + path` unik per project
- requestSchema: maksimal **3 level** nesting
- Perubahan method/path/requestSchema → otomatis buat ContractVersion + notifikasi email

### Response

- `body` harus berupa **string JSON yang valid** (bukan object)
- Hanya response dengan statusCode 2xx (200–299) yang bisa menjadi default
- Response default tidak bisa dihapus; harus ganti default dulu
- Auto-default: jika endpoint belum punya defaultResponseId dan response baru adalah 2xx → otomatis jadi default

### Toggle

- Satu toggle per user per endpoint (unique compound index `{ userId, endpointId }`)
- Reset toggle = hapus dokumen toggle → fallback ke endpoint.defaultResponseId (idempotent, tidak error jika toggle belum ada)
- Saat response dihapus → toggle yang `activeResponseId` menunjuk ke response itu otomatis dihapus
- Saat PM mengubah default response (`setDefaultResponse`) → toggle user yang masih di old default otomatis pindah ke default baru; toggle yang sudah customized tidak diubah
- `listMyToggles` hanya mengembalikan endpoint yang sudah di-customize user; endpoint tanpa toggle → FE fallback ke `endpoint.defaultResponseId`
- `getMyToggle` selalu mengembalikan field `isCustomized: boolean` agar FE tahu apakah ini pilihan user atau default endpoint

### Change Request

- Hanya FE/BE yang bisa submit CR (PM tidak bisa)
- Hanya submitter yang bisa batalkan CR
- CR hanya bisa dibatalkan jika statusnya masih `pending`
- CR approved/rejected tidak bisa diubah

### Auth

- Password: minimal 8, maksimal 72 karakter (bcrypt limit)
- Reset password token: valid 1 jam
- Invitation token: valid 7 hari
- Rate limit login/register/forgot-password: 10 request per 15 menit per IP

### Admin

- Superadmin tidak bisa menghapus atau mengubah role dirinya sendiri
- Hapus user → project miliknya di-transfer ke superadmin yang sedang login (bukan dihapus)

---

## Konvensi Penamaan & Kode

### Nama File

| Tipe | Konvensi | Contoh |
|---|---|---|
| Controller | `<nama>.controller.js` | `project.controller.js` |
| Service | `<nama>.service.js` | `project.service.js` |
| Routes | `<nama>.routes.js` | `project.routes.js` |
| Schema | `<nama>.schema.js` | `project.schema.js` |
| Model | `<nama>.model.js` | `project.model.js` |
| Middleware | `<nama>.middleware.js` | `auth.middleware.js` |
| Utility | `<nama>.js` (camelCase) | `jwtHelper.js`, `paginate.js` |
| Template | `<nama>.template.js` | `projectInvitation.template.js` |

### Nama Variabel & Fungsi

- **camelCase** untuk variabel dan fungsi: `getUserDetail`, `projectId`, `asyncHandler`
- **PascalCase** untuk class dan Mongoose model: `User`, `Project`, `ChangeRequest`
- **SCREAMING_SNAKE_CASE** untuk konstanta: `MAX_MEMBER_SLOTS`, `SALT_ROUNDS`, `CHANGE_TYPES`

### Pesan Error (errorHandler & Service)

- Tulis dalam **Bahasa Indonesia** untuk konsistensi dengan codebase saat ini
- Spesifik dan informatif: "Email sudah terdaftar" lebih baik dari "Data sudah ada"
- Jangan expose detail teknis ke client (nama table, query, stack trace)

### Komentar & Dokumentasi Kode

- Gunakan komentar **seksi** untuk memisahkan bagian dalam file panjang:
  ```js
  // ─── User Management ─────────────────────────────────────────────────────────
  ```
- Komentar inline hanya untuk hal yang non-obvious
- Jangan komentar yang hanya menjelaskan "apa" yang dilakukan kode — nama fungsi & variabel harus sudah jelas

---

## Cara Menambahkan Modul Baru

Misalkan kita ingin menambahkan modul `webhook` yang memungkinkan PM mendaftarkan URL webhook untuk notifikasi.

### Langkah 1: Buat Model

```js
// src/models/webhook.model.js
import mongoose, { Schema } from 'mongoose';

const webhookSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  url: { type: String, required: true },
  events: [{ type: String }],
  secret: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

webhookSchema.index({ projectId: 1 });

export default mongoose.model('Webhook', webhookSchema);
```

### Langkah 2: Buat Schema Validasi

```js
// src/modules/webhook/webhook.schema.js
export const createWebhookSchema = {
  type: 'object',
  required: ['url'],
  properties: {
    url: { type: 'string', minLength: 10, maxLength: 500 },
    events: {
      type: 'array',
      items: { type: 'string', enum: ['cr_submitted', 'cr_approved', 'endpoint_changed'] },
    },
  },
  additionalProperties: false,
};
```

### Langkah 3: Buat Service

```js
// src/modules/webhook/webhook.service.js
import Webhook from '../../models/webhook.model.js';

export const listWebhooks = async (project) => {
  return Webhook.find({ projectId: project._id }).lean();
};

export const createWebhook = async (project, body) => {
  const { url, events = [] } = body;
  return Webhook.create({ projectId: project._id, url, events });
};
```

### Langkah 4: Buat Controller

```js
// src/modules/webhook/webhook.controller.js
import asyncHandler    from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as service    from './webhook.service.js';

export const listWebhooks = asyncHandler(async (req, res) => {
  const webhooks = await service.listWebhooks(req.project);
  sendSuccess(res, webhooks, 'Daftar webhook berhasil diambil');
});

export const createWebhook = asyncHandler(async (req, res) => {
  const webhook = await service.createWebhook(req.project, req.body);
  sendSuccess(res, webhook, 'Webhook berhasil didaftarkan', 201);
});
```

### Langkah 5: Buat Routes

```js
// src/modules/webhook/webhook.routes.js
import { Router }   from 'express';
import auth         from '../../middlewares/auth.middleware.js';
import permission   from '../../middlewares/permission.middleware.js';
import validate     from '../../middlewares/validate.middleware.js';
import * as schema  from './webhook.schema.js';
import * as ctrl    from './webhook.controller.js';

const router = Router();

router.get(
  '/:projectId/webhooks',
  auth,
  permission(['PM', 'FE', 'BE']),
  ctrl.listWebhooks,
);

router.post(
  '/:projectId/webhooks',
  auth,
  permission(['PM']),
  validate(schema.createWebhookSchema),
  ctrl.createWebhook,
);

export default router;
```

### Langkah 6: Daftarkan di app.js

```js
// src/app.js — tambahkan import dan app.use
import webhookRoutes from './modules/webhook/webhook.routes.js';

// Di bagian routes, tambahkan:
app.use('/api/projects', webhookRoutes);
```

### Langkah 7: Update Cascade Delete Project

Jika modul baru memiliki data yang terikat ke project, tambahkan ke cascade delete di `project.service.js`:

```js
import Webhook from '../../models/webhook.model.js';

// Di dalam deleteProject:
await Promise.all([
  // ... existing cascade
  Webhook.deleteMany({ projectId }),
  project.deleteOne(),
]);
```

---

## Deployment (Vercel Serverless)

### Entry Point

```js
// api/index.js — Vercel entry point
import app from '../src/app.js';

export default app; // Vercel memanggil app sebagai request handler
```

### Konfigurasi Vercel (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

### Perbedaan Serverless vs Traditional Server

| Aspek | Traditional | Serverless (Vercel) |
|---|---|---|
| DB Connection | Sekali connect saat start | Caching di `global.mongoose`, reconnect per cold start |
| PORT | Diset via `process.env.PORT` | Tidak relevan (Vercel handle sendiri) |
| Cookie `secure` | Opsional | Wajib `true` di production |
| File system | Writable | Read-only (jangan simpan file lokal) |
| Cold start | Tidak ada | Ada — koneksi DB bisa lambat ~1-2 detik |

### Environment Variables di Vercel

Tambahkan semua env variable via Vercel Dashboard → Project Settings → Environment Variables. Jangan commit `.env` ke git.

### CORS di Production

`process.env.CLIENT_URL` harus diisi dengan URL frontend production:

```
CLIENT_URL=https://jo-mock.vercel.app
```

### Express 5 & Named Wildcard

Mock routes menggunakan Express 5 named wildcard syntax:

```js
// Express 5 — nama wildcard wajib
router.all('/:slug/*path', apiKey, quota, ctrl.executeMock);

// Bukan Express 4 — tidak bisa digunakan
router.all('/:slug/*', ...); // TIDAK VALID di Express 5
```
