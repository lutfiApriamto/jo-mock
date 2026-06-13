// Controller mock — satu handler untuk semua method dan semua path.
// Error platform (auth, not found, validation) tetap menggunakan format sendError standar.
// Response sukses dikembalikan RAW — status code + body persis seperti yang dikonfigurasi PM,
// TIDAK dibungkus sendSuccess, karena ini adalah mock response asli yang di-consume developer.

import asyncHandler    from '../../utils/asyncHandler.js';
import * as mockService from './mock.service.js';

export const executeMock = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const method   = req.method;

  // Ekstrak mock path dari URL. req.path di dalam router ini adalah '/slug/api/users/123',
  // jadi strip prefix '/:slug' untuk dapat '/api/users/123'.
  // req.params.path (named wildcard *path) berisi 'api/users/123' tanpa leading slash.
  const incomingPath = '/' + (req.params.path || '');

  const response = await mockService.executeMock(
    slug,
    method,
    incomingPath,
    req.mockUser._id,
    req.body,
  );

  // Kembalikan body langsung dengan status code yang dikonfigurasi PM.
  // body tersimpan sebagai JSON string — parse dulu agar tidak double-encoded.
  res.status(response.statusCode).json(JSON.parse(response.body));
});
