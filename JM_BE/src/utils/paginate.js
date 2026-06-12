export const getPaginationParams = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip  = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/*
  LOGIKA PEMROGRAMAN — paginate.js
  ---------------------------------
  Masalah yang diselesaikan:
  Setiap endpoint yang mengembalikan list data butuh pagination.
  Tanpa utility ini, logika hitung skip/limit ditulis ulang di setiap service.

  getPaginationParams(query):
  - Membaca 'page' dan 'limit' dari query string request (mis. ?page=2&limit=20)
  - Math.max(1, ...) → memastikan page tidak pernah < 1 (page 0 atau negatif tidak valid)
  - Math.min(100, ...) → membatasi limit maksimal 100 agar tidak ada yang request 10.000 data sekaligus
  - Math.max(1, ...) pada limit → memastikan limit tidak pernah 0 atau negatif
  - skip = (page - 1) * limit → rumus standar offset untuk MongoDB .skip()
  - Contoh: page=2, limit=10 → skip=10 (lewati 10 data pertama, ambil 10 berikutnya)

  buildPaginationMeta(total, page, limit):
  - Menerima total dokumen dari hasil DB query (biasanya dari .countDocuments())
  - Math.ceil → pembulatan ke atas agar sisa data tetap masuk halaman terakhir
  - Contoh: total=25, limit=10 → totalPages=3 (bukan 2.5)
  - hasNextPage & hasPrevPage → memudahkan FE untuk render tombol navigasi
  - Contoh pemakaian di service:
      const { page, limit, skip } = getPaginationParams(req.query)
      const [data, total] = await Promise.all([
        User.find().skip(skip).limit(limit),
        User.countDocuments()
      ])
      const meta = buildPaginationMeta(total, page, limit)
*/
