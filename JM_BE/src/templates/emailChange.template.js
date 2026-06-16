const formatDate = () =>
  new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    day:      '2-digit',
    month:    'long',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   true,
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
 * Sent to the OLD email — notifies that the account email has been changed.
 * @param {{ name: string, newEmail: string }} params
 */
export const emailChangeOldTemplate = ({ name, newEmail }) => {
  const changedAt = formatDate();
  const year      = new Date().getFullYear();

  return {
    subject: 'Security Alert: Your Account Email Has Been Changed',

    text: `Hello ${name},\n\nYour JO-MOCK account email has been successfully changed to ${newEmail} on ${changedAt} UTC.\n\nIf you didn't make this change, immediately use the "Forgot Password" feature or contact the JO-MOCK team.\n\n— The JO-MOCK Team`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert: Account Email Changed</title>
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
                    &#9888;&nbsp; Security Alert
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

            <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">Your account email has been changed</h1>

            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
              Hello, <strong style="color:#1A1726;">${name}</strong>!
            </p>
            <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
              Your JO-MOCK account email has just been successfully updated. The new email will be used for login and future notifications.
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
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">Email Change</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">New Email</td>
                      <td style="font-family:'Courier New',Courier,monospace;font-size:13px;color:#6C5CE7;font-weight:600;padding-bottom:10px;">${newEmail}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;vertical-align:top;">Time</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${changedAt} UTC</td>
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
                    <strong style="color:#1A1726;">Wasn't you?</strong><br>
                    If you didn't change your email, your account may have been accessed by someone else. Immediately use the <strong>Forgot Password</strong> feature to reclaim your account and secure your data.
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

        ${baseFooter(year)}
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};

/**
 * Sent to the NEW email — confirms that this email is now active.
 * @param {{ name: string }} params
 */
export const emailChangeNewTemplate = ({ name }) => {
  const changedAt = formatDate();
  const year      = new Date().getFullYear();

  return {
    subject: 'Your New Email Is Now Active',

    text: `Hello ${name},\n\nThis email is now registered as the active email address for your JO-MOCK account as of ${changedAt} UTC. Use this email to log in and receive future notifications.\n\n— The JO-MOCK Team`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your New Email Is Now Active</title>
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
                    &#10003;&nbsp; Email Active
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

            <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">Your new email is now active</h1>

            <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
              Hello, <strong style="color:#1A1726;">${name}</strong>!
            </p>
            <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
              This email has been successfully registered as the active email address for your JO-MOCK account. From now on, use this email to log in and receive notifications.
            </p>

            <!-- DETAIL -->
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
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">Email Change</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;vertical-align:top;">Activated At</td>
                      <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${changedAt} UTC</td>
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
                    Use this email to log in to your JO-MOCK dashboard. All future project notifications will also be sent here.
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

        ${baseFooter(year)}
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};
