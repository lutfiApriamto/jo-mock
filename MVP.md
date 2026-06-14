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

> **Catatan Revisi:** Dokumen ini diperbarui setelah backend v1 selesai dibangun. Beberapa keputusan berubah selama development — semua perubahan ditandai atau tercermin dalam isi dokumen ini.

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
- Saat endpoint baru dibuat, **tidak ada response yang otomatis dibuat**. PM harus membuat response pertama secara manual. Jika response pertama yang dibuat berstatus 2xx, sistem otomatis menjadikannya default. Body response default untuk field `body` jika tidak diisi: **`{"message":"sukses"}`**.
- Response hanya bisa dihapus sepenuhnya jika **tidak sedang menjadi default**. Untuk menghapus response default, PM harus set response lain sebagai default terlebih dahulu.

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

Ada dua lapisan peran yang berbeda: **platform** dan **project**.

#### Peran Platform (User.role)
| Peran | Kewenangan |
|---|---|
| **user** | Pengguna biasa — bisa membuat project, bergabung ke project, menggunakan semua fitur dashboard. |
| **superadmin** | Akses penuh ke seluruh platform — manajemen semua user, semua project, dan quota. Tidak terikat ke project mana pun. |

#### Peran Project (Project.members[].role)
| Peran | Kewenangan Utama |
|---|---|
| **PM (Project Manager / Owner)** | Buat & kelola project, undang anggota, **edit kontrak langsung** (tanpa gerbang approve), approve/reject CR dari FE/BE. Setiap perubahan tetap naik versi + notifikasi + masuk riwayat. Bisa toggle response miliknya. |
| **Frontend Developer (FE)** | Consume URL mock, atur toggle response (per-user), ajukan CR untuk mengusulkan perubahan kontrak. |
| **Backend Developer (BE)** | Ajukan CR untuk mengusulkan perubahan isi kontrak. Bisa toggle response miliknya untuk keperluan testing. |

> Catatan: Owner project selalu berperan sebagai PM, tapi tidak semua PM adalah owner. Transfer kepemilikan hanya bisa dilakukan oleh owner (bukan sekadar PM).

### 2.6 Mekanisme Identitas & Token

#### Dashboard (JWT + Refresh Token)
- **Access Token (JWT)** — masa aktif 15 menit, dikirim via `Authorization: Bearer <token>`. Berisi payload `{ id, role }`.
- **Refresh Token (Opaque)** — masa aktif 30 hari, disimpan di **httpOnly cookie** (`refreshToken`). Dipakai untuk mendapat access token baru via `POST /api/auth/refresh`. Token ini hashed SHA-256 di DB — nilai aslinya tidak pernah disimpan.
- Saat password diganti → refresh token di-null-kan → semua sesi lain otomatis logout.

#### Mock Server (API Key)
- **API Key** — UUID v4, dikirim di header `x-api-key`. Satu key per akun, bisa di-regenerate kapan saja (membutuhkan konfirmasi password).

#### Identitas Simulasi (Dummy Token)
- **Dummy Token** — token palsu di header sesuai skenario kontrak (mis. `Authorization: Bearer abc123`). Ini bagian data tes, bukan mekanisme platform — server mengabaikannya, hanya dikembalikan sebagai bagian mock response.

**Mengapa API key di header, bukan cookie:** FE berjalan di domain berbeda (mis. `localhost`) → cookie lintas-domain tidak reliabel (kebijakan SameSite). API key di header lebih konsisten.

**Mengapa refresh token di cookie, bukan header:** httpOnly cookie mencegah akses dari JavaScript (mitigasi XSS). FE dan BE berada di domain yang sama di Vercel, sehingga cookie berfungsi dengan baik untuk auth dashboard.

---

## 3. Lingkup MVP

### 3.1 Termasuk dalam MVP (In Scope)

