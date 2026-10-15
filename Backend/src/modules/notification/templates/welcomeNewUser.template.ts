import { VOIPED_LOGO_URL } from "../constants/logo.constant.js";

export const getWelcomeNewUserTemplate = ({
  name,
  resetPasswordPageUrl,
}: {
  name: string;
  resetPasswordPageUrl: string;
}) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Our Platform</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f5f7fa; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

            <!-- Logo -->
            <tr>
              <td style="padding:24px; text-align:center;">
                <img
                  src=${VOIPED_LOGO_URL}
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
                  Welcome, ${name}!
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
                  Your account has been successfully created. To get started, please set your password by clicking the link below.
                </p>

                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${resetPasswordPageUrl}"
                        style="color:#F7323F; text-decoration:underline; font-size:16px;"
                      >
                        Set your password
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-size:16px; margin:0;">
                  If you did not create this account, you can safely ignore this email.
                </p>

                <p style="font-size:16px; margin:24px 0 0;">
                  Regards,<br />
                  <strong>The Team</strong>
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
