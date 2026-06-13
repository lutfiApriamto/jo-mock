import { Router } from 'express';
import apiKey      from '../../middlewares/apiKey.middleware.js';
import quota       from '../../middlewares/quota.middleware.js';
import * as ctrl   from './mock.controller.js';

const router = Router();

// Semua mock request wajib menyertakan x-api-key di header.
// Quota di-increment +1 setiap request yang lolos autentikasi.
router.use(apiKey);
router.use(quota);

// Tangkap semua method + semua path setelah /:slug.
// *path adalah named wildcard Express 5 — menangkap segmen path apa pun termasuk '/'
// Contoh: GET  /mock/my-project/api/users/123  → slug='my-project', path='api/users/123'
//         POST /mock/my-project/api/orders     → slug='my-project', path='api/orders'
router.all('/:slug/*path', ctrl.executeMock);

export default router;
