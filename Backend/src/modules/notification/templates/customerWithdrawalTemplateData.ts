import { VOIPED_LOGO_URL } from "../constants/logo.constant.js";

export interface CustomerWithdrawalTemplateData {
  customerName: string;
  withdrawerEmail: string;
  dashboardUrl?: string;
}

export const getCustomerWithdrawalTemplate = (data: CustomerWithdrawalTemplateData) => {
  const { customerName, withdrawerEmail, dashboardUrl } = data;

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Customer Withdrawn</title>
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
                  src="${VOIPED_LOGO_URL}"
                  alt="Voiped Logo"
                  width="140"
                  style="display:block; margin:0 auto;"
                />
              </td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="background:#F7323F; padding:20px; text-align:center;">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">
                  Customer Withdrawn
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333333;">
                <p style="font-size:16px; margin:0 0 16px;">
                  Hello,
                </p>

                <p style="font-size:16px; margin:0 0 16px;">
                  The customer submission for <strong>${customerName}</strong> has been withdrawn and no further approval action is required.
                </p>

                <div style="background:#f9f9f9; border-left:4px solid #F7323F; padding:16px; margin:20px 0; font-size:15px;">
                  <p style="margin:0 0 8px;">
                    <strong>Customer Name:</strong> ${customerName}
                  </p>
                  <p style="margin:0;">
                    <strong>Withdrawn By:</strong> ${withdrawerEmail}
                  </p>
                </div>

                ${
                  dashboardUrl
                    ? `
                <table cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
                  <tr>
                    <td align="center">
                      <a
                        href="${dashboardUrl}"
                        style="display:inline-block; background:#F7323F; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-size:16px;"
                      >
                        View Customers
                      </a>
                    </td>
                  </tr>
                </table>
                `
                    : `
                <p style="font-size:16px; margin:0 0 16px;">
                  You may log in to the portal to view the current list of customers if needed.
                </p>
                `
                }

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
