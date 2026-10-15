import { VOIPED_LOGO_URL } from "../constants/logo.constant.js";

export const getPasswordResetTemplate = ({
  name,
  resetPasswordUrl,
}: {
  name: string;
  resetPasswordUrl: string;
}) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f5f7fa; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

            <!-- Logo -->
            <tr>
              <td style="padding:24px; text-align:center;">
                <img
                  src="${VOIPED_LOGO_URL}"
                  alt="Customer Logo"
                  width="140"
                  style="display:block; margin:0 auto;"
                />
              </td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="background:#F7323F; padding:20px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">
                  Reset Your Password
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333333;">
                <p style="font-size:16px; margin:0 0 16px;">
                  Hi <strong>${name}</strong>,
                </p>

                <p style="font-size:16px; margin:0 0 16px;">
                  We received a request to reset your password. Click the button below to create a new password.
                </p>

                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="background-color:#F7323F; border-radius:6px; padding:12px 32px;">
                            <a 
                              href="${resetPasswordUrl}" 
                              target="_blank"
                              style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:bold; display:block;"
                            >
                              Reset Your Password
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Fallback Link -->
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;">
                  <tr>
                    <td style="font-size:14px; color:#666666; text-align:center;">
                      Or copy and paste this link into your browser:
                    </td>
                  </tr>
                 <tr>
  <td style="font-size:14px; color:#666666; text-align:center; word-break:break-all; padding:8px 20px;">
    <a href="${resetPasswordUrl}" style="color:#F7323F; text-decoration:underline;">Click here to reset your password</a>
  </td>
</tr>
                </table>

                <p style="font-size:16px; margin:16px 0;">
                  This link will expire in <strong>10 minutes</strong> for security reasons.
                </p>

                <p style="font-size:16px; margin:0;">
                  If you did not request a password reset, please ignore this email or contact support if you have concerns.
                </p>

                <p style="font-size:16px; margin:24px 0 0;">
                  Regards,<br />
                  <strong>The Voiped Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f0f0f0; padding:16px; text-align:center; font-size:12px; color:#777777;">
                © ${new Date().getFullYear()} Voiped. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
