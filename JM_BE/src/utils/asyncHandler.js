const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

/*
  LOGIKA PEMROGRAMAN — asyncHandler.js
  --------------------------------------
  Masalah yang diselesaikan:
  Setiap controller yang menggunakan async/await harus membungkus kode-nya
  dengan try-catch agar error tidak membuat server crash. Tanpa utility ini,
  setiap controller ditulis seperti ini:

    export const getUser = async (req, res, next) => {
      try {
        const user = await userService.getById(req.params.id)
        res.json(user)
      } catch (err) {
        next(err) // wajib ada di setiap controller
      }
    }

  Dengan asyncHandler, controller menjadi bersih:
    export const getUser = asyncHandler(async (req, res) => {
      const user = await userService.getById(req.params.id)
      res.json(user)
    })

  Cara kerjanya:
  - asyncHandler menerima sebuah function (fn) dan mengembalikan function Express baru
  - Function baru tersebut memanggil fn(req, res, next) dan membungkus hasilnya dengan Promise.resolve()
  - Jika fn melempar error (throw) atau Promise-nya reject → .catch(next) menangkap dan
    meneruskannya ke Express error handler middleware (errorHandler.js)
  - Promise.resolve() dipakai agar asyncHandler juga aman dipakai untuk function non-async
    (Promise.resolve(nilai_biasa) tetap menghasilkan Promise yang langsung resolved)

  Alur error:
  asyncHandler → catch → next(err) → errorHandler middleware → sendError ke client
*/