| No | Fitur | Keterangan |
|---|---|---|
| 1 | Autentikasi Lengkap | Register, login, logout, forgot password, reset password, refresh token. JWT (access) di `Authorization` header; opaque refresh token di httpOnly cookie. |
| 2 | Profil & API Key | Update profil (nama, avatar, email), ganti password (invalidasi semua sesi lain), regenerate API key (butuh konfirmasi password). |
| 3 | Manajemen Project | Buat/lihat/rename/hapus project. Slug auto-generate dari nama, unik di seluruh platform. |
| 4 | Manajemen Anggota | Undang via email, tetapkan peran (PM/FE/BE). Cancel/resend undangan, lihat undangan pending, terima/tolak undangan (dari halaman user). Hapus anggota, transfer kepemilikan project ke member aktif. |
| 5 | Folder Bersarang | Pengelompokan visual, kedalaman bebas, tidak masuk path URL. Cascade delete rekursif ke seluruh isinya. |
| 6 | Definisi Endpoint | Method (GET/POST/PUT/DELETE/PATCH) + path. Support path dinamis (`:param`). |
| 7 | Request Schema | Definisi field + tipe + required/optional untuk POST/PUT/PATCH. Subset JSON Schema, maks 3 level nesting. |
| 8 | Definisi Response | Status code + body JSON (ditulis manual). Body divalidasi sebagai JSON valid saat disimpan. Default body jika kosong: `{"message":"sukses"}`. |
| 9 | URL Mock Siap Konsumsi | URL berbasis server, format: `https://[server]/mock/{project-slug}/path`. CORS dikelola server platform. |
| 10 | Toggle Response (per-user) | Model radio select, tepat 1 aktif per endpoint per user. Default = default response endpoint. Semua role (PM/FE/BE) bisa toggle. |
| 11 | Validasi Request | Cek field + tipe dasar terhadap Request Schema untuk POST/PUT/PATCH. Error sistem jika tidak sesuai (terpisah dari response kontrak). Field tambahan di luar schema diizinkan. |
| 12 | Dynamic Path | Support `:param` (mis. `/api/users/:id`). Path statis menang atas path dinamis jika ada konflik. |
| 13 | Change Request (CR) | FE/BE ajukan → PM approve/reject → jika approve: versi naik + notif semua anggota + riwayat. CR bisa dibatalkan oleh submitter selama masih pending. |
| 14 | Edit Langsung oleh PM | PM bisa ubah kontrak tanpa gerbang approve, tapi tetap naik versi + notif semua anggota + masuk riwayat. |
| 15 | Notifikasi Email | Via nodemailer (Gmail SMTP). Event: kontrak berubah, CR submitted/approved/rejected, undangan project, anggota baru bergabung, email/password akun berubah. |
| 16 | Riwayat Versi | Semua perubahan kontrak tersimpan dengan diff, siapa pengubah, dan tipe perubahan. URL mock selalu ikut versi terbaru. |
| 17 | Generate Contoh Kode | 4 kombinasi: React (JS/TS) × (useState/Zustand), semua Axios. Fokus pada fungsi (`getData`/`onSubmit`), bukan styling. Bisa langsung disalin. *(Fitur frontend)* |
| 18 | Kuota Hit | 10.000 hit lifetime per akun (adjustable di DB). Hanya request dengan API key valid yang dihitung. Superadmin bisa adjust limit dan reset usage. |
| 19 | Admin / Superadmin | Role platform khusus. Dapat: lihat/hapus semua user (project di-transfer ke superadmin), atur kuota, lihat semua project, force-delete project beserta seluruh isinya, lihat statistik platform. |
| 20 | Pencarian | Search user by email/nama (untuk undangan), search project milik sendiri, search endpoint dalam project, search folder dalam project. |

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

### Fase 1: Persiapan Awal (Register & Login)
1. User mendaftar akun (nama, email, password).
2. User login → mendapat **access token** (JWT, 15 menit) dan **refresh token** disimpan di httpOnly cookie.
3. Saat access token habis masa berlakunya, FE memanggil `POST /api/auth/refresh` secara otomatis (menggunakan cookie) → mendapat access token baru. Refresh token lama diinvalidasi (token rotation).
4. User membuka halaman pengaturan akun → menyalin **API key pribadi** (untuk dipakai saat consume URL mock).
5. Jika lupa password: klik "Lupa Password" → masukkan email → terima link reset via email (valid 1 jam) → set password baru.
6. Untuk logout: sistem menghapus refresh token dari DB dan cookie → sesi berakhir.

### Fase 2: Membuat Project & Mengundang Anggota

#### Alur PM (Pengundang)
1. PM klik "Buat Project Baru", isi nama project → sistem auto-generate slug unik dari nama.
2. Dua pilihan:
   - **Kerja sendiri** → langsung lanjut ke Fase 3.
   - **Kolaborasi** → undang anggota via email, tetapkan peran masing-masing (PM/FE/BE).
