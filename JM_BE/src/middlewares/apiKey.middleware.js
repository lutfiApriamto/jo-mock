import { sendError } from '../utils/apiResponse.js';
import asyncHandler   from '../utils/asyncHandler.js';
import User           from '../models/user.model.js';

const apiKey = asyncHandler(async (req, res, next) => {
  const key = req.headers['x-api-key'];

  if (!key) {
    return sendError(res, 'API key tidak ditemukan. Sertakan x-api-key di header.', 401);
  }

  const user = await User.findOne({ apiKey: key });

  if (!user) {
    return sendError(res, 'API key tidak valid', 401);
  }

  req.mockUser = user;
  next();
});

export default apiKey;

/*
  LOGIKA PEMROGRAMAN — apiKey.middleware.js
  -------------------------------------------
  Middleware ini KHUSUS untuk route mock (/mock/:projectId/...).
  Bukan untuk route dashboard — dashboard pakai auth.middleware.js (JWT).

  Mengapa menggunakan API key terpisah (bukan JWT)?
  - URL mock dipanggil dari aplikasi React milik FE (localhost atau domain mereka sendiri)
  - JWT dashboard tidak bisa dikirim dari sana karena tersimpan di context/state FE platform
  - API key adalah credential yang di-copy sekali dari dashboard, lalu disisipkan
    ke semua request mock sebagai header 'x-api-key'
  - Ini bukan konflik: JWT = "siapa yang login ke platform", API key = "siapa yang hit mock"

  Header 'x-api-key':
  - Nama header bersifat lowercase di Node.js (HTTP/1.1 headers case-insensitive)
  - FE perlu mengirim: headers: { 'x-api-key': 'uuid-api-key-mereka' }
  - Jika tidak ada header ini sama sekali → 401 dengan pesan yang menjelaskan cara benarnya

  req.mockUser vs req.user:
  - req.user   → dipakai oleh auth.middleware (user yang login ke dashboard platform)
  - req.mockUser → dipakai oleh apiKey.middleware (user yang memanggil URL mock)
  - Dipisah agar tidak ada kebingungan di controller/service mock
  - quota.middleware.js yang berjalan setelah ini akan membaca req.mockUser
*/
