import { sendError } from '../utils/apiResponse.js';

const notFound = (req, res) => {
  sendError(
    res,
    `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
    404
  );
};

export default notFound;

/*
  LOGIKA PEMROGRAMAN — notFound.middleware.js
  ---------------------------------------------
  Middleware ini dipasang PALING AKHIR di app.js, setelah semua route didaftarkan.
  Cara pemakaian di app.js:
    app.use('/api', authRoutes)
    app.use('/api', projectRoutes)
    // ... semua route lain ...
    app.use(notFound)      ← harus paling bawah
    app.use(errorHandler)  ← setelah notFound

  Cara kerjanya:
  - Express memproses middleware dari atas ke bawah
  - Jika request tidak cocok dengan route manapun yang didaftarkan sebelumnya,
    Express akan meneruskan ke middleware berikutnya
  - notFound berada paling bawah → hanya tercapai jika tidak ada route yang cocok
  - Ini yang mengembalikan 404 yang proper (JSON) alih-alih HTML default Express

  req.method dan req.originalUrl:
  - req.method     → metode HTTP: GET, POST, dll
  - req.originalUrl → path lengkap termasuk query string, mis. '/api/prjects?page=1'
  - Pesan error yang informatif membantu developer tahu route mana yang salah/typo

  Kenapa tidak pakai next()?
  - notFound adalah terminal middleware — tugasnya mengembalikan response, bukan lanjut
  - Tidak ada parameter 'next' karena tidak perlu meneruskan ke middleware lain
  - Tidak async karena tidak ada I/O — hanya mengirim response langsung
*/
