/**
 * Notification email sent when a user changes their password via account settings.
 * Distinct from resetPassword.template.js which is used for the forgot-password flow.
 * @param {{ name: string }} params
 */
export const passwordChangeTemplate = ({ name }) => {
  const changedAt = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    day:      '2-digit',
    month:    'long',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   true,
  });

  const year = new Date().getFullYear();

  return {
    subject: 'Your Password Has Been Changed',

    text: `Hello ${name},\n\nYour JO-MOCK account password was successfully changed via account settings on ${changedAt} UTC.\n\nAll active sessions on other devices have been signed out. Please log in again using your new password.\n\nIf you didn't make this change, immediately use the "Forgot Password" feature to secure your account.\n\n— The JO-MOCK Team`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Password Has Been Changed</title>
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
                      &#10003;&nbsp; Success
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

              <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">Your password has been changed</h1>

              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Hello, <strong style="color:#1A1726;">${name}</strong>!
              </p>
              <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Your JO-MOCK account password has been successfully updated via account settings. Use your new password to log in on all devices.
              </p>

              <!-- CHANGE DETAILS -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #E5E1EF;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;background-color:#FAFAFA;border-bottom:1px solid #E5E1EF;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Change Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;width:110px;padding-bottom:10px;vertical-align:top;">Action</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">Password Change</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;vertical-align:top;">Time</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${changedAt} UTC</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- SESSION INFO -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                <tr>
                  <td style="background-color:#F4F3FB;border-left:3px solid #6C5CE7;border-radius:0 6px 6px 0;padding:14px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B5870;line-height:1.6;">
                      <strong style="color:#1A1726;">Other sessions have been signed out.</strong><br>
                      For your security, all active sessions on other devices have been automatically signed out. Please log in again using your new password.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- SECURITY WARNING -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#FFF9F9;border-left:3px solid #F04438;border-radius:0 6px 6px 0;padding:14px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B5870;line-height:1.6;">
                      <strong style="color:#1A1726;">Wasn't you?</strong><br>
                      If you didn't change your password, your account may be at risk. Immediately use the <strong>Forgot Password</strong> feature to regain control of your account.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5B5870;">
                Best,<br>
                <strong style="color:#1A1726;">The JO-MOCK Team</strong>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#FAFAFA;border:1px solid #E5E1EF;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;">
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