3. Saat mengundang: slot anggota langsung dipesan. Jika slot penuh (9 anggota + undangan pending), undangan baru tidak bisa dikirim.
4. PM bisa melihat daftar undangan yang masih pending, mengirim ulang email undangan (token direset, masa berlaku diperpanjang 7 hari), atau membatalkan undangan.

#### Alur Anggota (Penerima Undangan)
1. Anggota menerima email undangan berisi tombol **Terima** dan **Tolak** beserta tanggal kadaluarsa (7 hari).
2. Anggota klik **Terima** → diarahkan ke halaman konfirmasi → sistem memvalidasi token → anggota ditambahkan ke project dengan peran yang ditetapkan PM.
3. PM mendapat notifikasi email bahwa anggota baru telah bergabung.
4. Jika token sudah kadaluarsa (> 7 hari): sistem mengembalikan 410 Gone → anggota meminta PM untuk kirim ulang undangan.
5. Anggota juga bisa melihat semua undangan pending miliknya di halaman profil dan menerima/menolak dari sana.

### Fase 3: Menyusun Struktur Kontrak
1. Di dalam project, PM membuat **Folder** untuk pengelompokan (mis. "Manajemen User"). Folder bisa bersarang atau langsung berisi endpoint.
2. Di dalam folder (atau langsung di root), PM membuat **Endpoint** — pilih method dan tentukan path (mis. `POST /api/users`).
3. PM membuat **Response pertama** untuk endpoint (mis. `200` dengan body `{"message":"sukses"}`). Karena ini response 2xx pertama dan belum ada default, sistem otomatis menjadikannya **default response**.
4. Untuk endpoint yang menerima payload (POST/PUT/PATCH), PM mendefinisikan **Request Schema** — daftar field, tipe, dan status required/optional-nya (maks 3 level nesting).
5. PM menambah Response lain sesuai kebutuhan (mis. `401 {"message":"Unauthorized"}`, `500 {"message":"Server Error"}`).
6. Body response divalidasi sebagai JSON valid saat disimpan — mock server tidak akan pernah mengembalikan JSON yang rusak.
7. Ulangi langkah 2–6 untuk endpoint-endpoint lain.

### Fase 4: Frontend Mulai Konsumsi URL Mock
1. FE membuka halaman endpoint di dashboard → menyalin **URL mock**:
   ```
   https://[server]/mock/{project-slug}/api/users
   ```
2. FE menyalin **contoh kode** sesuai stack pilihannya (4 opsi: React JS/TS × useState/Zustand, semua Axios).
3. FE menempel URL sebagai base URL di project React-nya, dan menyisipkan **API key pribadi** di header setiap request (`x-api-key: <uuid>`).
4. FE mulai ngoding tanpa menunggu backend — tampilan, loading state, error state, semua bisa dikerjakan.

### Fase 5: Testing Skenario Berbeda (Toggle Response)
1. Developer (PM/FE/BE) ingin uji skenario error `401`. Dia buka endpoint terkait di dashboard.
2. Developer **pindahkan toggle aktif** dari `200` ke `401` — hanya berlaku di akun miliknya, tidak mengganggu rekan yang sedang menggunakan project yang sama.
3. Developer hit URL yang sama → mendapat response `401`. Selesai, toggle dikembalikan ke `200`.
4. Untuk simulasi token dummy di header (mis. `Authorization: Bearer abc123`), developer cukup mengirimnya seperti request normal — server mengabaikannya dan tetap mengembalikan response yang di-toggle.
5. Saat PM mengubah **default response** suatu endpoint → toggle semua member yang masih di old default otomatis berpindah ke default baru. Toggle yang sudah di-customize tidak diubah.

### Fase 6: Perubahan Kontrak (Change Request)
1. FE atau BE sadar kontrak perlu diubah (mis. field `name` dipecah jadi `first_name` + `last_name`). Dia membuat **Change Request (CR)** berisi deskripsi dan usulan perubahan.
2. PM menerima notifikasi email → membuka CR → meninjau usulan.
3. PM memilih:
   - **Approve** → `project.contractVersion` naik 1, perubahan masuk riwayat, semua anggota dinotifikasi via email. PM kemudian menerapkan perubahan secara manual di editor endpoint/response.
   - **Reject** → kontrak tidak berubah, pengaju CR dinotifikasi via email beserta alasan penolakan (opsional).
