const CHANGE_TYPES = {
  ENDPOINT_ADDED:    'endpoint_added',
  ENDPOINT_DELETED:  'endpoint_deleted',
  ENDPOINT_MODIFIED: 'endpoint_modified',
  RESPONSE_ADDED:    'response_added',
  RESPONSE_MODIFIED: 'response_modified',
  RESPONSE_DELETED:  'response_deleted',
  SCHEMA_MODIFIED:   'schema_modified',
};

export const createDiff = (type, payload) => {
  const templates = {
    [CHANGE_TYPES.ENDPOINT_ADDED]: () => ({
      type,
      summary: `Endpoint baru ditambahkan: ${payload.method} ${payload.path}`,
      detail: payload,
    }),
    [CHANGE_TYPES.ENDPOINT_DELETED]: () => ({
      type,
      summary: `Endpoint dihapus: ${payload.method} ${payload.path}`,
      detail: payload,
    }),
    [CHANGE_TYPES.ENDPOINT_MODIFIED]: () => ({
      type,
      summary: `Endpoint diubah: ${payload.method} ${payload.path}`,
      changes: payload.changes,
    }),
    [CHANGE_TYPES.RESPONSE_ADDED]: () => ({
      type,
      summary: `Response ${payload.statusCode} ditambahkan pada ${payload.method} ${payload.path}`,
      detail: payload,
    }),
    [CHANGE_TYPES.RESPONSE_MODIFIED]: () => ({
      type,
      summary: `Response ${payload.statusCode} diubah pada ${payload.method} ${payload.path}`,
      changes: payload.changes,
    }),
    [CHANGE_TYPES.RESPONSE_DELETED]: () => ({
      type,
      summary: `Response ${payload.statusCode} dihapus dari ${payload.method} ${payload.path}`,
      detail: payload,
    }),
    [CHANGE_TYPES.SCHEMA_MODIFIED]: () => ({
      type,
      summary: `Request schema diubah pada ${payload.method} ${payload.path}`,
      changes: payload.changes,
    }),
  };

  const builder = templates[type];
  if (!builder) {
    return { type: 'unknown', summary: 'Perubahan tidak diketahui', detail: payload };
  }

  return builder();
};

export const formatDiffForEmail = (diffs) => {
  const list = Array.isArray(diffs) ? diffs : [diffs];
  return list.map((d) => `• ${d.summary}`).join('\n');
};

export { CHANGE_TYPES };

/*
  LOGIKA PEMROGRAMAN — contractDiff.js
  --------------------------------------
  Masalah yang diselesaikan:
  Setiap perubahan kontrak harus menghasilkan ringkasan yang bisa:
  1. Ditampilkan ke PM sebagai preview sebelum approve CR
  2. Disimpan ke ContractVersion.diff sebagai catatan permanen
  3. Diformat menjadi isi notifikasi email ke semua anggota project

  Ketiga kebutuhan ini memakai format yang sama → utility terpusat.

  CHANGE_TYPES:
  - Object konstanta berisi semua tipe perubahan yang mungkin terjadi
  - Diexport agar service layer bisa menggunakannya tanpa hardcode string
  - Contoh pemakaian di service:
      import { createDiff, CHANGE_TYPES } from '../utils/contractDiff.js'
      const diff = createDiff(CHANGE_TYPES.RESPONSE_ADDED, {
        method: 'POST', path: '/api/users', statusCode: 201
      })

  createDiff(type, payload):
  - Menggunakan object 'templates' (map dari type ke function) sebagai pengganti switch-case
  - Setiap template adalah function () => {...} yang dipanggil saat tipe cocok
  - Pola ini disebut "strategy pattern" — mudah ditambah tipe baru tanpa mengubah logika utama
  - Setiap hasil diff memiliki: type (untuk filter), summary (kalimat ringkas), detail/changes (data)
  - Jika type tidak dikenal → fallback ke 'unknown' agar tidak throw error

  formatDiffForEmail(diffs):
  - Menerima satu diff object atau array diff objects
  - Array.isArray() untuk normalisasi input → selalu diproses sebagai array
  - Setiap summary diawali '•' dan digabung dengan newline
  - Output contoh:
      • Endpoint baru ditambahkan: POST /api/orders
      • Response 201 ditambahkan pada POST /api/orders
  - String ini langsung bisa dimasukkan ke template email di mailer.js
*/
