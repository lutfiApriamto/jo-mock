/**
 * Notification email sent to the PM when an invitation is accepted and a new member joins.
 * @param {{
 *   pmName:       string,
 *   memberName:   string,
 *   memberEmail:  string,
 *   role:         'PM' | 'FE' | 'BE',
 *   projectName:  string,
 *   dashboardUrl: string,
 *   joinedAt:     string,
 * }} params
 */
export const memberJoinedTemplate = ({
  pmName,
  memberName,
  memberEmail,
  role,
  projectName,
  dashboardUrl,
  joinedAt,
}) => {
  const year = new Date().getFullYear();

  const roleLabels = { PM: 'Project Manager', FE: 'Frontend Developer', BE: 'Backend Developer' };
  const roleLabel  = roleLabels[role] ?? role;

  return {
    subject: `New member joined "${projectName}"`,

    text: `Hello ${pmName},\n\n${memberName} (${memberEmail}) has accepted the invitation and joined the project "${projectName}" as ${roleLabel}.\n\nJoined at: ${joinedAt} UTC\n\nView the members list on your dashboard:\n${dashboardUrl}\n\n— The JO-MOCK Team`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Member Joined — ${projectName}</title>
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
                      &#10003;&nbsp; New Member Joined
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

              <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">A new member has joined your project</h1>

              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Hello, <strong style="color:#1A1726;">${pmName}</strong>!
              </p>
              <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                <strong style="color:#1A1726;">${memberName}</strong> has accepted the invitation and officially joined the project
                <strong style="color:#1A1726;">${projectName}</strong>.
              </p>

              <!-- DETAIL TABLE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #E5E1EF;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;background-color:#FAFAFA;border-bottom:1px solid #E5E1EF;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">New Member Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;width:120px;padding-bottom:10px;vertical-align:top;">Name</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">${memberName}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">Email</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;padding-bottom:10px;">${memberEmail}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">Role</td>
                        <td style="padding-bottom:10px;">
                          <span style="display:inline-block;background-color:#EDE9FE;color:#6C5CE7;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:2px 10px;border-radius:100px;">${role}</span>
                          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8B889C;margin-left:6px;">${roleLabel}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;vertical-align:top;">Joined</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${joinedAt} UTC</td>
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
                      View Members
                    </a>
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
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8B889C;text-align:center;">
                Button not working? Copy the link below into your browser:
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
