import { VOIPED_LOGO_URL } from "../constants/logo.constant.js";

export const getCustomerSuperAdminAssignedTemplate = ({
  name,
  customerName,
}: {
  name: string;
  customerName: string;
}) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Customer Super Admin Assigned</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f7fa; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 0;">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            <tr>
              <td style="padding:24px; text-align:center;">
                <img src="${VOIPED_LOGO_URL}" alt="Voiped Logo" width="140" />
              </td>
            </tr>
            <tr>
              <td style="background:#F7323F; padding:20px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">Super Admin Access Granted</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px; color:#333333;">
                <p style="font-size:16px; margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
                <p style="font-size:16px; margin:0 0 16px;">
                  You are now the <strong>Super Admin</strong> of customer
                  <strong>${customerName}</strong> on the Voiped platform.
                </p>
                <p style="font-size:16px; margin:0 0 16px;">
                  You can use your existing account to access this customer in Voiped.
                </p>
                <p style="font-size:16px; margin:24px 0 0;">
                  Regards,<br />
                  <strong>The Voiped Team</strong>
                </p>
              </td>
            </tr>
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