4. Submitter CR bisa **membatalkan CR** selama statusnya masih pending (sebelum di-review PM).
5. Sistem menyimpan **riwayat semua versi** kontrak — siapa yang mengubah, kapan, tipe perubahan, dan diff-nya — bisa ditinjau kapan saja.
6. Jika PM mengubah kontrak langsung (tanpa CR): sama-sama naik versi + notif semua anggota + masuk riwayat, tapi tanpa gerbang approve.
7. FE menyesuaikan kode React-nya → TypeScript menandai tempat yang terdampak breaking change.

### Fase 7: Manajemen Anggota (Opsional, Sesuai Kebutuhan)
1. PM dapat **mengubah peran** anggota kapan saja (mis. dari FE ke BE) via halaman manajemen anggota.
2. PM dapat **mengeluarkan anggota** dari project.
3. Owner (pemilik project) dapat **mentransfer kepemilikan** ke salah satu member aktif — old owner menjadi PM, new owner menjadi pemilik baru. Hanya owner yang bisa melakukan ini, meskipun ada anggota lain dengan peran PM.

### Fase 8: Backend Asli Siap
1. Backend menyelesaikan implementasi API asli.
2. FE **cukup mengganti base URL** dari URL mock ke URL backend nyata.
3. Struktur kode FE (komponen, hooks, types, fungsi) **tidak perlu diubah** — dari awal sudah memanggil endpoint dengan struktur yang sama persis dengan kontrak.
4. Integrasi selesai tanpa refactor.

### Fase 9: Alur Superadmin (Admin Platform)
1. Superadmin login menggunakan kredensial yang didaftarkan saat inisialisasi platform (`POST /api/auth/admin/register` — sekali pakai).
2. Superadmin mengakses dashboard admin untuk memantau platform:
   - **Statistik**: total user, total project, total endpoint, total API call, top 5 user berdasarkan penggunaan.
   - **Manajemen User**: lihat semua user, ubah role (user ↔ superadmin), sesuaikan batas quota, reset usage quota, hapus user (project di-transfer ke superadmin).
   - **Manajemen Project**: lihat semua project, force-delete project beserta seluruh isinya jika diperlukan.
3. Superadmin tidak bisa mengubah atau menghapus role/akun dirinya sendiri.

---

## 5. Kebutuhan Fungsional

### 5.1 Autentikasi & Akun

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-A1 | User dapat mendaftar akun baru (email + password). | P0 |
| FR-A2 | User dapat login. Sistem mengembalikan access token (JWT, 15 menit) dan menyimpan refresh token di httpOnly cookie (opaque, 30 hari). | P0 |
| FR-A3 | Access token (JWT) dikirim via `Authorization: Bearer` header. Refresh token dikirim otomatis via cookie. | P0 |
| FR-A4 | User dapat merequest access token baru dengan menukar refresh token via `POST /api/auth/refresh`. Token lama diinvalidasi (token rotation). | P0 |
| FR-A5 | User dapat logout — refresh token dihapus dari DB dan cookie dihapus. | P0 |
| FR-A6 | User dapat meminta reset password via email. Sistem mengirim link dengan token reset (valid 1 jam). | P0 |
| FR-A7 | User dapat mereset password menggunakan token dari email. | P0 |
| FR-A8 | Setiap user memiliki API key pribadi (UUID) untuk mengakses mock server. API key dapat dilihat dari dashboard dan di-regenerate kapan saja (membutuhkan konfirmasi password). | P0 |

