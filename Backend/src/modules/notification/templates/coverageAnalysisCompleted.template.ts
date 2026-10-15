import { VOIPED_LOGO_URL } from "../constants/logo.constant.js";

export const getCoverageAnalysisCompletedTemplate = ({
  opportunityName,
  addressCount,
}: {
  opportunityName: string;
  addressCount: number;
}) => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Coverage Analysis Completed</title>
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
                  Coverage Analysis Completed
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333333;">
                <p style="font-size:16px; margin:0 0 16px;">
                  Hi,
                </p>

                <p style="font-size:16px; margin:0 0 16px;">
                  The coverage analysis for opportunity <strong>"${opportunityName}"</strong> has been completed successfully.
                </p>

                <p style="font-size:16px; margin:0 0 16px;">
                  <strong>Summary:</strong>
                </p>

                <ul style="font-size:16px; margin:0 0 16px;">
                  <li>Addresses analyzed: ${addressCount}</li>
                </ul>

                <p style="font-size:16px; margin:0 0 16px;">
                  You can now view the results in the application.
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
