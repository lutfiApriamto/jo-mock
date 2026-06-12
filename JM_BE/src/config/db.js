import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

export default connectDB;

/*
  LOGIKA PEMROGRAMAN — db.js
  ----------------------------
  File ini menangani koneksi ke MongoDB Atlas dengan mekanisme caching
  yang dirancang khusus untuk lingkungan serverless (Vercel).

  Masalah tanpa caching:
  Vercel serverless function tidak selalu "mati" setelah satu request selesai.
  Namun, tidak ada jaminan koneksi sebelumnya masih hidup di invocation berikutnya.
  Tanpa caching, setiap cold start membuat koneksi baru. MongoDB Atlas M0 (free tier)
  hanya mengizinkan maksimal 500 koneksi bersamaan. Jika traffic tinggi atau banyak
  cold start terjadi → koneksi habis → semua request gagal.

  Mekanisme caching dengan global:
  - Di Node.js, variabel 'global' bertahan selama proses (process) masih hidup
  - Di Vercel, satu "container" bisa melayani banyak request berturut-turut
  - Dengan menyimpan koneksi di global.mongoose, container yang sama tidak
    perlu membuat koneksi baru untuk request kedua, ketiga, dan seterusnya
  - { conn: null, promise: null } → struktur cache: conn = koneksi aktif,
    promise = proses koneksi yang sedang berlangsung

  Alur eksekusi connectDB():
  1. Cek cached.conn → jika sudah ada koneksi aktif, langsung return (paling cepat)
  2. Cek cached.promise → jika sedang dalam proses koneksi (belum selesai tapi sudah dimulai),
     tunggu promise yang sama — tidak buat koneksi paralel baru
  3. Jika keduanya null → buat koneksi baru, simpan promise-nya ke cache
  4. Await promise → saat selesai, simpan hasilnya ke cached.conn
  5. Jika koneksi gagal (throw) → reset cached.promise ke null agar bisa dicoba lagi
     di request berikutnya (tidak stuck di promise yang rejected selamanya)

  bufferCommands: false:
  - Default Mongoose: jika DB belum terhubung, query di-"buffer" (antri) dulu
  - Dengan false: query langsung error jika DB tidak terhubung
  - Ini lebih baik untuk serverless → error terdeteksi cepat, tidak antri tanpa batas

  Cara pemakaian di app.js atau di awal setiap request:
    import connectDB from './config/db.js'
    await connectDB()  ← pastikan koneksi ada sebelum proses request
*/
