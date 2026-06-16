/**
 * Invitation email sent to the invited user.
 * @param {{
 *   inviteeName:  string,
 *   inviterName:  string,
 *   projectName:  string,
 *   role:         'PM' | 'FE' | 'BE',
 *   acceptUrl:    string,
 *   declineUrl:   string,
 *   expiresAt:    string,
 * }} params
 */
export const projectInvitationTemplate = ({
  inviteeName,
  inviterName,
  projectName,
  role,
  acceptUrl,
  declineUrl,
  expiresAt,
}) => {
  const year = new Date().getFullYear();

  const roleLabels = { PM: 'Project Manager', FE: 'Frontend Developer', BE: 'Backend Developer' };
  const roleLabel  = roleLabels[role] ?? role;

  return {
    subject: `Project Invitation — "${projectName}"`,

    text: `Hello ${inviteeName},\n\n${inviterName} has invited you to join the project "${projectName}" as ${roleLabel}.\n\nAccept invitation: ${acceptUrl}\nDecline invitation: ${declineUrl}\n\nThis invitation expires on ${expiresAt}.\n\nIf you don't recognize the sender or didn't expect this email, you can safely ignore it.\n\n— The JO-MOCK Team`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Invitation — ${projectName}</title>
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
                  <td style="background-color:#EDE9FE;border:1px solid #C4B5FD;border-radius:100px;padding:6px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#6C5CE7;letter-spacing:0.5px;text-transform:uppercase;">
                      &#128231;&nbsp; Project Invitation
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

              <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">You've been invited to join a project</h1>

              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Hello, <strong style="color:#1A1726;">${inviteeName}</strong>!
              </p>
              <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                <strong style="color:#1A1726;">${inviterName}</strong> has invited you to join the project
                <strong style="color:#1A1726;">${projectName}</strong> with the following role:
              </p>

              <!-- ROLE BADGE -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#EDE9FE;border:1px solid #C4B5FD;border-radius:8px;padding:12px 20px;">
                    <p style="margin:0 0 2px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B80CC;letter-spacing:0.8px;text-transform:uppercase;">Offered Role</p>
                    <p style="margin:0;font-family:'Trebuchet MS',Arial,sans-serif;font-size:16px;font-weight:700;color:#6C5CE7;">
                      ${role} &mdash; <span style="font-weight:400;">${roleLabel}</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- DETAIL TABLE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #E5E1EF;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;background-color:#FAFAFA;border-bottom:1px solid #E5E1EF;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Invitation Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;width:120px;padding-bottom:10px;vertical-align:top;">Project</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">${projectName}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">Invited by</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">${inviterName}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;vertical-align:top;">Expires on</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${expiresAt}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTONS -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
                <tr>
                  <td style="background-color:#6C5CE7;border-radius:8px;">
                    <a href="${acceptUrl}" target="_blank"
                       style="display:inline-block;padding:14px 36px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.2px;">
                      Accept Invitation
                    </a>
                  </td>
                  <td width="12"></td>
                  <td style="background-color:#FFFFFF;border:2px solid #E5E1EF;border-radius:8px;">
                    <a href="${declineUrl}" target="_blank"
                       style="display:inline-block;padding:12px 28px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:15px;font-weight:600;color:#5B5870;text-decoration:none;border-radius:6px;letter-spacing:0.2px;">
                      Decline
                    </a>
                  </td>
                </tr>
              </table>

              <!-- INFO NOTE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#FFFBEB;border-left:3px solid #F59E0B;border-radius:0 6px 6px 0;padding:12px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B5870;line-height:1.6;">
                      You need to <strong style="color:#1A1726;">sign in to your JO-MOCK account</strong> before you can accept or decline this invitation.
                      This invitation expires on <strong style="color:#1A1726;">${expiresAt}</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;line-height:1.6;">
                If you don't recognize the sender or believe you received this email by mistake, simply ignore it. No action is required.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#FAFAFA;border:1px solid #E5E1EF;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;">
              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8B889C;text-align:center;">
                Button not working? Copy the accept link below into your browser:
              </p>
              <p style="margin:0 0 16px;font-family:'Courier New',Courier,monospace;font-size:11px;color:#6C5CE7;text-align:center;word-break:break-all;">
                ${acceptUrl}
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
