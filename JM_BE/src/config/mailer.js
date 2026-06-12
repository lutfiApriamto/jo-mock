import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"JO-MOCK Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

export default transporter;

/*
  LOGIKA PEMROGRAMAN — mailer.js
  --------------------------------
  File ini menyiapkan "pengirim email" yang siap dipakai oleh service manapun
  yang perlu mengirim notifikasi. Di JO-MOCK, email dikirim saat:
  - CR diapprove atau ditolak   → notifikasi ke pengaju
  - Kontrak berubah             → notifikasi ke semua anggota project + diff
  - User diundang ke project    → email undangan

  nodemailer.createTransport():
  - Membuat transporter — objek yang tahu "lewat mana" email akan dikirim
  - service: 'gmail' → shortcut konfigurasi untuk Gmail SMTP (smtp.gmail.com:587)
  - Nodemailer sudah tahu host, port, dan TLS untuk Gmail secara otomatis

  Kredensial dari .env:
  - EMAIL_USER → alamat Gmail pengirim (mis. jomock.platform@gmail.com)
  - EMAIL_PASS → bukan password Gmail biasa, melainkan "App Password" dari Google
  - App Password dibuat di: Google Account → Security → 2-Step Verification → App passwords
  - Ini wajib jika akun Gmail mengaktifkan 2FA (yang sangat direkomendasikan)
  - Jangan pernah hardcode email dan password di source code

  sendMail({ to, subject, text, html }):
  - Helper function agar service tidak perlu tahu detail mailOptions setiap kali kirim
  - 'from' diformat sebagai "JO-MOCK Platform <email>" → terlihat profesional di inbox
  - 'text' → fallback plain text (untuk email client yang tidak render HTML)
  - 'html' → konten email dalam format HTML (lebih rapi, bisa ada styling)
  - Keduanya bisa dikirim bersamaan — email client memilih yang bisa di-render
  - Contoh pemakaian di changeRequest.service.js:
      import { sendMail } from '../../config/mailer.js'
      await sendMail({
        to: 'member@email.com',
        subject: 'Kontrak diperbarui — JO-MOCK',
        text: 'Ada perubahan kontrak pada project Anda.',
        html: '<p>Ada <b>perubahan kontrak</b> pada project Anda.</p>'
      })

  Export ganda:
  - export default transporter → jika ada kasus khusus yang butuh akses langsung ke transporter
  - export const sendMail      → yang dipakai sehari-hari oleh service

  Catatan penting untuk production:
  - Gmail membatasi pengiriman ~500 email/hari untuk akun personal
  - Jika nanti traffic besar, pertimbangkan layanan seperti SendGrid, Resend, atau Mailgun
  - Untuk MVP, Gmail sudah lebih dari cukup
*/