### 5.2 Project, Folder & Anggota

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-P1 | User dapat membuat, melihat, rename, dan menghapus project. Project memiliki slug unik yang auto-generate dari nama. | P0 |
| FR-P2 | Project dapat solo atau memiliki banyak anggota (maks 9 anggota + 1 owner = 10 slot). | P0 |
| FR-P3 | PM dapat mengundang anggota via email dan menetapkan peran (PM/FE/BE). Undangan berlaku 7 hari, bisa di-resend (token direset) atau dibatalkan. Slot anggota dipesan sejak undangan dikirim. | P0 |
| FR-P4 | User yang diundang dapat melihat detail undangan, lalu menerima atau menolaknya. Satu user hanya bisa punya satu undangan pending per project. | P0 |
| FR-P5 | PM dapat mengubah peran anggota dan mengeluarkan anggota dari project. | P0 |
| FR-P6 | Owner project dapat mentransfer kepemilikan ke member aktif. Old owner menjadi PM; new owner menjadi pemilik baru. | P0 |
| FR-P7 | User dapat membuat Folder bersarang tanpa batas kedalaman. | P0 |
| FR-P8 | Folder hanya untuk pengelompokan visual — tidak masuk path URL. | P0 |

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
| FR-M1 | Sistem menyediakan URL mock berbasis slug project yang unik di seluruh platform. | P0 |
| FR-M2 | Format URL: `https://[server]/mock/{project-slug}/path`. | P0 |
| FR-M3 | Identitas pemanggil ditentukan via API key di header. | P0 |
| FR-M4 | Server mengembalikan Response aktif sesuai endpoint + method + toggle milik pemanggil. | P0 |
| FR-M5 | Untuk POST/PUT/PATCH: validasi payload terhadap Request Schema (field wajib + tipe). | P0 |
| FR-M6 | Jika validasi gagal → kembalikan error sistem yang jelas (terpisah dari response kontrak). | P0 |
| FR-M7 | Sistem bersifat stateless — tidak mengakumulasi data runtime. | P0 |
| FR-M8 | Server mengatur CORS sendiri agar dapat dikonsumsi dari origin pengguna (mis. localhost). | P0 |
| FR-M9 | Mendukung token dummy di header untuk simulasi skenario auth. | P0 |
| FR-M10 | Request dengan API key valid dihitung terhadap kuota — bahkan jika endpoint tidak ditemukan atau schema gagal divalidasi. Request tanpa API key tidak dihitung. | P0 |
| FR-M11 | Jika kuota habis → kembalikan error 429, request tidak diproses dan tidak dihitung. | P0 |
| FR-M12 | Jika endpoint ditemukan tetapi belum memiliki response yang dikonfigurasi → kembalikan 503 dengan pesan informatif. | P0 |

### 5.5 Toggle Response (Per-User)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-T1 | Toggle response menggunakan model radio select: tepat 1 aktif per endpoint per method per user. | P0 |
| FR-T2 | Status toggle bersifat per-user — tidak mempengaruhi anggota lain. | P0 |
| FR-T3 | Default toggle setiap user menunjuk ke default response endpoint. | P0 |
| FR-T4 | Semua role (PM, FE, BE) memiliki kewenangan mengubah toggle miliknya sendiri. | P0 |
| FR-T5 | Saat PM mengubah default response → toggle user yang masih di old default otomatis diupdate ke default baru. Toggle user yang sudah customized tidak diubah. | P0 |

### 5.6 Change Request, Versioning & Notifikasi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-C1 | FE dan BE dapat mengajukan Change Request (CR) perubahan kontrak. | P0 |
| FR-C2 | PM dapat menyetujui atau menolak CR. | P0 |
| FR-C3 | CR yang disetujui → kontrak naik versi baru. | P0 |
| FR-C4 | PM dapat mengedit kontrak langsung (tanpa gerbang approve) → tetap naik versi + notif + riwayat. | P0 |
| FR-C5 | Notifikasi email dikirim berdasarkan event: CR diajukan → PM saja; CR disetujui → semua anggota; CR ditolak → submitter saja; PM edit langsung → semua anggota. | P0 |
| FR-C6 | Sistem menyimpan riwayat versi kontrak — bisa ditinjau kapan saja. | P0 |
| FR-C7 | URL mock selalu mengikuti versi kontrak terbaru. | P0 |
| FR-C8 | Submitter dapat membatalkan CR selama statusnya masih `pending`. CR yang sudah di-approve/reject tidak bisa dibatalkan. | P0 |

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
| FR-Q1 | Setiap akun memiliki kuota 10.000 hit lifetime (default). | P0 |
| FR-Q2 | Batas kuota disimpan sebagai field adjustable di DB per akun — dapat diubah oleh superadmin tanpa deploy ulang. | P0 |
| FR-Q3 | Hit dihitung hanya jika request berhasil melewati validasi API key. Request tanpa API key atau dengan API key tidak valid tidak dihitung. | P0 |
| FR-Q4 | Sisa kuota (`quota.used` dan `quota.limit`) dapat dilihat oleh user di profil dashboard. | P0 |

### 5.9 Profil Pengguna

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-U1 | User dapat mengubah nama dan avatar dari dashboard. | P0 |
| FR-U2 | User dapat mengubah email — membutuhkan konfirmasi password saat ini. Notifikasi dikirim ke email lama dan email baru. | P0 |
| FR-U3 | User dapat mengganti password — membutuhkan password saat ini. Semua sesi aktif di perangkat lain otomatis diinvalidasi. | P0 |
| FR-U4 | User dapat melihat semua undangan project yang menunggu konfirmasi. | P0 |
| FR-U5 | User dapat mencari akun user lain berdasarkan nama atau email (untuk keperluan undangan). Hanya data publik yang dikembalikan. | P0 |

