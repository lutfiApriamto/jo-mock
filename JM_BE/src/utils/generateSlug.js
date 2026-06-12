import Project from '../models/project.model.js';

const toBaseSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateUniqueSlug = async (name) => {
  const base = toBaseSlug(name);

  if (!base) throw new Error('Nama project tidak valid untuk dijadikan slug');

  let slug    = base;
  let counter = 1;

  while (await Project.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};

/*
  LOGIKA PEMROGRAMAN — generateSlug.js
  --------------------------------------
  Masalah yang diselesaikan:
  Setiap project butuh slug unik yang dipakai di URL mock:
  /mock/{slug}/api/users
  Slug harus bersih (hanya huruf kecil, angka, dan strip) dan unik di seluruh DB.

  toBaseSlug(name):
  - Serangkaian operasi string yang dijalankan berantai (chaining)
  - .toLowerCase()              → 'User Management API' → 'user management api'
  - .trim()                     → hapus spasi di awal/akhir
  - .replace(/[^a-z0-9\s-]/g)  → hapus semua karakter selain huruf, angka, spasi, strip
    Contoh: 'Jo-Mock (v2)!' → 'jo-mock v2'
  - .replace(/\s+/g, '-')      → ganti semua spasi (termasuk multiple spaces) dengan strip
    Contoh: 'user   management' → 'user-management'
  - .replace(/-+/g, '-')       → collapse strip berulang menjadi satu
    Contoh: 'user--management' → 'user-management'
  - .replace(/^-+|-+$/g, '')   → hapus strip di awal dan akhir
    Contoh: '-user-management-' → 'user-management'

  generateUniqueSlug(name):
  - Pertama generate base slug dari nama project
  - Cek ke DB apakah slug sudah ada dengan Project.exists() (lebih efisien dari findOne)
  - Jika sudah ada → tambahkan counter di akhir: 'my-project-1', 'my-project-2', dst
  - Loop terus sampai slug yang belum dipakai ditemukan
  - Contoh: jika 'user-api' sudah ada → coba 'user-api-1' → jika masih ada → 'user-api-2' → dst
  - Ini memastikan slug selalu unik tanpa perlu UUID (lebih mudah dibaca manusia)
  - Catatan: race condition bisa terjadi di traffic tinggi, tapi untuk MVP tidak masalah
    (bisa ditangani dengan unique index di DB yang akan throw error jika collision)
*/
