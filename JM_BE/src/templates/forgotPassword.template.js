/**
 * Template email untuk permintaan reset password.
 * @param {{ name: string, resetUrl: string }} params
 */
export const forgotPasswordTemplate = ({ name, resetUrl }) => ({
  subject: 'Reset Password — JO-MOCK',

  text: `Halo ${name},\n\nGunakan link berikut untuk mereset password akun JO-MOCK Anda:\n${resetUrl}\n\nLink ini aktif selama 1 jam. Jika Anda tidak meminta ini, abaikan email ini.\n\n— Tim JO-MOCK`,

  html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password — JO-MOCK</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F3FB;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F3FB;padding:48px 20px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#6C5CE7;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-family:'Trebuchet MS',Georgia,serif;font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">JO-MOCK</p>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:400;color:#C5BEFF;letter-spacing:1.5px;text-transform:uppercase;">Joint Operations Mock</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#FFFFFF;padding:40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

              <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">Reset password Anda</h1>

              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Halo, <strong style="color:#1A1726;">${name}</strong>!
              </p>
              <p style="margin:0 0 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Kami menerima permintaan untuk mereset password akun JO-MOCK Anda. Klik tombol di bawah untuk membuat password baru.
              </p>

              <!-- CTA BUTTON -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#6C5CE7;border-radius:8px;">
                    <a href="${resetUrl}" target="_blank"
                       style="display:inline-block;padding:14px 36px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- EXPIRY NOTICE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#F4F3FB;border-left:3px solid #6C5CE7;border-radius:0 6px 6px 0;padding:12px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B5870;line-height:1.6;">
                      Link ini akan kedaluwarsa dalam <strong style="color:#1A1726;">1 jam</strong> sejak email ini dikirim.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- SECURITY NOTE -->
              <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#8B889C;">
                Jika Anda tidak meminta reset password ini, abaikan email ini. Password Anda tidak akan berubah dan tidak ada tindakan lebih lanjut yang diperlukan.
              </p>

              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5B5870;">
                Salam,<br>
                <strong style="color:#1A1726;">Tim JO-MOCK</strong>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#FAFAFA;border:1px solid #E5E1EF;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8B889C;text-align:center;">
                Tombol tidak berfungsi? Salin link berikut ke browser Anda:
              </p>
              <p style="margin:0 0 16px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#6C5CE7;text-align:center;word-break:break-all;">
                ${resetUrl}
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8B889C;text-align:center;">
                &copy; ${new Date().getFullYear()} JO-MOCK &middot; Joint Operations Mock
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
});

/*
  LOGIKA PEMROGRAMAN — forgotPassword.template.js
  -------------------------------------------------
  Template ini menghasilkan email yang dikirim saat user meminta reset password.
  Fungsi menerima { name, resetUrl } dan mengembalikan object { subject, text, html }.

  Desain keputusan:
  - subject   → judul email di inbox
  - text      → plain-text fallback untuk email client yang tidak render HTML
  - html      → konten utama, table-based layout untuk kompatibilitas email client

  Kenapa table-based layout?
  - Email client seperti Gmail, Outlook, Apple Mail tidak mendukung flexbox/grid
  - <table> adalah cara paling kompatibel untuk membuat layout multi-kolom di email
  - Semua style harus inline — Gmail dan beberapa client menghapus <style> block di <head>

  Kenapa tidak pakai Google Fonts?
  - Banyak email client memblokir external resource termasuk Google Fonts CDN
  - Font stack fallback: 'Trebuchet MS' (pre-installed di Windows/Mac) → Georgia → serif
  - Arial / Helvetica untuk body text (universal, terbaca di semua platform)
  - 'Courier New' untuk URL monospace di footer

  Struktur layout:
  1. Header — background indigo (#6C5CE7), nama brand JO-MOCK, tagline
  2. Body   — greeting dengan nama user, penjelasan singkat, CTA button, notice, security note
  3. Footer — fallback URL (teks monospace), copyright

  CTA Button (tabel-dalam-tabel):
  - Tombol anchor <a> dibungkus dalam <td> yang punya background-color
  - Ini pola standar untuk email button yang terlihat sama di semua client
  - Jika hanya pakai padding di <a>, Outlook tidak akan menampilkan background dengan benar

  resetUrl format:
  - `${CLIENT_URL}/reset-password/${rawToken}`
  - rawToken adalah token mentah 32-byte hex yang BELUM di-hash
  - Di server, token ini di-hash SHA-256 sebelum dibandingkan dengan DB
  - Ini mencegah token bocor dari DB menjadi berguna untuk attacker

  Cara pemakaian di auth.service.js:
    import { forgotPasswordTemplate } from '../../templates/forgotPassword.template.js'
    const { subject, html, text } = forgotPasswordTemplate({ name, resetUrl })
    await sendMail({ to: user.email, subject, html, text })
*/
