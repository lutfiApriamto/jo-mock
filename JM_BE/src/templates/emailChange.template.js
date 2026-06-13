const formatDate = () =>
  new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const baseHeader = `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
    <tr>
      <td style="background-color:#6C5CE7;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
        <p style="margin:0;font-family:'Trebuchet MS',Georgia,serif;font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;">JO-MOCK</p>
        <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:400;color:#C5BEFF;letter-spacing:1.5px;text-transform:uppercase;">Joint Operations Mock</p>
      </td>
    </tr>`;

const baseFooter = (year) => `
    <tr>
      <td style="background-color:#FAFAFA;border:1px solid #E5E1EF;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8B889C;text-align:center;">
          &copy; ${year} JO-MOCK &middot; Joint Operations Mock
        </p>
      </td>
    </tr>
  </table>`;

/**
 * Dikirim ke EMAIL LAMA — memberi tahu bahwa email akun telah diganti.
 * @param {{ name: string, newEmail: string }} params
 */
export const emailChangeOldTemplate = ({ name, newEmail }) => {
  const changedAt = formatDate();
  const year      = new Date().getFullYear();

  return {
    subject: 'Peringatan: Email Akun Anda Telah Diubah — JO-MOCK',

    text: `Halo ${name},\n\nEmail akun JO-MOCK Anda telah berhasil diubah ke ${newEmail} pada ${changedAt} WIB.\n\nJika Anda tidak melakukan perubahan ini, segera gunakan fitur "Lupa Password" atau hubungi tim JO-MOCK.\n\n— Tim JO-MOCK`,

    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Peringatan: Email Akun Diubah — JO-MOCK</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F3FB;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F3FB;padding:48px 20px;">
    <tr>
      <td align="center">
        ${baseHeader}

        <!-- WARNING BADGE -->
        <tr>
          <td style="background-color:#FFFFFF;padding:32px 40px 0;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#FFF9F9;border:1px solid #FECDD3;border-radius:100px;padding:6px 16px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#E11D48;letter-spacing:0.5px;text-transform:uppercase;">
                    &#9888;&nbsp; Peringatan Keamanan
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

            <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">Email akun Anda telah diubah</h1>

            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
              Halo, <strong style="color:#1A1726;">${name}</strong>!
            </p>
            <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
              Email akun JO-MOCK Anda baru saja berhasil diubah. Email baru akan digunakan untuk login dan menerima notifikasi selanjutnya.
            </p>

            <!-- DETAIL PERUBAHAN -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #E5E1EF;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:14px 20px;background-color:#FAFAFA;border-bottom:1px solid #E5E1EF;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Detail Perubahan</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;width:110px;padding-bottom:10px;vertical-align:top;">Aksi</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">Ganti Email</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">Email Baru</td>
                      <td style="font-family:'Courier New',Courier,monospace;font-size:13px;color:#6C5CE7;font-weight:600;padding-bottom:10px;">${newEmail}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;vertical-align:top;">Waktu</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${changedAt} WIB</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- SECURITY WARNING -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background-color:#FFF9F9;border-left:3px solid #F04438;border-radius:0 6px 6px 0;padding:14px 16px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B5870;line-height:1.6;">
                    <strong style="color:#1A1726;">Bukan Anda yang melakukan ini?</strong><br>
                    Jika Anda tidak mengubah email, akun Anda mungkin diakses orang lain. Segera gunakan fitur <strong>Lupa Password</strong> untuk mengambil alih akun dan amankan data Anda.
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

        ${baseFooter(year)}
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};

/**
 * Dikirim ke EMAIL BARU — konfirmasi bahwa email ini sekarang aktif.
 * @param {{ name: string, changedAt: string }} params
 */
export const emailChangeNewTemplate = ({ name }) => {
  const changedAt = formatDate();
  const year      = new Date().getFullYear();

  return {
    subject: 'Email Baru Anda Aktif — JO-MOCK',

    text: `Halo ${name},\n\nEmail ini sekarang terdaftar sebagai email aktif akun JO-MOCK Anda sejak ${changedAt} WIB. Gunakan email ini untuk login dan menerima notifikasi selanjutnya.\n\n— Tim JO-MOCK`,

    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Baru Aktif — JO-MOCK</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F3FB;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F3FB;padding:48px 20px;">
    <tr>
      <td align="center">
        ${baseHeader}

        <!-- SUCCESS BADGE -->
        <tr>
          <td style="background-color:#FFFFFF;padding:32px 40px 0;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#ECFDF3;border:1px solid #ABEFC6;border-radius:100px;padding:6px 16px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#17B26A;letter-spacing:0.5px;text-transform:uppercase;">
                    &#10003;&nbsp; Email Aktif
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

            <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">Email baru Anda sekarang aktif</h1>

            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
              Halo, <strong style="color:#1A1726;">${name}</strong>!
            </p>
            <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
              Email ini berhasil didaftarkan sebagai alamat email aktif akun JO-MOCK Anda. Mulai sekarang, gunakan email ini untuk login dan notifikasi.
            </p>

            <!-- DETAIL -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #E5E1EF;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:14px 20px;background-color:#FAFAFA;border-bottom:1px solid #E5E1EF;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Detail Perubahan</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 20px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;width:110px;padding-bottom:10px;vertical-align:top;">Aksi</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">Ganti Email</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;vertical-align:top;">Waktu Aktif</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${changedAt} WIB</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- INFO BOX -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
              <tr>
                <td style="background-color:#F4F3FB;border-left:3px solid #6C5CE7;border-radius:0 6px 6px 0;padding:14px 16px;">
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B5870;line-height:1.6;">
                    Gunakan email ini untuk login ke dashboard JO-MOCK. Semua notifikasi project berikutnya juga akan dikirim ke sini.
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

        ${baseFooter(year)}
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};
