const isStaticPath = (path) => !path.includes(':');

const patternToRegex = (pattern) => {
  const escaped  = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const regexStr = escaped.replace(/:([^/]+)/g, '([^/]+)');
  return new RegExp(`^${regexStr}$`);
};

const pathsMatch = (incomingPath, endpointPath) => {
  if (isStaticPath(endpointPath)) {
    return incomingPath === endpointPath;
  }
  return patternToRegex(endpointPath).test(incomingPath);
};

export const findMatchingEndpoint = (incomingPath, endpoints) => {
  const staticMatch = endpoints.find(
    (ep) => isStaticPath(ep.path) && ep.path === incomingPath
  );

  if (staticMatch) return staticMatch;

  return endpoints.find(
    (ep) => !isStaticPath(ep.path) && pathsMatch(incomingPath, ep.path)
  ) || null;
};

/*
  LOGIKA PEMROGRAMAN — pathMatcher.js
  -------------------------------------
  Masalah yang diselesaikan:
  Ketika FE memanggil URL mock misalnya /mock/my-project/api/users/123,
  sistem harus mencocokkan '/api/users/123' dengan endpoint yang tersimpan
  di DB dengan path '/api/users/:id'. Ini bukan perbandingan string biasa.

  isStaticPath(path):
  - Mengecek apakah path mengandung ':' atau tidak
  - '/api/users'     → static  (tidak ada ':')
  - '/api/users/:id' → dynamic (ada ':')

  patternToRegex(pattern):
  - Mengubah path pattern menjadi Regular Expression untuk dicocokkan
  - Langkah 1: escape karakter regex spesial (., +, ?, ^, dst) agar tidak dianggap regex
    Contoh: '/api/v1.0/users' → '/api/v1\.0/users'
  - Langkah 2: ganti ':namaParam' dengan '([^/]+)' yang artinya
    "satu atau lebih karakter apa saja kecuali slash"
    Contoh: '/api/users/:id' → '/api/users/([^/]+)'
  - Langkah 3: bungkus dengan ^...$ agar cocok seluruh path, bukan sebagian
    Contoh: '/api/users/:id' → regex /^\/api\/users\/([^/]+)$/
  - Hasil: '/api/users/123' akan cocok, '/api/users/123/orders' tidak cocok

  findMatchingEndpoint(incomingPath, endpoints):
  - Menerima path dari URL yang masuk dan array semua endpoint milik project
  - Langkah 1: cari static match dulu (persis sama, tanpa regex)
    → Ini implementasi aturan "path statis menang atas path dinamis"
    → Contoh: '/api/users/me' akan cocok ke endpoint '/api/users/me' (static),
      bukan ke '/api/users/:id' (dynamic), meskipun keduanya bisa match
  - Langkah 2: jika tidak ada static match, cari dynamic match menggunakan regex
  - Return null jika tidak ada endpoint yang cocok sama sekali
    → Mock service akan mengembalikan 404 "Endpoint tidak ditemukan"
*/
