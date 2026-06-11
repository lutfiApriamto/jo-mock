# JO-MOCK — MVP Specification
**Contract-First API Mocking & Collaboration Platform**
Versi 1.0 · Dokumen Keputusan Final MVP

---

## Daftar Isi
1. [Ringkasan Produk](#1-ringkasan-produk)
2. [Konsep & Terminologi](#2-konsep--terminologi)
3. [Lingkup MVP](#3-lingkup-mvp)
4. [Alur Pengguna (User Flow)](#4-alur-pengguna-user-flow)
5. [Kebutuhan Fungsional](#5-kebutuhan-fungsional)
6. [Kebutuhan Non-Fungsional](#6-kebutuhan-non-fungsional)
7. [Tech Stack](#7-tech-stack)
8. [Keputusan Arsitektur](#8-keputusan-arsitektur)
9. [Di Luar MVP](#9-di-luar-mvp)
10. [Kriteria Keberhasilan MVP](#10-kriteria-keberhasilan-mvp)

---

## 1. Ringkasan Produk

### Masalah yang Diselesaikan
- Frontend tidak bisa mulai bekerja sebelum backend siap, walaupun kontrak sudah disepakati.
- Data dummy yang dibuat manual sering tidak konsisten dengan kontrak → butuh refactor saat integrasi.
- Perubahan kontrak dari backend kerap terjadi tanpa frontend mengetahuinya hingga tahap integrasi.
- Tooling yang ada (MSW, Postman, Pact) terfragmentasi dan butuh setup serta disiplin tim yang tinggi.

### Solusi Inti
Platform menjadikan **kontrak API sebagai sumber kebenaran bersama**. Dari kontrak yang disepakati, frontend memperoleh sebuah **URL mock yang berjalan di sisi server** — bukan di mesin frontend seperti MSW. Frontend cukup mengganti base URL, tanpa setup apapun. Saat backend asli siap, frontend kembali mengganti base URL → tidak ada refactor struktur kode.

### Pembeda Utama
- **Server-side mock:** tidak butuh Service Worker, tidak ada setup di sisi frontend.
- **Toggle per-user:** tiap anggota bisa uji skenario response berbeda (200/401/500) tanpa mengganggu satu sama lain.
- **Kontrak terkontrol:** perubahan kontrak dikelola via Change Request (CR) + versioning + notifikasi.

---

## 2. Konsep & Terminologi

### 2.1 Struktur Hierarki

```
Root (Project)
├── Folder (opsional, bisa bersarang tanpa batas)
│   └── Endpoint (method + path)
│       ├── Request Schema (definisi field payload)
│       └── Response (banyak per endpoint)
└── Endpoint (langsung di bawah root)
```

| Istilah | Definisi |
|---|---|
| **Root / Project** | Struktur paling atas. Satu pengguna bisa punya banyak project. |
| **Folder** | Wadah pengelompokan visual. Bisa bersarang tanpa batas. **Tidak masuk path URL.** |
| **Endpoint** | Kombinasi `method + path` (mis. `POST /api/users`). Menampung Request Schema dan banyak Response. |
| **Request Schema** | Definisi field + tipe yang wajib dikirim saat request (berlaku untuk POST/PUT/PATCH). |
| **Response** | Definisi balasan untuk sebuah Endpoint (status code + body JSON). Satu endpoint bisa punya banyak response. |

### 2.2 Dua Jenis Data

| Jenis | Penjelasan | Disimpan? |
|---|---|---|
| **Definisi (Kontrak)** | Request Schema, Response body, status — yang ditulis user di dashboard. | Ya — permanen di DB |
| **State Runtime** | Payload yang dikirim FE saat hit URL mock. | Tidak — sistem stateless |

**Implikasi stateless:** POST/PUT/DELETE tidak benar-benar mengubah data. Sistem hanya mengembalikan Response yang sedang aktif untuk kombinasi `method + endpoint` tersebut.

### 2.3 Model Default Response & Toggle

- Setiap endpoint memiliki tepat **satu "default response"** — wajib berstatus **2xx** (200, 201, dll).
- Default response **tidak bisa dihapus** selama masih berstatus default.
- Default response **bisa dipindah**: reassign default ke response lain dulu, baru response lama boleh dihapus.
- Saat endpoint baru dibuat, sistem otomatis membuat default response: **`200 {"message": "sukses"}`**.
- Response hanya bisa dihapus sepenuhnya jika **seluruh endpoint dihapus** oleh PM.

**Toggle aktif = model radio select, bukan saklar independen:**
- Tepat **satu** response aktif per endpoint per user per method.
- "Nonaktifkan 200, aktifkan 401" = **pindahkan pilihan ke 401**. Tidak pernah ada kondisi nol-aktif.
- Default toggle setiap user menunjuk ke **default response** endpoint tersebut.
- Status toggle **per-user** — mengubah toggle tidak mempengaruhi anggota lain.

### 2.4 Request Schema

Berlaku untuk endpoint **POST/PUT/PATCH**. Didefinisikan oleh user di dashboard, menjadi bagian dari kontrak.

**Tipe data yang didukung MVP:**
- Primitif: `string`, `number`, `boolean`
- Komposit: `object` (punya child fields), `array` (punya definisi `items`)
- Nesting maksimal **3 level** untuk MVP.
- Setiap field memiliki flag **`required`** (wajib atau opsional) — ditentukan oleh user.

**Representasi internal menggunakan subset JSON Schema** (library validasi: Ajv).

Contoh:
```
user : object (required)
 ├─ name       : string  (required)
 ├─ age        : number  (optional)
 ├─ isMarried  : boolean (required)
 └─ address    : object  (required)
       ├─ city : string  (required)
       └─ zip  : number  (optional)
```

**GET dan DELETE:** tidak ada validasi body. Sistem cukup cek API key → kembalikan response aktif.

**Query param:** tidak divalidasi di MVP.

### 2.5 Peran Pengguna

| Peran | Kewenangan Utama |
|---|---|
| **Stakeholder / PM** | Buat & kelola project, undang anggota, **edit kontrak langsung** (tanpa gerbang approve), approve/reject CR dari FE/BE. Setiap perubahan tetap naik versi + notifikasi + masuk riwayat. |
| **Frontend Developer** | Consume URL mock, atur toggle response (per-user), ajukan CR. |
| **Backend Developer** | Ajukan CR untuk mengusulkan perubahan isi kontrak. |

### 2.6 Tiga Mekanisme Identitas di Header

Tiga hal ini **berbeda** dan tidak boleh tertukar:

| Item | Lokasi | Peran |
|---|---|---|
| **JWT** | `Authorization: Bearer <token>` | Auth dashboard (login user ke platform). |
| **API Key** | Header custom (mis. `x-api-key`) | Identitas pemanggil URL mock — server tahu toggle/response aktif milik siapa. |
| **Dummy Token** | Header sesuai kontrak (mis. `Authorization: Bearer abc123`) | Simulasi skenario auth untuk pengujian (mis. nguji 401). Ini bagian data tes, bukan mekanisme platform. |

**Mengapa tidak memakai cookie untuk API key:** cookie terikat domain. FE berjalan di domain berbeda (mis. `localhost`) → cookie dashboard tidak terkirim otomatis (kebijakan SameSite). API key di header lebih andal dan konsisten lintas-domain.

---

## 3. Lingkup MVP

### 3.1 Termasuk dalam MVP (In Scope)

| No | Fitur | Keterangan |
|---|---|---|
| 1 | Autentikasi | Registrasi & login. JWT di `Authorization` header (bukan cookie). |
| 2 | API Key Pengguna | Key pribadi per-user, bisa dilihat & disalin dari dashboard. Disimpan di DB sebagai field, bukan hardcode. |
| 3 | Manajemen Project | Buat/lihat/hapus project. Solo atau kolaborasi. |
| 4 | Undang Anggota | Undang via email, tetapkan peran (PM/FE/BE). |
| 5 | Folder Bersarang | Pengelompokan visual, kedalaman bebas, tidak masuk path URL. |
| 6 | Definisi Endpoint | Method (GET/POST/PUT/DELETE/PATCH) + path. Support path dinamis (`:param`). |
| 7 | Request Schema | Definisi field + tipe + required/optional untuk POST/PUT/PATCH. Subset JSON Schema, maks 3 level nesting. |
| 8 | Definisi Response | Status code + body JSON (ditulis manual). Minimal 1 response (default 200). Body divalidasi sebagai JSON valid saat disimpan. |
| 9 | URL Mock Siap Konsumsi | URL berbasis server, format: `https://[server]/mock/{project-id}/path`. CORS dikelola server platform. |
| 10 | Toggle Response (per-user) | Model radio select, tepat 1 aktif per endpoint per user. Default = default response endpoint. |
| 11 | Validasi Request | Cek field + tipe dasar terhadap Request Schema untuk POST/PUT/PATCH. Error sistem jika tidak sesuai (terpisah dari error response kontrak). |
| 12 | Dynamic Path | Support `:param` (mis. `/api/users/:id`). Path statis menang atas path dinamis jika ada konflik. |
| 13 | Change Request (CR) | FE/BE ajukan → PM approve/reject → jika approve: versi naik + notif + riwayat. |
| 14 | Edit Langsung oleh PM | PM bisa ubah kontrak tanpa gerbang approve, tapi tetap naik versi + notif semua anggota + masuk riwayat. |
| 15 | Notifikasi | Via email (nodemailer). Berisi ringkasan diff perubahan kontrak. |
| 16 | Riwayat Versi | Semua perubahan kontrak tersimpan. URL mock selalu ikut versi terbaru. |
| 17 | Generate Contoh Kode | 4 kombinasi: React (JS/TS) × (useState/Zustand), semua Axios. Fokus pada fungsi (`getData`/`onSubmit`), bukan styling. Bisa langsung disalin. |
| 18 | Kuota Hit | 10.000 hit lifetime per akun. Disimpan sebagai field adjustable di DB (bukan hardcode). Menghitung semua hit (valid maupun invalid). |

### 3.2 Di Luar MVP (Out of Scope)

| Fitur | Alasan |
|---|---|
| Proxy ke API publik / Open API nyata | Risiko keamanan serius (SSRF, penyalahgunaan). Dihapus permanen dari konsep. |
| Mock stateful | Terlalu kompleks. Stateless sudah cukup untuk MVP. |
| Import body dari file JSON | Berguna tapi bukan inti. Ditunda. |
| Auto-generate data dummy (Faker) | Fitur lanjutan. Ditunda. |
| Breaking-change detection canggih | TypeScript + diff versi sederhana sudah cukup untuk MVP. |
| Input non-teks (gambar, PDF, Excel) | Dibatasi teks (JSON) dulu untuk menyederhanakan MVP. |
| Generator framework selain React | Dibatasi 4 kombinasi React. |
| Validasi query param (GET) | Ditunda. GET cukup cek API key → kembalikan response aktif. |
| Nesting schema lebih dari 3 level | Batas MVP. Model data sudah rekursif penuh, batasannya cuma "pagar" di editor — mudah dilepas nanti. |
| Rate limit per-menit | Butuh shared state (Redis/Upstash) antar Vercel instances. Terlalu kompleks untuk MVP. |
| Penyimpanan file (Supabase) | Diparkir. Data utama tetap MongoDB. |
| Versi premium / top-up kuota | Dibahas setelah MVP. |

---

## 4. Alur Pengguna (User Flow)

### Fase 1: Persiapan Awal
1. User mendaftar akun (email + password).
2. User login ke aplikasi → mendapat JWT, disimpan di sisi FE.
3. User membuka halaman pengaturan akun → menyalin **API key pribadi** (untuk dipakai saat consume URL mock).

### Fase 2: Membuat Project & Mengundang Anggota
1. User (mis. sebagai PM) klik "Buat Project Baru", isi nama project.
2. Dua pilihan:
   - **Kerja sendiri** → langsung lanjut ke Fase 3.
   - **Kolaborasi** → undang anggota via email, tetapkan peran masing-masing (PM/FE/BE).

### Fase 3: Menyusun Struktur Kontrak
1. Di dalam project, PM membuat **Folder** untuk pengelompokan (mis. "Manajemen User"). Folder bisa bersarang atau langsung berisi endpoint.
2. Di dalam folder (atau langsung di root), PM/anggota membuat **Endpoint** — pilih method dan tentukan path (mis. `POST /api/users`).
3. Sistem otomatis membuat **default response: `200 {"message": "sukses"}`**.
4. Untuk endpoint yang menerima payload (POST/PUT/PATCH), user mendefinisikan **Request Schema** — daftar field, tipe, dan status required/optional-nya.
5. User menambah Response lain sesuai kebutuhan (mis. `401`, `500`) beserta body-nya.
6. Body response divalidasi sebagai JSON valid saat disimpan.
7. Ulangi langkah 2–6 untuk endpoint-endpoint lain.

### Fase 4: Frontend Mulai Konsumsi URL Mock
1. FE membuka halaman endpoint di dashboard → menyalin **URL mock**:
   ```
   https://[server]/mock/{project-id}/api/users
   ```
2. FE menyalin **contoh kode** sesuai stack pilihannya (4 opsi: React JS/TS × useState/Zustand, semua Axios).
3. FE menempel URL sebagai base URL di project React-nya, dan menyisipkan **API key pribadi** di header setiap request.
4. FE mulai ngoding tanpa menunggu backend — tampilan, loading state, error state, semua bisa dikerjakan.

### Fase 5: Testing Skenario Berbeda (Toggle Response)
1. FE ingin uji skenario error `401`. Dia buka endpoint terkait di dashboard.
2. FE **pindahkan toggle aktif** dari `200` ke `401` — hanya berlaku di akun miliknya, tidak mengganggu rekan.
3. FE hit URL yang sama → mendapat response `401`. Selesai, dia kembalikan ke `200`.
4. Untuk simulasi token dummy (mis. header `Authorization: Bearer abc123`), FE kirim dummy token sesuai skenario kontrak — ini terpisah dari API key platform.

### Fase 6: Perubahan Kontrak (Change Request)
1. BE (atau FE) sadar kontrak perlu diubah (mis. field `name` dipecah jadi `first_name` + `last_name`). Dia membuat **Change Request (CR)** dengan usulan perubahan.
2. PM menerima notifikasi → membuka CR → meninjau diff.
3. PM memilih:
   - **Approve** → kontrak naik versi baru, URL mock otomatis ikut versi terbaru, semua anggota dinotifikasi via email beserta ringkasan diff.
   - **Reject** → kontrak tetap, CR ditolak, pengaju dinotifikasi.
4. Sistem menyimpan riwayat versi — bisa ditinjau kapan saja.
5. Jika PM mengubah kontrak langsung (tanpa CR): kontrak tetap naik versi + notif + masuk riwayat, tapi tanpa gerbang approve.
6. FE menjalankan project React-nya → TypeScript menandai tempat yang terdampak breaking change → FE menyesuaikan.

### Fase 7: Backend Asli Siap
1. Backend menyelesaikan implementasi API asli.
2. FE **cukup mengganti base URL** dari URL mock ke URL backend nyata.
3. Struktur kode FE (komponen, hooks, types, fungsi) **tidak perlu diubah** — dari awal sudah memanggil endpoint dengan struktur yang sama persis dengan kontrak.
4. Integrasi selesai tanpa refactor.

---

## 5. Kebutuhan Fungsional

### 5.1 Autentikasi & Akun

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-A1 | User dapat mendaftar akun baru (email + password). | P0 |
| FR-A2 | User dapat login. Sistem mengembalikan JWT. | P0 |
| FR-A3 | JWT dikirim via `Authorization: Bearer` header (bukan cookie). | P0 |
| FR-A4 | Setiap user memiliki API key pribadi yang dapat dilihat & disalin dari dashboard. | P0 |

### 5.2 Project, Folder & Anggota

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-P1 | User dapat membuat, melihat, dan menghapus project. | P0 |
| FR-P2 | Project dapat solo atau memiliki banyak anggota. | P0 |
| FR-P3 | PM dapat mengundang anggota via email dan menetapkan peran (PM/FE/BE). | P0 |
| FR-P4 | User dapat membuat Folder bersarang tanpa batas kedalaman. | P0 |
| FR-P5 | Folder hanya untuk pengelompokan visual — tidak masuk path URL. | P0 |

### 5.3 Endpoint, Request Schema & Response

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-E1 | User dapat membuat Endpoint (method + path) di bawah Root atau Folder. | P0 |
| FR-E2 | Mendukung method GET, POST, PUT, DELETE, PATCH. | P0 |
| FR-E3 | Path endpoint mendukung segmen dinamis (`:param`). | P0 |
| FR-E4 | Path statis diprioritaskan atas path dinamis jika ada konflik routing. | P0 |
| FR-E5 | Untuk endpoint POST/PUT/PATCH, user dapat mendefinisikan Request Schema. | P0 |
| FR-E6 | Request Schema mendukung tipe: `string`, `number`, `boolean`, `object`, `array`. | P0 |
| FR-E7 | Request Schema mendukung nesting hingga 3 level. | P0 |
| FR-E8 | Setiap field di Request Schema memiliki flag `required` / `optional`. | P0 |
| FR-E9 | Satu Endpoint dapat memiliki banyak Response dengan status berbeda. | P0 |
| FR-E10 | Setiap Endpoint wajib memiliki minimal 1 Response (default response). | P0 |
| FR-E11 | Default response wajib berstatus 2xx. Tidak bisa dihapus selama masih berstatus default. | P0 |
| FR-E12 | PM dapat reassign default response ke response 2xx lain — setelah itu response lama bisa dihapus. | P0 |
| FR-E13 | Response body ditulis manual sebagai teks JSON, divalidasi sebagai JSON valid saat disimpan. | P0 |
| FR-E14 | Endpoint dan seluruh response-nya hanya bisa dihapus oleh PM. | P0 |

### 5.4 Mock Server & Konsumsi URL

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-M1 | Sistem menyediakan URL mock berbasis project-id unik (publik, seperti slug). | P0 |
| FR-M2 | Format URL: `https://[server]/mock/{project-id}/path`. | P0 |
| FR-M3 | Identitas pemanggil ditentukan via API key di header. | P0 |
| FR-M4 | Server mengembalikan Response aktif sesuai endpoint + method + toggle milik pemanggil. | P0 |
| FR-M5 | Untuk POST/PUT/PATCH: validasi payload terhadap Request Schema (field wajib + tipe). | P0 |
| FR-M6 | Jika validasi gagal → kembalikan error sistem yang jelas (terpisah dari response kontrak). | P0 |
| FR-M7 | Sistem bersifat stateless — tidak mengakumulasi data runtime. | P0 |
| FR-M8 | Server mengatur CORS sendiri agar dapat dikonsumsi dari origin pengguna (mis. localhost). | P0 |
| FR-M9 | Mendukung token dummy di header untuk simulasi skenario auth. | P0 |
| FR-M10 | Setiap hit (valid maupun invalid) dihitung terhadap kuota akun pemanggil. | P0 |
| FR-M11 | Jika kuota habis → kembalikan error sistem, request tidak diproses. | P0 |

### 5.5 Toggle Response (Per-User)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-T1 | Toggle response menggunakan model radio select: tepat 1 aktif per endpoint per method per user. | P0 |
| FR-T2 | Status toggle bersifat per-user — tidak mempengaruhi anggota lain. | P0 |
| FR-T3 | Default toggle setiap user menunjuk ke default response endpoint. | P0 |
| FR-T4 | PM dan FE memiliki kewenangan mengubah toggle miliknya sendiri. | P0 |

### 5.6 Change Request, Versioning & Notifikasi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-C1 | FE dan BE dapat mengajukan Change Request (CR) perubahan kontrak. | P0 |
| FR-C2 | PM dapat menyetujui atau menolak CR. | P0 |
| FR-C3 | CR yang disetujui → kontrak naik versi baru. | P0 |
| FR-C4 | PM dapat mengedit kontrak langsung (tanpa gerbang approve) → tetap naik versi + notif + riwayat. | P0 |
| FR-C5 | Semua anggota menerima notifikasi email berisi ringkasan diff saat kontrak berubah. | P0 |
| FR-C6 | Sistem menyimpan riwayat versi kontrak — bisa ditinjau kapan saja. | P0 |
| FR-C7 | URL mock selalu mengikuti versi kontrak terbaru. | P0 |

### 5.7 Generate Contoh Kode

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-G1 | Sistem menampilkan contoh kode konsumsi sesuai endpoint/method. | P0 |
| FR-G2 | Mendukung 4 kombinasi: React (JS/TS) × (useState/Zustand), semua Axios. | P0 |
| FR-G3 | Kode berfokus pada fungsi (`getData` / `onSubmit`), bukan styling. | P0 |
| FR-G4 | Kode dapat langsung disalin (tombol copy). | P0 |

### 5.8 Kuota

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-Q1 | Setiap akun memiliki kuota 10.000 hit lifetime. | P0 |
| FR-Q2 | Batas kuota disimpan sebagai field adjustable di DB per akun (bukan hardcode). | P0 |
| FR-Q3 | Semua hit dihitung — valid maupun invalid. | P0 |
| FR-Q4 | Sisa kuota dapat dilihat oleh user di dashboard. | P0 |

---

## 6. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| **Keamanan** | Tidak ada token/key rahasia di URL. JWT, API key, dan dummy token hanya di header. Tidak ada proxy ke API eksternal (mencegah SSRF). |
| **Privasi** | Data sensitif tidak ditempatkan di URL atau query string. |
| **Performa** | Response mock dikembalikan cepat karena bersifat statis/stateless. Function serverless dijaga ramping (import minimal di jalur mock). |
| **Kompatibilitas** | Dapat dikonsumsi dari localhost dan domain manapun (CORS dikelola server platform). |
| **Usability** | Onboarding minim setup: cukup ganti base URL di sisi frontend. |
| **Auditability** | Setiap perubahan kontrak tercatat (siapa, apa, kapan, versi berapa). |
| **Scalability** | Koneksi MongoDB di-cache antar Vercel function invocations untuk menghindari connection exhaustion di M0. |

---

## 7. Tech Stack

### Frontend
| Komponen | Pilihan |
|---|---|
| Build tool | Vite |
| Framework | React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Routing | react-router-dom v7 |
| HTTP client | Axios |
| Animasi | Framer Motion, GSAP (terutama untuk landing page) |
| Notifikasi UI | react-hot-toast |
| Icons | lucide-react, react-icons |

### Backend
| Komponen | Pilihan |
|---|---|
| Runtime | Node.js (ESM / `"type": "module"`) |
| Framework | Express 5 |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Database ODM | Mongoose |
| Validasi schema | Ajv (JSON Schema) |
| Email | Nodemailer |
| Utility | uuid, dotenv, cors, cookie-parser |

### Database
| Komponen | Pilihan |
|---|---|
| Database | MongoDB Atlas (free tier M0) |
| Koneksi | Di-cache di scope global function untuk serverless |

### Hosting
| Komponen | Pilihan |
|---|---|
| Frontend | Vercel (static/SSR) |
| Backend | Vercel (serverless functions) |

### Penyimpanan File (Diparkir)
- Supabase Storage — disiapkan untuk kebutuhan file di masa depan. Belum dipakai di MVP.

---

## 8. Keputusan Arsitektur

### 8.1 Auth Dashboard: JWT di Header, Bukan Cookie
FE dan BE berada di dua domain Vercel yang berbeda. Cookie lintas-domain tidak reliabel akibat kebijakan `SameSite`. Keputusan: JWT dikirim via `Authorization: Bearer` header dari FE ke setiap request API dashboard.

### 8.2 Serverless-Aware Design
Backend berjalan sebagai Vercel serverless functions. Konsekuensi yang sudah diantisipasi:
- **Cold start:** dijaga dengan meminimalkan import di jalur mock (`/mock/...`).
- **Koneksi Mongo:** di-cache di scope global, tidak dibuat ulang per-invocation.
- **Notifikasi real-time:** tidak feasibel di serverless standar. Diganti email (nodemailer).
- **Rate limit per-menit:** membutuhkan Redis/Upstash — **ditunda**, bukan bagian MVP.

### 8.3 Kuota: Field di DB, Bukan Hardcode
Batas 10.000 disimpan sebagai field `quota` di dokumen akun. Ini memungkinkan penyesuaian manual via DB tanpa perlu deploy ulang — krusial untuk masa development dan penanganan edge case akun.

### 8.4 Routing Mock: Static Wins Over Dynamic
Jika ada konflik antara path statis (`/api/users/me`) dan path dinamis (`/api/users/:id`), path statis selalu diprioritaskan. Nilai `:param` tidak divalidasi atau diproses lebih lanjut di MVP — hanya dipakai untuk mencocokkan route.

### 8.5 Validasi Request Schema: Subset JSON Schema + Ajv
Request Schema direpresentasikan sebagai subset JSON Schema secara internal. Validasi menggunakan Ajv. Kedalaman nesting dibatasi 3 level di MVP via "pagar" di editor dan validator — model data sudah rekursif penuh, sehingga batas ini mudah dilepas tanpa migrasi data.

### 8.6 Versioning: Semua Perubahan Terekam
Tidak ada perbedaan teknis antara "PM edit langsung" dan "CR yang di-approve" dalam hal pencatatan — keduanya naik versi, notif semua anggota, dan masuk riwayat. Perbedaannya hanya di gerbang persetujuan: PM bisa langsung, FE/BE harus lewat CR.

---

## 9. Di Luar MVP

Referensi cepat fitur yang **sengaja tidak dibangun** di MVP:

| Fitur | Status |
|---|---|
| Proxy ke API publik nyata | Dihapus permanen (risiko SSRF) |
| Mock stateful | Ditunda |
| Import body dari JSON | Ditunda |
| Auto-generate data dummy (Faker) | Ditunda |
| Breaking-change detection canggih | Ditunda |
| Input non-teks (gambar, PDF, Excel) | Ditunda |
| Generator framework selain React | Ditunda |
| Validasi query param GET | Ditunda |
| Nesting schema > 3 level | Ditunda (mudah dilepas, tanpa migrasi data) |
| Rate limit per-menit | Ditunda (butuh Redis/Upstash) |
| Fitur premium / top-up kuota | Dibahas setelah MVP |
| Penyimpanan file (Supabase) | Diparkir |

---

## 10. Kriteria Keberhasilan MVP

1. Seorang frontend dapat membuat project, mendefinisikan endpoint + request schema + response, lalu mengonsumsi URL mock **tanpa backend** dalam satu sesi.
2. Frontend dapat menguji skenario `200` dan `401` hanya dengan toggle, **tanpa mengganggu rekan** yang sedang menggunakan project yang sama.
3. Setiap perubahan kontrak (baik via CR maupun edit langsung PM) menghasilkan **notifikasi email, versi baru, dan riwayat** yang dapat ditinjau.
4. Saat backend asli siap, peralihan cukup dengan **mengganti base URL** — tanpa refactor struktur kode frontend.
5. Seluruh alur (dari daftar akun hingga consume URL mock) dapat diselesaikan **tanpa setup apapun di sisi frontend** selain mengganti base URL dan menambahkan API key di header.

---

*Dokumen ini adalah hasil keputusan final sesi brainstorming — mencakup semua yang dibahas, direvisi, dan dikunci bersama sebelum fase implementasi dimulai.*
