/**
 * Notification email sent only to the CR submitter when their CR is declined.
 * @param {{
 *   submitterName: string,
 *   pmName:        string,
 *   projectName:   string,
 *   description:   string,
 *   reason:        string | null,
 *   dashboardUrl:  string,
 * }} params
 */
export const crRejectedTemplate = ({
  submitterName,
  pmName,
  projectName,
  description,
  reason,
  dashboardUrl,
}) => {
  const rejectedAt = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    day:      '2-digit',
    month:    'long',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    hour12:   true,
  });

  const year = new Date().getFullYear();

  const reasonBlock = reason
    ? `
              <!-- REJECTION REASON -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#FFF9F9;border-left:3px solid #F04438;border-radius:0 6px 6px 0;padding:14px 18px;">
                    <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Reason for Rejection</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;line-height:1.6;">${reason}</p>
                  </td>
                </tr>
              </table>`
    : '';

  const reasonText = reason ? `\nReason: ${reason}` : '';

  return {
    subject: `Change Request Declined — ${projectName}`,

    text: `Hello ${submitterName},\n\nYour Change Request for the project "${projectName}" was not approved by the PM.\n\nCR Summary: ${description}${reasonText}\n\nDeclined by: ${pmName}\nTime: ${rejectedAt} UTC\n\nYou can submit a new CR with a more detailed description via the dashboard:\n${dashboardUrl}\n\n— The JO-MOCK Team`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Change Request Declined — ${projectName}</title>
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
                  <td style="background-color:#FFF1F2;border:1px solid #FECDD3;border-radius:100px;padding:6px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:#E11D48;letter-spacing:0.5px;text-transform:uppercase;">
                      &#10007;&nbsp; CR Declined
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background-color:#FFFFFF;padding:20px 40px 40px;border-left:1px solid #E5E1EF;border-right:1px solid #E5E1EF;">

              <h1 style="margin:0 0 16px;font-family:'Trebuchet MS',Georgia,serif;font-size:22px;font-weight:700;color:#1A1726;line-height:1.3;">Your Change Request was not approved</h1>

              <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                Hello, <strong style="color:#1A1726;">${submitterName}</strong>!
              </p>
              <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#5B5870;">
                After review by the PM, the Change Request you submitted for the project <strong style="color:#1A1726;">${projectName}</strong> could not be approved at this time.
              </p>

              <!-- CR SUMMARY -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#F4F3FB;border-left:3px solid #6C5CE7;border-radius:0 6px 6px 0;padding:14px 18px;">
                    <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Your CR Description</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;line-height:1.6;">${description}</p>
                  </td>
                </tr>
              </table>

              ${reasonBlock}

              <!-- REVIEW DETAILS -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid #E5E1EF;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 20px;background-color:#FAFAFA;border-bottom:1px solid #E5E1EF;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:#8B889C;letter-spacing:0.8px;text-transform:uppercase;">Review Details</p>
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
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">Reviewed by</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;padding-bottom:10px;">${pmName}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;padding-bottom:10px;vertical-align:top;">Status</td>
                        <td style="padding-bottom:10px;">
                          <span style="display:inline-block;background-color:#FFF1F2;border:1px solid #FECDD3;color:#E11D48;font-family:Arial,sans-serif;font-size:11px;font-weight:700;padding:2px 10px;border-radius:100px;">Declined</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#8B889C;vertical-align:top;">Time</td>
                        <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1A1726;font-weight:600;">${rejectedAt} UTC</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- NEXT STEPS -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#FFFBEB;border-left:3px solid #F59E0B;border-radius:0 6px 6px 0;padding:14px 16px;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#5B5870;line-height:1.6;">
                      <strong style="color:#1A1726;">Next steps</strong><br>
                      Discuss the changes with your PM, then submit a new CR with a more detailed description via the dashboard.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#6C5CE7;border-radius:8px;">
                    <a href="${dashboardUrl}" target="_blank"
                       style="display:inline-block;padding:14px 36px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.2px;">
                      Open Dashboard
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
