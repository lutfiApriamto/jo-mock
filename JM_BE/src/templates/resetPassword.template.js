/**
 * Template email konfirmasi setelah password berhasil direset.
 * @param {{ name: string }} params
 */
export const resetPasswordSuccessTemplate = ({ name }) => {
  const changedAt = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    subject: 'Password Berhasil Diubah — JO-MOCK',

    text: `Halo ${name},\n\nPassword akun JO-MOCK Anda telah berhasil diubah pada ${changedAt} WIB.\n\nJika Anda tidak melakukan perubahan ini, segera hubungi tim JO-MOCK.\n\n— Tim JO-MOCK`,

    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Berhasil Diubah — JO-MOCK</title>
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

          <!-- SUCCESS BADGE -->
          <tr>
            <td style="background-color:#FFFFFF;padding:32px 40px 0;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#ECFDF3;border:1px solid #ABEFC6;border-radius:100px;padding:6px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#17B26A;letter-spacing:0.5px;text-transform:uppercase;">
                      &#10003;&nbsp; Berhasil
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

              <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">Password Anda berhasil diubah</h1>

              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Halo, <strong style="color:#1A1726;">${name}</strong>!
              </p>
              <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Password akun JO-MOCK Anda telah berhasil diperbarui. Anda sekarang bisa login menggunakan password baru Anda.
              </p>

              <!-- DETAIL PERUBAHAN -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #E5E1EF;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:16px 20px;background-color:#FAFAFA;border-bottom:1px solid #E5E1EF;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Detail Perubahan</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;width:120px;padding-bottom:8px;">Aksi</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:8px;">Reset Password</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;">Waktu</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${changedAt} WIB</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- SECURITY WARNING -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#FFF9F9;border-left:3px solid #F04438;border-radius:0 6px 6px 0;padding:12px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B5870;line-height:1.6;">
                      <strong style="color:#1A1726;">Bukan Anda yang melakukan ini?</strong><br>
                      Jika Anda tidak mereset password, akun Anda mungkin dalam bahaya. Segera hubungi tim JO-MOCK atau gunakan fitur "Lupa Password" untuk mengambil alih akun.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5B5870;">
                Salam,<br>
                <strong style="color:#1A1726;">Tim JO-MOCK</strong>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#FAFAFA;border:1px solid #E5E1EF;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;">
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
  };
};

/*
  LOGIKA PEMROGRAMAN — resetPassword.template.js
  ------------------------------------------------
  Template email konfirmasi yang dikirim SETELAH password berhasil direset.
  Berbeda dari forgotPassword.template.js yang dikirim SEBELUM reset (berisi link).

  Tujuan email konfirmasi ini:
  1. Memberi tahu user bahwa perubahan berhasil → mereka bisa langsung login
  2. Sebagai peringatan keamanan — jika bukan user yang melakukan ini,
     mereka tahu ada aktivitas mencurigakan dan bisa segera bertindak

  changedAt:
  - Digenerate di saat function dipanggil → mencerminkan waktu server memproses reset
  - Diformat ke zona waktu Asia/Jakarta (WIB) agar relevan untuk user Indonesia
  - toLocaleString('id-ID') → format tanggal dalam Bahasa Indonesia

  Elemen desain:
  - Badge "Berhasil" dengan warna hijau (#17B26A) di atas heading → visual feedback positif
  - Tabel "Detail Perubahan" → memberi konteks kapan perubahan terjadi
  - Security warning dengan border merah (#F04438) → peringatan yang mencolok tapi tidak menakutkan
  - Tidak ada CTA button karena tidak ada aksi yang perlu dilakukan user (hanya informasi)

  Cara pemakaian di auth.service.js:
    import { resetPasswordSuccessTemplate } from '../../templates/resetPassword.template.js'
    const { subject, html, text } = resetPasswordSuccessTemplate({ name: user.name })
    await sendMail({ to: user.email, subject, html, text })
*/
