import nodemailer from 'nodemailer';

// pool: true → koneksi SMTP di-reuse antar email, tidak buat koneksi baru setiap kali.
// Penting untuk sequential sending: tanpa pool, setiap sendMail buka + tutup koneksi
// sendiri sehingga 10 email = 10 koneksi terpisah (lambat).
// maxConnections: 1 → cukup satu koneksi karena pengiriman dilakukan satu per satu.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool:    true,
  maxConnections: 1,
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
