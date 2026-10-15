import { VOIPED_LOGO_URL } from "../constants/logo.constant.js";

export interface CustomerApprovedTemplateData {
  recipientName: string;
  customerName: string;
  dashboardUrl?: string;
}

export const getCustomerApprovedTemplate = (data: CustomerApprovedTemplateData) => {
  const { recipientName, customerName, dashboardUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Customer Approved</title>
</head>

<body style="margin:0; padding:0; background-color:#f5f7fa; font-family: Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:40px 0;">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">

<!-- Logo -->
<tr>
<td style="padding:24px; text-align:center;">
<img src="${VOIPED_LOGO_URL}" alt="Voiped Logo" width="140"/>
</td>
</tr>

<!-- Header -->
<tr>
<td style="background:#28a745; padding:20px; text-align:center;">
<h1 style="color:#ffffff; margin:0; font-size:24px;">
Customer Approved
</h1>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:30px; color:#333333;">

<p style="font-size:16px; margin:0 0 16px;">
Hi <strong>${recipientName}</strong>,
</p>

<p style="font-size:16px; margin:0 0 16px;">
Good news! The customer you submitted, <strong>${customerName}</strong>, has been successfully approved by the finance team.
</p>

<p style="font-size:16px; margin:0 0 16px;">
You can now proceed with the next steps in the onboarding process.
</p>

${
  dashboardUrl
    ? `
<table cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
<tr>
<td align="center">
<a href="${dashboardUrl}"
style="display:inline-block; background:#28a745; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-size:16px;">
View Customer
</a>
</td>
</tr>
</table>
`
    : ""
}

<p style="font-size:16px; margin:24px 0 0;">
Regards,<br/>
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
