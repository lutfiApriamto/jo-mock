import 'dotenv/config';
import express              from 'express';
import cors                 from 'cors';
import cookieParser         from 'cookie-parser';
import connectDB            from './config/db.js';
import { mongoSanitizer, xssSanitizer } from './middlewares/sanitizer.middleware.js';
import notFound             from './middlewares/notFound.middleware.js';
import errorHandler         from './middlewares/errorHandler.js';

// Modules
import authRoutes           from './modules/auth/auth.routes.js';
import projectRoutes        from './modules/project/project.routes.js';
import memberRoutes         from './modules/member/member.routes.js';

const app = express();

// ─── Global Middlewares ───────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(mongoSanitizer);
app.use(xssSanitizer);

// ─── Database ─────────────────────────────────────────────────────────────────

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch {
    next(new Error('Koneksi database gagal'));
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/auth',     authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', memberRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

export default app;

/*
  LOGIKA PEMROGRAMAN — app.js
  ----------------------------
  File ini adalah titik pusat Express — tempat semua middleware dan route dikonfigurasi.
  app.js hanya mengekspor `app` (Express instance), bukan server HTTP.
  Server HTTP dibuat di api/index.js (Vercel) atau bisa dibuatkan server.js terpisah untuk dev lokal.

  Urutan middleware PENTING — Express memproses dari atas ke bawah:

  1. cors():
     - Mengizinkan request dari FE origin (CLIENT_URL = http://localhost:5173 saat dev)
     - Harus di atas semua route agar OPTIONS preflight request dijawab sebelum menyentuh logic
     - credentials: true → diperlukan jika FE kirim cookies atau Authorization header

  2. express.json() + express.urlencoded():
     - Memparse body request menjadi JavaScript object (tersedia via req.body)
     - Harus ada sebelum route mana pun yang membaca req.body
     - urlencoded({ extended: false }) → support form submission biasa

  3. mongoSanitizer:
     - Hapus/replace karakter MongoDB operator ($, .) dari req.body dan req.query
     - Mencegah NoSQL injection attack
     - Dijalankan setelah body parse agar req.body sudah tersedia

  4. xssSanitizer:
     - Filter karakter HTML berbahaya dari semua string di req.body dan req.query
     - Dijalankan setelah mongoSanitizer
     - CATATAN: Jangan pasang xssSanitizer di route mock (akan ditambahkan nanti)
       karena akan merusak response body JSON yang user definisikan

  5. connectDB (per-request middleware):
     - Di lingkungan serverless (Vercel), koneksi DB tidak dijamin persistent antar request
     - Memanggil connectDB() di setiap request memastikan koneksi selalu ada
     - Koneksi di-cache di global.mongoose — bukan buat koneksi baru setiap kali
     - Jika koneksi gagal → error diteruskan ke errorHandler via next()

  6. Routes (/api/...):
     - Semua route diprefix /api untuk memisahkan dari static files atau path lain
     - Setiap module punya routenya sendiri dan diimport di sini

  7. notFound:
     - Harus setelah semua route — menangkap request yang tidak cocok dengan route manapun
     - Mengembalikan 404 JSON (bukan HTML default Express)

  8. errorHandler:
     - Harus PALING TERAKHIR — Express mengenali error handler dari 4 parameter
     - Menangkap semua error yang di-throw di dalam asyncHandler atau next(err) manual

  Cara tambah module baru:
    import projectRoutes from './modules/project/project.routes.js'
    app.use('/api/projects', projectRoutes)  // tambahkan sebelum notFound
*/