### 5.10 Admin / Superadmin

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-ADM1 | Superadmin dapat melihat daftar semua user platform dengan fitur search dan pagination. | P0 |
| FR-ADM2 | Superadmin dapat melihat detail akun user termasuk API key dan data quota. | P0 |
| FR-ADM3 | Superadmin dapat mengubah role platform user (user ↔ superadmin). Tidak bisa mengubah role dirinya sendiri. | P0 |
| FR-ADM4 | Superadmin dapat mengubah batas quota dan mereset usage quota user mana saja. | P0 |
| FR-ADM5 | Superadmin dapat menghapus user — project yang dimilikinya di-transfer ke superadmin yang melakukan penghapusan, bukan dihapus. | P0 |
| FR-ADM6 | Superadmin dapat melihat daftar semua project di platform dengan fitur search dan pagination. | P0 |
| FR-ADM7 | Superadmin dapat force-delete project mana saja beserta seluruh isinya (cascade delete lengkap). | P0 |
| FR-ADM8 | Superadmin dapat melihat statistik platform: total user, total project, total endpoint, total API call, dan top 5 user berdasarkan penggunaan. | P0 |
| FR-ADM9 | Akun superadmin pertama diinisialisasi via endpoint khusus sekali pakai (`POST /api/auth/admin/register`). Endpoint ini tidak bisa dipanggil jika superadmin sudah ada. | P0 |

---

## 6. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| **Keamanan** | Tidak ada token/key rahasia di URL. JWT, API key, dan dummy token hanya di header. Tidak ada proxy ke API eksternal (mencegah SSRF). Refresh token di httpOnly cookie (mitigasi XSS). |
| **Input Sanitization** | Dua lapis: `express-mongo-sanitize` mencegah MongoDB injection (hapus `$` dan `.` dari body/query), `xss` library membersihkan nilai string dari XSS payload. Berlaku di seluruh request pipeline. |
| **Rate Limiting Auth** | Auth endpoint (login, register, forgot password) dibatasi 10 request per 15 menit per IP via `express-rate-limit`. Mencegah brute-force. Endpoint lain tidak dibatasi di MVP (lihat Section 3.2). |
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
| Keamanan | express-mongo-sanitize, xss |
| Rate limiting | express-rate-limit |
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

### 8.1 Auth Dashboard: Access Token di Header + Refresh Token di Cookie
Sistem menggunakan dua mekanisme berbeda untuk dua tujuan berbeda:

- **Access Token (JWT, 15 menit)** — dikirim via `Authorization: Bearer` header di setiap request API. Tidak disimpan di cookie karena lebih mudah di-set oleh FE dan tidak bermasalah di konteks multi-tab.
- **Refresh Token (opaque, 30 hari)** — disimpan di **httpOnly cookie**. Cookie mencegah akses dari JavaScript → mitigasi XSS. FE dan BE dikonfigurasi di domain yang sama di Vercel (atau dengan `credentials: true` di CORS), sehingga cookie berfungsi dengan baik.

Keputusan ini berbeda dari opsi "semua di cookie" (terlalu ketat untuk cross-origin) atau "semua di header" (refresh token di header rentan XSS).

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

### 8.7 Input Sanitization: Dua Lapis
Semua request body dan query string dibersihkan secara otomatis di level middleware sebelum mencapai controller:
1. **`express-mongo-sanitize`** — menghapus key yang dimulai dengan `$` atau mengandung `.` (mencegah MongoDB injection).
2. **`xss` library** — membersihkan nilai string dari tag dan atribut HTML berbahaya (mencegah stored XSS yang muncul kembali via API response).
Kedua lapisan bersifat non-blocking — data yang aman lolos tanpa perubahan.

### 8.8 Rate Limiting Auth
Auth endpoint (login, register, forgot password) memiliki rate limit 10 request per 15 menit per IP. Ini mencegah serangan brute-force pada kredensial. Rate limit per-menit di seluruh endpoint lain ditunda karena membutuhkan shared state (Redis/Upstash) antar Vercel instances — terlalu kompleks untuk MVP.

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
