import mongoSanitize from 'express-mongo-sanitize';
import { filterXSS }  from 'xss';

const sanitizeValue = (value) => {
  if (typeof value === 'string')  return filterXSS(value);
  if (Array.isArray(value))       return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeValue(v)])
    );
  }
  return value;
};

export const mongoSanitizer = mongoSanitize({ replaceWith: '_' });

export const xssSanitizer = (req, res, next) => {
  if (req.body)  req.body  = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  next();
};

/*
  LOGIKA PEMROGRAMAN — sanitizer.middleware.js
  ----------------------------------------------
  File ini mengekspor DUA middleware terpisah yang dipakai berbeda di app.js:
  1. mongoSanitizer → cegah NoSQL Injection
  2. xssSanitizer   → cegah XSS (Cross-Site Scripting)

  === mongoSanitizer ===
  Masalah yang diselesaikan:
  MongoDB query bisa dimanipulasi jika user mengirim object sebagai nilai field.
  Contoh serangan: { "email": { "$gt": "" } }
  Ini bisa bypass query 'findOne({ email })' dan mengembalikan user manapun.

  express-mongo-sanitize bekerja dengan:
  - Memindai seluruh req.body, req.query, req.params
  - Menghapus atau mengganti key yang diawali '$' atau mengandung '.'
  - { replaceWith: '_' } → ganti karakter berbahaya dengan '_' (bukan dihapus)
    sehingga struktur data tetap terjaga, hanya karakter berbahaya yang diganti

  === xssSanitizer ===
  Masalah yang diselesaikan:
  Jika user menyimpan string seperti '<script>alert("xss")</script>' sebagai nama project
  atau deskripsi, dan FE me-render string ini langsung ke DOM tanpa escape,
  script tersebut akan dieksekusi di browser pengguna lain.

  filterXSS() dari library 'xss':
  - Mengkonversi karakter HTML berbahaya menjadi HTML entities
  - '<script>' → '&lt;script&gt;' (tidak bisa dieksekusi browser)
  - Hanya berlaku untuk string — angka, boolean, null diabaikan

  sanitizeValue() (recursive):
  - Menerapkan filterXSS ke semua nilai string dalam object/array secara rekursif
  - String → langsung filter
  - Array  → map setiap elemen dengan sanitizeValue (bisa berisi string atau object)
  - Object → rekursif ke semua value-nya
  - Tipe lain (number, boolean, null) → dikembalikan apa adanya

  CATATAN PENTING:
  xssSanitizer TIDAK diaplikasikan ke body response yang user definisikan di kontrak.
  Body response mock disimpan sebagai string JSON mentah dan dikembalikan apa adanya ke FE.
  Sanitasi yang agresif di sana akan merusak konten JSON yang valid.
  Middleware ini hanya dipakai untuk route dashboard (nama project, deskripsi, dll).

  Cara pemakaian di app.js:
    import { mongoSanitizer, xssSanitizer } from './middlewares/sanitizer.middleware.js'
    app.use(mongoSanitizer)  // global — semua route
    app.use(xssSanitizer)    // global — semua route kecuali route mock
*/
