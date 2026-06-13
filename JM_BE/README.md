# JO-MOCK Backend — API Documentation

**JO-MOCK** (Joint Operations Mock) adalah platform mocking API berbasis kontrak yang memungkinkan tim FE dan BE berkolaborasi menggunakan kontrak API yang terstruktur dan terkontrol versinya.

---

## Daftar Isi

1. [Tech Stack](#tech-stack)
2. [Prasyarat](#prasyarat)
3. [Instalasi & Setup](#instalasi--setup)
4. [Environment Variables](#environment-variables)
5. [Menjalankan Server](#menjalankan-server)
6. [Struktur Direktori](#struktur-direktori)
7. [Format Response Global](#format-response-global)
8. [Autentikasi](#autentikasi)
9. [API Reference](#api-reference)
   - [Auth](#-auth)
   - [User](#-user)
   - [Project](#-project)
   - [Member & Invitation](#-member--invitation)
   - [Folder](#-folder)
   - [Endpoint](#-endpoint)
   - [Response](#-response)
   - [Toggle](#-toggle)
   - [Change Request](#-change-request)
   - [Contract Version](#-contract-version)
   - [Mock Server](#-mock-server)
   - [Admin](#-admin)
10. [Sistem Email](#sistem-email)
11. [Sistem Kuota Mock](#sistem-kuota-mock)

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js (ESM — `"type": "module"`) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Authentication | JWT (access token) + Opaque Refresh Token |
| Validasi | Ajv (JSON Schema) |
| Email | Nodemailer + Gmail SMTP |
| Password hashing | bcrypt (12 salt rounds) |
| Rate limiting | express-rate-limit |
| Deploy | Vercel (serverless, via `api/index.js`) |

---

## Prasyarat

- Node.js ≥ 18
- MongoDB Atlas (atau MongoDB lokal)
- Akun Gmail dengan App Password aktif

---

## Instalasi & Setup

```bash
# 1. Clone dan masuk ke direktori backend
cd JM_BE

# 2. Install dependencies
npm install

# 3. Salin file env
cp .env.example .env

# 4. Isi semua env variable (lihat bagian Environment Variables)
# 5. Jalankan server
npm run dev
```

---

## Environment Variables

Buat file `.env` di root `JM_BE/` dengan isi berikut:

```env
# ─── Database ──────────────────────────────────────────────────────────────────
URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/jo-mock?retryWrites=true&w=majority

# ─── JWT ───────────────────────────────────────────────────────────────────────
KEY=your_jwt_secret_key_panjang_dan_aman

# ─── Server ────────────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ─── Email (Gmail SMTP) ────────────────────────────────────────────────────────
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password

# ─── Superadmin Initial Credentials ────────────────────────────────────────────
EMAIL_ADMIN=admin@example.com
EMAIL_ADMIN_PASS=superadmin_password_minimal_8_karakter
```

### Penjelasan Variabel

| Variabel | Keterangan |
|---|---|
| `URI` | MongoDB connection string |
| `KEY` | Secret key untuk JWT signing (minimal 32 karakter acak) |
| `PORT` | Port dev server (default: 5000) |
| `NODE_ENV` | `development` atau `production` |
| `CLIENT_URL` | URL frontend (untuk CORS dan link email) |
| `EMAIL_USER` | Akun Gmail pengirim email |
| `EMAIL_PASS` | Gmail App Password (bukan password akun biasa) |
| `EMAIL_ADMIN` | Email superadmin yang dibuat saat inisialisasi |
| `EMAIL_ADMIN_PASS` | Password superadmin (min 8 karakter) |

---

## Menjalankan Server

```bash
# Development (dengan nodemon)
npm run dev

# Production
npm start
```

Server berjalan di `http://localhost:5000` (default).

---

## Struktur Direktori

```
JM_BE/
├── api/
│   └── index.js                 # Entry point untuk Vercel serverless
├── src/
│   ├── app.js                   # Express app setup, route mounting
│   ├── config/
│   │   ├── db.js                # Koneksi MongoDB dengan serverless caching
│   │   └── mailer.js            # Nodemailer transporter (Gmail SMTP pool)
│   ├── middlewares/
│   │   ├── admin.middleware.js  # Cek role superadmin
│   │   ├── apiKey.middleware.js # Validasi x-api-key header (mock server)
│   │   ├── auth.middleware.js   # Validasi JWT, attach req.user (full doc)
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── notFound.middleware.js
│   │   ├── permission.middleware.js # Cek project role, attach req.project
│   │   ├── quota.middleware.js  # Cek & increment quota mock hit
│   │   ├── sanitizer.middleware.js  # MongoDB & XSS sanitizer
│   │   └── validate.middleware.js   # Ajv JSON Schema validator
│   ├── models/
│   │   ├── changeRequest.model.js
│   │   ├── contractVersion.model.js
│   │   ├── endpoint.model.js
│   │   ├── invitation.model.js
│   │   ├── project.model.js
│   │   ├── response.model.js
│   │   ├── toggle.model.js
│   │   └── user.model.js
│   ├── modules/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── changeRequest/
│   │   ├── contractVersion/
│   │   ├── endpoint/
│   │   ├── folder/
│   │   ├── invitation/
│   │   ├── member/
│   │   ├── mock/
│   │   ├── project/
│   │   ├── response/
│   │   ├── toggle/
│   │   └── user/
│   ├── templates/               # HTML email templates
│   └── utils/
│       ├── apiResponse.js       # sendSuccess / sendError helpers
│       ├── asyncHandler.js      # Express async error wrapper
│       ├── contractDiff.js      # Diff builder untuk ContractVersion
│       ├── generateSlug.js      # Auto-slug generator dari nama project
│       ├── jwtHelper.js         # signToken / verifyToken
│       ├── paginate.js          # getPaginationParams / buildPaginationMeta
│       ├── pathMatcher.js       # Cocokkan path mock dengan endpoint (static > dynamic)
│       └── schemaValidator.js   # Ajv runtime validator untuk mock request body
└── package.json
```

---

## Format Response Global

Semua response menggunakan wrapper konsisten yang sama.

### Response Sukses

```json
{
  "errorStatus": false,
  "data": {
    "data": { ... },
    "message": "Pesan informatif"
  }
}
```

### Response Sukses dengan Pagination

```json
{
  "errorStatus": false,
  "data": {
    "data": [ ... ],
    "message": "Daftar berhasil diambil",
    "totalData": 45,
    "totalPage": 5
  }
}
```

### Response Error

```json
{
  "errorStatus": true,
  "errorType": "BadRequest",
  "errors": [
    { "message": "Pesan error detail", "code": 400 }
  ]
}
```

### Response Error Validasi

```json
{
  "errorStatus": true,
  "errorType": "ValidationError",
  "errors": [
    { "message": "name: must NOT have fewer than 2 characters", "code": 400 },
    { "message": "email: must be string", "code": 400 }
  ]
}
```

### Error Types

| errorType | HTTP Status |
|---|---|
| `BadRequest` | 400 |
| `ValidationError` | 400 (Ajv/Mongoose schema validation) |
| `Unauthorized` | 401 |
| `Forbidden` | 403 |
| `NotFound` | 404 |
| `Conflict` | 409 |
| `Gone` | 410 (token/undangan sudah kedaluwarsa) |
| `UnprocessableEntity` | 422 |
| `TooManyRequests` | 429 |
| `InternalServerError` | 500 |

---

## Autentikasi

JO-MOCK menggunakan **dual-token system**:

| Token | Tipe | Durasi | Penyimpanan |
|---|---|---|---|
| Access Token | JWT | 15 menit | Memory / Authorization header |
| Refresh Token | Opaque (SHA-256 hashed) | 30 hari | HttpOnly cookie (`jm_refresh`) |

### Cara Menggunakan Access Token

Sertakan access token di setiap request ke endpoint yang memerlukan autentikasi:

```
Authorization: Bearer <access_token>
```

### Token Rotation

Setiap kali `/api/auth/refresh` dipanggil, refresh token lama **langsung diinvalidasi** dan refresh token baru digenerate. Ini mencegah penyalahgunaan jika refresh token bocor.

### Dua Jenis Akses

1. **Dashboard access** — via JWT (`Authorization: Bearer`)
2. **Mock server access** — via API Key (`x-api-key` header)

---

## API Reference

> **Base URL:** `http://localhost:5000`
> 
> **[AUTH]** = memerlukan `Authorization: Bearer <token>`
> 
> **[PM]** / **[FE]** / **[BE]** = memerlukan role tersebut dalam project
>
> **[SUPERADMIN]** = memerlukan role superadmin platform

---

### 🔐 Auth

#### POST `/api/auth/register`
Daftar akun baru. Auto-login setelah berhasil.

> **Rate limit:** 10 request per 15 menit per IP

**Request Body:**
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123"
}
```

**Validasi:**
- `name`: string, 2–50 karakter
- `email`: string, 5–100 karakter
- `password`: string, 8–72 karakter

**Response `201`:**
```json
{
  "errorStatus": false,
  "data": {
    "data": {
      "accessToken": "eyJhbGciOiJI...",
      "user": {
        "_id": "...",
        "name": "Budi Santoso",
        "email": "budi@example.com",
        "role": "user",
        "avatar": "avatar_1",
        "quota": { "limit": 10000, "used": 0 }
      }
    },
    "message": "Registrasi berhasil"
  }
}
```

---

#### POST `/api/auth/login`
Login untuk semua role (user & superadmin).

> **Rate limit:** 10 request per 15 menit per IP

**Request Body:**
```json
{
  "email": "budi@example.com",
  "password": "password123"
}
```

**Response `200`:** Sama dengan register.

> Pesan error untuk email tidak ditemukan dan password salah **sengaja dibuat sama** untuk mencegah user enumeration.

---

#### POST `/api/auth/refresh`
Tukar refresh token (dari cookie) dengan access token baru.

> Tidak memerlukan body. Refresh token dibaca dari cookie `jm_refresh`.

**Response `200`:**
```json
{
  "errorStatus": false,
  "data": {
    "data": {
      "accessToken": "eyJhbGciOiJI...",
      "user": { ... }
    },
    "message": "Token berhasil diperbarui"
  }
}
```

---

#### POST `/api/auth/logout`
Invalidasi refresh token di DB dan hapus cookie.

**Response `200`:** `data: null`

---

#### POST `/api/auth/forgot-password`
Kirim link reset password ke email.

> **Rate limit:** 10 request per 15 menit per IP
>
> Selalu response sukses meski email tidak terdaftar (anti-enumeration).

**Request Body:**
```json
{ "email": "budi@example.com" }
```

---

#### POST `/api/auth/reset-password/:token`
Reset password dengan token dari link email (valid 1 jam).

**Request Body:**
```json
{ "newPassword": "passwordbaru123" }
```

---

#### POST `/api/auth/admin/register`
Inisialisasi akun superadmin pertama. **Sekali pakai** — akan error jika superadmin sudah ada.

> Kredensial diambil dari `EMAIL_ADMIN` dan `EMAIL_ADMIN_PASS` di env.

---

### 👤 User

> Semua route `/api/users` memerlukan **[AUTH]**

#### GET `/api/users/me`
Ambil profil user yang sedang login (termasuk API key dan quota).

**Response `200`:**
```json
{
  "data": {
    "data": {
      "_id": "...",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "user",
      "avatar": "avatar_1",
      "apiKey": "550e8400-e29b-41d4-a716-...",
      "quota": { "limit": 10000, "used": 42 },
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    "message": "Profil berhasil diambil"
  }
}
```

---

#### PUT `/api/users/me`
Update profil: nama, avatar, dan/atau email.

> Jika email diubah, `currentPassword` wajib disertakan dan notifikasi dikirim ke email lama + baru.

**Request Body (semua opsional, minimal 1 field):**
```json
{
  "name": "Budi Santoso Baru",
  "avatar": "avatar_3",
  "email": "budibaru@example.com",
  "currentPassword": "password123"
}
```

---

#### PATCH `/api/users/me/password`
Ganti password. Setelah berhasil, semua sesi aktif di perangkat lain diinvalidasi.

**Request Body:**
```json
{
  "currentPassword": "passwordlama",
  "newPassword": "passwordbaru123"
}
```

---

#### POST `/api/users/me/api-key/regenerate`
Generate ulang API key. API key lama langsung tidak berlaku.

**Request Body:**
```json
{ "currentPassword": "password123" }
```

**Response `200`:**
```json
{
  "data": {
    "data": { "apiKey": "baru-uuid-v4-..." },
    "message": "API key baru berhasil digenerate..."
  }
}
```

---

#### GET `/api/users/me/invitations`
Lihat semua undangan project yang menunggu konfirmasi user.

**Response `200`:**
```json
{
  "data": {
    "data": [
      {
        "_id": "...",
        "projectId": { "_id": "...", "name": "Project Alpha", "slug": "project-alpha" },
        "invitedBy": { "_id": "...", "name": "Ahmad PM", "email": "ahmad@example.com" },
        "role": "FE",
        "expiry": "2026-06-20T10:00:00.000Z",
        "createdAt": "2026-06-13T10:00:00.000Z"
      }
    ],
    "message": "Anda memiliki 1 undangan yang menunggu konfirmasi"
  }
}
```

---

#### GET `/api/users/search?q=keyword`
Cari user berdasarkan nama atau email. Hanya mengembalikan data publik.

> Minimum 2 karakter. Maksimal 20 hasil.

**Response `200`:**
```json
{
  "data": {
    "data": [
      { "_id": "...", "name": "Budi Santoso", "email": "budi@example.com", "avatar": "avatar_1" }
    ],
    "message": "Ditemukan 1 user yang sesuai"
  }
}
```

---

### 📁 Project

> Semua route `/api/projects` memerlukan **[AUTH]**

#### POST `/api/projects`
Buat project baru. User yang membuat otomatis menjadi owner (PM).

**Request Body:**
```json
{ "name": "Project Alpha" }
```

**Response `201`:** Dokumen project baru (dengan slug yang auto-generate).

---

#### GET `/api/projects`
List semua project milik user (sebagai owner atau member). Mendukung pagination.

**Query Params:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)

**Response `200`:**
```json
{
  "data": {
    "data": [
      {
        "_id": "...",
        "name": "Project Alpha",
        "slug": "project-alpha",
        "contractVersion": 3,
        "ownerId": "...",
        "myRole": "PM",
        "createdAt": "..."
      }
    ],
    "message": "Daftar project berhasil diambil",
    "totalData": 5,
    "totalPage": 1
  }
}
```

---

#### GET `/api/projects/search?q=keyword`
Cari project milik user berdasarkan nama. Minimum 2 karakter, maksimal 20 hasil.

---

#### GET `/api/projects/:projectId`
Detail project termasuk list member yang ter-populate.

> **[PM/FE/BE]** — hanya anggota project yang bisa akses.

---

#### PUT `/api/projects/:projectId`
Update nama project. **[PM]** only.

**Request Body:**
```json
{ "name": "Project Alpha v2" }
```

---

#### DELETE `/api/projects/:projectId`
Hapus project beserta seluruh isinya (cascade delete). **[PM]** only.

> **Cascade:** Folder → Endpoint → Response → Toggle → ChangeRequest → ContractVersion → Invitation

---

### 👥 Member & Invitation

> Semua route memerlukan **[AUTH]**

#### GET `/api/projects/:projectId/members`
List semua anggota project. **[PM/FE/BE]**

**Response `200`:**
```json
{
  "data": {
    "data": [
      {
        "user": { "_id": "...", "name": "Ahmad PM", "email": "ahmad@example.com", "avatar": "avatar_1" },
        "role": "PM",
        "isOwner": true,
        "joinedAt": "2026-01-01T00:00:00.000Z"
      },
      {
        "user": { "_id": "...", "name": "Budi FE", "email": "budi@example.com", "avatar": "avatar_2" },
        "role": "FE",
        "isOwner": false,
        "joinedAt": "2026-01-05T00:00:00.000Z"
      }
    ],
    "message": "Daftar anggota berhasil diambil"
  }
}
```

---

#### POST `/api/projects/:projectId/members/invite`
Kirim undangan ke user via email. **[PM]** only.

> Member tidak langsung ditambahkan — user harus menerima undangan terlebih dahulu.
>
> **Slot:** `members aktif + undangan pending ≤ 9`. Slot tersedia kembali saat undangan dibatalkan.

**Request Body:**
```json
{
  "userId": "60d5ec49e8a4e836c8c2e001",
  "role": "FE"
}
```

**Response `201`:**
```json
{
  "data": {
    "data": {
      "message": "Undangan berhasil dikirim ke budi@example.com",
      "remainingSlots": 6
    },
    "message": "Undangan berhasil dikirim ke budi@example.com"
  }
}
```

---

#### GET `/api/projects/:projectId/members/invitations`
List semua undangan pending + sisa slot tersedia. **[PM]** only.

**Response `200`:**
```json
{
  "data": {
    "data": {
      "invitations": [
        {
          "_id": "...",
          "invitedUserId": { "_id": "...", "name": "Budi", "email": "budi@example.com" },
          "invitedBy": { "_id": "...", "name": "Ahmad" },
          "role": "FE",
          "expiry": "2026-06-20T10:00:00.000Z"
        }
      ],
      "availableSlots": 6
    },
    "message": "Daftar undangan berhasil diambil"
  }
}
```

---

#### POST `/api/projects/:projectId/members/invitations/:invitationId/resend`
Kirim ulang email undangan. Token lama diinvalidasi, token baru digenerate, expiry di-reset ke 7 hari dari sekarang. **[PM]** only.

---

#### DELETE `/api/projects/:projectId/members/invitations/:invitationId`
Batalkan undangan. Slot yang direservasi undangan ini tersedia kembali. **[PM]** only.

---

#### PUT `/api/projects/:projectId/members/:userId`
Ubah role anggota. **[PM]** only.

> Tidak bisa mengubah role owner.

**Request Body:**
```json
{ "role": "BE" }
```

---

#### DELETE `/api/projects/:projectId/members/:userId`
Keluarkan anggota dari project. **[PM]** only.

> Tidak bisa mengeluarkan owner.

---

#### PATCH `/api/projects/:projectId/transfer-ownership`
Transfer kepemilikan project ke member yang ada. **Owner only** (dicek di service layer).

> Setelah transfer: old owner menjadi member dengan role PM, new owner menggantikan `ownerId`.

**Request Body:**
```json
{ "userId": "60d5ec49e8a4e836c8c2e002" }
```

---

#### GET `/api/invitations/:token`
Ambil detail undangan dari raw token. **Public** (tidak perlu login).

> Dipakai FE untuk menampilkan halaman konfirmasi sebelum user memutuskan.

**Response `200`:** Detail undangan beserta info project dan siapa yang mengundang.

---

#### POST `/api/invitations/:token/accept`
Terima undangan. **[AUTH]** — harus user yang diundang.

> Setelah berhasil, PM menerima notifikasi email.

---

#### POST `/api/invitations/:token/decline`
Tolak undangan. **[AUTH]** — harus user yang diundang.

---

### 📂 Folder

> Semua route memerlukan **[AUTH]** + membership project

#### GET `/api/projects/:projectId/folders`
List semua folder sebagai flat array. **[PM/FE/BE]**

> FE bertanggung jawab menyusun menjadi tree menggunakan `parentId`.

---

#### GET `/api/projects/:projectId/folders/search?q=keyword`
Cari folder berdasarkan nama. **[PM/FE/BE]** — Minimum 2 karakter, maksimal 30 hasil.

---

#### POST `/api/projects/:projectId/folders`
Buat folder baru. **[PM]** only.

**Request Body:**
```json
{
  "name": "Auth",
  "parentId": null
}
```

> `parentId: null` = folder root. Isi ObjectId untuk subfolder.

---

#### PUT `/api/projects/:projectId/folders/:folderId`
Ganti nama folder. **[PM]** only.

**Request Body:**
```json
{ "name": "Authentication" }
```

---

#### DELETE `/api/projects/:projectId/folders/:folderId`
Hapus folder + cascade delete seluruh isinya. **[PM]** only.

> **Cascade:** Subfolder rekursif (BFS) → Endpoint di dalamnya → Response → Toggle

---

### 🔌 Endpoint

> Semua route memerlukan **[AUTH]** + membership project

#### GET `/api/projects/:projectId/endpoints`
List semua endpoint. Filter opsional: `?folderId=<id>` atau `?folderId=null` (root). **[PM/FE/BE]**

---

#### GET `/api/projects/:projectId/endpoints/search?q=keyword`
Cari endpoint berdasarkan path atau method. **[PM/FE/BE]** — Minimum 2 karakter.

---

#### GET `/api/projects/:projectId/endpoints/:endpointId`
Detail satu endpoint termasuk `requestSchema` lengkap. **[PM/FE/BE]**

**Response `200`:**
```json
{
  "data": {
    "data": {
      "_id": "...",
      "projectId": "...",
      "folderId": null,
      "method": "POST",
      "path": "/api/users",
      "defaultResponseId": "...",
      "requestSchema": [
        { "name": "name", "type": "string", "required": true },
        { "name": "email", "type": "string", "required": true },
        {
          "name": "address",
          "type": "object",
          "required": false,
          "properties": [
            { "name": "city", "type": "string", "required": true }
          ]
        }
      ]
    },
    "message": "Detail endpoint berhasil diambil"
  }
}
```

---

#### POST `/api/projects/:projectId/endpoints`
Buat endpoint baru. **[PM]** only.

**Request Body:**
```json
{
  "method": "POST",
  "path": "/api/users",
  "folderId": null,
  "requestSchema": [
    { "name": "name", "type": "string", "required": true },
    { "name": "email", "type": "string", "required": true }
  ]
}
```

> `method`: `GET` | `POST` | `PUT` | `DELETE` | `PATCH`
>
> `requestSchema`: max 3 level nesting. Hanya dievaluasi saat mock dipanggil dengan method POST/PUT/PATCH.
>
> Kombinasi `method + path` harus unik per project.

---

#### PUT `/api/projects/:projectId/endpoints/:endpointId`
Update endpoint. **[PM]** only.

> Jika `method`, `path`, atau `requestSchema` berubah → otomatis membuat `ContractVersion` baru + email notifikasi ke semua anggota.

---

#### DELETE `/api/projects/:projectId/endpoints/:endpointId`
Hapus endpoint + cascade. **[PM]** only.

> **Cascade:** Response → Toggle

---

### 📬 Response

> Semua route memerlukan **[AUTH]** + membership project

#### GET `/api/projects/:projectId/endpoints/:endpointId/responses`
List semua response untuk satu endpoint. **[PM/FE/BE]**

---

#### POST `/api/projects/:projectId/endpoints/:endpointId/responses`
Buat response baru. **[PM]** only.

**Request Body:**
```json
{
  "statusCode": 200,
  "body": "{\"message\":\"sukses\",\"data\":{}}"
}
```

> `body` **harus** berupa string JSON yang valid.
>
> Auto-default: jika endpoint belum punya default dan statusCode 2xx, response ini otomatis menjadi default.

---

#### PUT `/api/projects/:projectId/endpoints/:endpointId/responses/:responseId`
Update statusCode dan/atau body. **[PM]** only.

> Response default tidak bisa diubah ke statusCode non-2xx. Ganti default dulu.

---

#### PATCH `/api/projects/:projectId/endpoints/:endpointId/responses/:responseId/set-default`
Jadikan response ini sebagai default endpoint. **[PM]** only.

> Hanya response dengan statusCode 2xx yang bisa dijadikan default.

---

#### DELETE `/api/projects/:projectId/endpoints/:endpointId/responses/:responseId`
Hapus response. **[PM]** only.

> Response yang sedang menjadi default **tidak bisa dihapus** — set response lain sebagai default dulu.
>
> **Cascade:** Toggle yang menunjuk ke response ini dihapus.

---

### 🔄 Toggle

Toggle adalah "saklar" per-user untuk memilih response aktif pada sebuah endpoint. Setiap developer memiliki toggle-nya sendiri yang independen.

> Semua route memerlukan **[AUTH]** + **[PM/FE/BE]**

#### GET `/api/projects/:projectId/toggles`
List semua toggle milik user yang login di project ini (hanya yang sudah dikustomisasi).

---

#### GET `/api/projects/:projectId/endpoints/:endpointId/toggle`
Ambil toggle user untuk satu endpoint.

**Response `200`:**
```json
{
  "data": {
    "data": {
      "endpointId": "...",
      "activeResponseId": "...",
      "isCustomized": true,
      "updatedAt": "2026-06-13T..."
    },
    "message": "Toggle berhasil diambil"
  }
}
```

> `isCustomized: false` = belum dikustomisasi, menggunakan `defaultResponseId` endpoint.

---

#### PUT `/api/projects/:projectId/endpoints/:endpointId/toggle`
Pilih response aktif untuk endpoint ini.

**Request Body:**
```json
{ "responseId": "60d5ec49e8a4e836c8c2e003" }
```

---

#### DELETE `/api/projects/:projectId/endpoints/:endpointId/toggle`
Reset toggle kembali ke default endpoint (hapus dokumen toggle).

---

### 📋 Change Request

Change Request (CR) adalah mekanisme bagi FE/BE untuk mengusulkan perubahan kontrak API yang harus disetujui PM terlebih dahulu.

> Semua route memerlukan **[AUTH]** + membership project

#### POST `/api/projects/:projectId/change-requests`
Ajukan CR baru. **[FE/BE]** only.

> PM menerima notifikasi email setelah CR diajukan.

**Request Body:**
```json
{
  "description": "Tambahkan field phoneNumber pada endpoint POST /api/users (minimal 10 karakter)",
  "proposedChanges": {
    "endpoint": "POST /api/users",
    "addFields": ["phoneNumber: string, required, min 10 chars"]
  }
}
```

> `description`: 10–500 karakter.
> `proposedChanges`: bebas format (Mixed) — untuk referensi PM saat melakukan perubahan manual.

---

#### GET `/api/projects/:projectId/change-requests`
List semua CR. Filter opsional: `?status=pending|approved|rejected&submittedBy=<userId>`. **[PM/FE/BE]**

---

#### GET `/api/projects/:projectId/change-requests/:crId`
Detail satu CR. **[PM/FE/BE]**

---

#### PATCH `/api/projects/:projectId/change-requests/:crId/approve`
Setujui CR. **[PM]** only.

> Efek: `status → approved` + `ContractVersion` baru + `project.contractVersion++` + email ke **semua anggota**.
>
> PM tetap harus menerapkan perubahan secara manual melalui menu endpoint/response.

---

#### PATCH `/api/projects/:projectId/change-requests/:crId/reject`
Tolak CR. **[PM]** only.

> Email notifikasi dikirim ke submitter saja.

**Request Body (opsional):**
```json
{ "reason": "Path ini sudah tersedia di endpoint yang ada." }
```

---

#### DELETE `/api/projects/:projectId/change-requests/:crId`
Batalkan CR. **[FE/BE]** only — hanya bisa dibatalkan oleh submitter dan hanya jika status masih `pending`.

---

### 📜 Contract Version

Riwayat semua perubahan kontrak API dalam project, otomatis dicatat setiap kali kontrak berubah.

> Semua route memerlukan **[AUTH]** + **[PM/FE/BE]**

#### GET `/api/projects/:projectId/contract-versions`
List riwayat perubahan kontrak, dari terbaru ke terlama. Mendukung pagination dan filter.

**Query Params:**
- `changeType`: `cr_approved` | `pm_direct_edit`
- `page`, `limit`

**Response `200`:**
```json
{
  "data": {
    "data": [
      {
        "_id": "...",
        "projectId": "...",
        "version": 3,
        "changedBy": { "_id": "...", "name": "Ahmad PM", "email": "..." },
        "changeType": "pm_direct_edit",
        "changeRequestId": null,
        "diff": {
          "type": "endpoint_modified",
          "summary": "Endpoint diubah: POST /api/users",
          "changes": [{ "field": "requestSchema", "changed": true }]
        },
        "createdAt": "2026-06-13T..."
      }
    ],
    "message": "Riwayat perubahan kontrak berhasil diambil",
    "totalData": 3,
    "totalPage": 1
  }
}
```

---

#### GET `/api/projects/:projectId/contract-versions/:version`
Detail satu versi kontrak berdasarkan nomor versi (bukan ID).

**Contoh:** `GET /api/projects/abc123/contract-versions/3`

---

### 🚀 Mock Server

Mock server diakses dengan URL berbeda (`/mock/`) dan **tidak menggunakan JWT**. Autentikasi dilakukan via **API Key**.

#### Cara Akses

```
[METHOD] /mock/{project-slug}/{path}
Header: x-api-key: <api_key_user>
```

**Contoh:**
```
GET  /mock/project-alpha/api/users
POST /mock/project-alpha/api/users
GET  /mock/project-alpha/api/users/123
```

#### Resolusi Response

Urutan resolusi response yang dikembalikan:

1. Cek **Toggle** user → gunakan `activeResponseId` jika ada
2. Fallback ke **`defaultResponseId`** endpoint
3. Error `503` jika endpoint belum punya response

#### Validasi Request Body (POST/PUT/PATCH)

Jika endpoint memiliki `requestSchema`, body request akan divalidasi. Response error `422`:

```json
{
  "errorStatus": true,
  "errorType": "UnprocessableEntity",
  "errors": [
    { "message": "name: must NOT have fewer than 1 characters", "code": 422 },
    { "message": "email: must be string", "code": 422 }
  ]
}
```

#### Response Mock (Bukan Wrapper)

Mock server **tidak** menggunakan wrapper global. Response yang dikembalikan adalah **langsung** JSON dari field `body` response yang dipilih:

```json
{ "message": "sukses", "data": { "id": 1, "name": "Budi" } }
```

---

### 🛡️ Admin

> Semua route memerlukan **[AUTH]** + **[SUPERADMIN]**

#### GET `/api/admin/stats`
Statistik platform.

**Response `200`:**
```json
{
  "data": {
    "data": {
      "totalUsers": 142,
      "totalProjects": 38,
      "totalEndpoints": 521,
      "totalApiCalls": 48920,
      "topUsersByUsage": [
        { "_id": "...", "name": "Budi", "quota": { "used": 4820, "limit": 10000 } }
      ]
    },
    "message": "Statistik platform berhasil diambil"
  }
}
```

---

#### GET `/api/admin/users`
List semua user platform. Mendukung search dan pagination.

**Query Params:** `?q=keyword&page=1&limit=20`

---

#### GET `/api/admin/users/:userId`
Detail user termasuk API key dan quota.

---

#### PATCH `/api/admin/users/:userId/role`
Ubah role platform user (`user` ↔ `superadmin`).

> Superadmin tidak bisa mengubah role dirinya sendiri.

**Request Body:**
```json
{ "role": "superadmin" }
```

---

#### PATCH `/api/admin/users/:userId/quota`
Update batas quota mock hit.

**Request Body:**
```json
{ "limit": 50000 }
```

---

#### POST `/api/admin/users/:userId/quota/reset`
Reset `quota.used` kembali ke 0.

---

#### DELETE `/api/admin/users/:userId`
Hapus user. Semua project yang dimilikinya **ditransfer ke superadmin** yang sedang login.

---

#### GET `/api/admin/projects`
List semua project di seluruh platform. Mendukung search dan pagination.

**Query Params:** `?q=keyword&page=1&limit=20`

---

#### DELETE `/api/admin/projects/:projectId`
Force delete project beserta seluruh isinya. Tidak ada cek kepemilikan.

---

## Sistem Email

Email dikirim secara **sequential** (for...of loop dengan per-email try-catch) untuk menghindari SMTP overload. Kegagalan pengiriman ke satu penerima tidak menghentikan pengiriman ke penerima berikutnya.

| Trigger | Template | Penerima |
|---|---|---|
| Register / forgot password | `forgotPassword.template.js` | User yang request |
| Reset password sukses | `resetPassword.template.js` | User |
| Email diubah | `emailChange.template.js` (2 email) | Email lama + email baru |
| Password diubah | `passwordChange.template.js` | User |
| Undangan project | `projectInvitation.template.js` | User yang diundang |
| Undangan diterima | `memberJoined.template.js` | PM project |
| CR diajukan | `crSubmitted.template.js` | PM project |
| CR disetujui | `crApproved.template.js` | Semua anggota project |
| CR ditolak | `crRejected.template.js` | Submitter CR |
| Contract berubah | `contractChange.template.js` | Semua anggota project |

---

## Sistem Kuota Mock

Setiap user memiliki kuota hit mock:
- **Default limit:** 10.000 hit
- **Cara hitung:** Setiap request ke `/mock/*` yang berhasil melewati validasi API key menginkremen `quota.used` sebesar 1
- **Jika penuh:** Response `429 TooManyRequests`
- **Reset:** Admin dapat mereset `quota.used` ke 0 via `POST /api/admin/users/:userId/quota/reset`
- **Ubah limit:** Admin via `PATCH /api/admin/users/:userId/quota`
