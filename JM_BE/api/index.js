import app from '../src/app.js';

// Di development lokal: jalankan HTTP server biasa
// Di Vercel (production): tidak perlu listen — Vercel mengelola lifecycle-nya sendiri
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[DEV] Server berjalan di http://localhost:${PORT}`);
  });
}

// Export untuk Vercel serverless runtime — Vercel akan wrap app Express ini sebagai handler
export default app;

/*
  LOGIKA PEMROGRAMAN — api/index.js
  -----------------------------------
  File ini adalah entry point yang bekerja di DUA lingkungan berbeda:

  1. Development lokal (npm run dev → nodemon api/index.js):
     - NODE_ENV bukan 'production' → app.listen() dipanggil
     - Server HTTP berjalan di port 5000 (atau PORT dari .env)
     - Nodemon merestart server otomatis saat ada perubahan file

  2. Production Vercel (serverless):
     - NODE_ENV = 'production' → app.listen() TIDAK dipanggil
     - Vercel mengimport file ini dan mengambil `export default app`
     - Vercel mengelola HTTP lifecycle sendiri: menerima request → kirim ke app Express → return response
     - Tidak ada long-running process — setiap serverless function invocation berdiri sendiri

  Kenapa folder 'api/'?
  - Vercel otomatis mengenali file di folder 'api/' sebagai serverless function
  - Bersama vercel.json yang catch-all, semua request HTTP diteruskan ke file ini

  Contoh vercel.json yang diperlukan:
  {
    "version": 2,
    "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
    "routes": [{ "src": "/(.*)", "dest": "api/index.js" }]
  }

  Pemisahan app.js dan index.js:
  - app.js  → konfigurasi Express murni (middleware, routes) — dapat diimport untuk testing
  - index.js → urusan runtime (kapan listen, kapan export) — tidak perlu disentuh saat tambah module
*/
