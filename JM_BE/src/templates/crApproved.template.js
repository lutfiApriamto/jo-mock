/**
 * Template email notifikasi CR disetujui — dikirim ke seluruh member project.
 * @param {{
 *   memberName:     string,
 *   approverName:   string,
 *   submitterName:  string,
 *   projectName:    string,
 *   projectVersion: number,
 *   description:    string,
 *   changedAt:      string,
 *   dashboardUrl:   string,
 * }} params
 */
export const crApprovedTemplate = ({
  memberName,
  approverName,
  submitterName,
  projectName,
  projectVersion,
  description,
  changedAt,
  dashboardUrl,
}) => {
  const year = new Date().getFullYear();

  return {
    subject: `CR Disetujui — ${projectName} (v${projectVersion})`,

    text: `Halo ${memberName},\n\nChange Request dari ${submitterName} pada project "${projectName}" telah disetujui oleh ${approverName}.\n\nDeskripsi: ${description}\n\nVersi baru: v${projectVersion}\nDisetujui pada: ${changedAt} WIB\n\nPM akan segera menerapkan perubahan ini. Pantau dashboard untuk melihat pembaruan terbaru:\n${dashboardUrl}\n\n— Tim JO-MOCK`,

    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CR Disetujui — ${projectName}</title>
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

          <!-- BADGE -->
          <tr>
            <td style="background-color:#FFFFFF;padding:28px 40px 0;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#ECFDF3;border:1px solid #ABEFC6;border-radius:100px;padding:6px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#17B26A;letter-spacing:0.5px;text-transform:uppercase;">
                      &#10003;&nbsp; CR Disetujui
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

              <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">Change Request disetujui — kontrak akan diperbarui</h1>

              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Halo, <strong style="color:#1A1726;">${memberName}</strong>!
              </p>
              <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Change Request yang diajukan oleh <strong style="color:#1A1726;">${submitterName}</strong> pada project
                <strong style="color:#1A1726;">${projectName}</strong> telah disetujui. PM akan segera menerapkan perubahan ini secara langsung.
              </p>

              <!-- DESKRIPSI CR -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#F4F3FB;border-left:3px solid #6C5CE7;border-radius:0 6px 6px 0;padding:14px 18px;">
                    <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Deskripsi CR yang Disetujui</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;line-height:1.6;">${description}</p>
                  </td>
                </tr>
              </table>

              <!-- DETAIL -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #E5E1EF;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;background-color:#FAFAFA;border-bottom:1px solid #E5E1EF;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Detail Persetujuan</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;width:130px;padding-bottom:10px;vertical-align:top;">Project</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">${projectName}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">Versi Baru</td>
                        <td style="padding-bottom:10px;">
                          <span style="display:inline-block;background-color:#6C5CE7;color:#FFFFFF;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:2px 10px;border-radius:100px;">v${projectVersion}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">Diajukan oleh</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">${submitterName}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">Disetujui oleh</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">${approverName}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;vertical-align:top;">Waktu</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${changedAt} WIB</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#6C5CE7;border-radius:8px;">
                    <a href="${dashboardUrl}" target="_blank"
                       style="display:inline-block;padding:14px 36px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.2px;">
                      Lihat di Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#FFFBEB;border-left:3px solid #F59E0B;border-radius:0 6px 6px 0;padding:12px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B5870;line-height:1.6;">
                      <strong style="color:#1A1726;">Catatan:</strong> PM akan menerapkan perubahan kontrak ini secara manual. Pantau dashboard untuk melihat pembaruan endpoint dan response terbaru.
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
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8B889C;text-align:center;">
                Tombol tidak berfungsi? Salin link berikut ke browser Anda:
              </p>
              <p style="margin:0 0 16px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#6C5CE7;text-align:center;word-break:break-all;">
                ${dashboardUrl}
              </p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#8B889C;text-align:center;">
                &copy; ${year} JO-MOCK &middot; Joint Operations Mock
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
