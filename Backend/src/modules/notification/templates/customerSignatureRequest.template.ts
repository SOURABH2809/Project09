export const getCustomerSignatureRequestTemplate = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #004a99;">Action Required: Sign Legal Documents</h2>
      <p>Hello ${data.customerName},</p>
      <p>Welcome to Voiped Telecom. To proceed with your account activation, we require you to sign the following mandatory legal agreements:</p>
      
      <div style="margin: 20px 0;">
        <p><strong>1. Non-Disclosure Agreement (NDA)</strong></p>
        <a href="${data.ndaUrl}" style="background-color: #004a99; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign NDA</a>
      </div>

      <div style="margin: 20px 0;">
        <p><strong>2. Master Service Agreement (MSA)</strong></p>
        <a href="${data.msaUrl}" style="background-color: #004a99; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Sign MSA</a>
      </div>

      <p>Note: Your account will remain in pending status until these documents are signed.</p>
      <br>
      <p>Best Regards,</p>
      <p><strong>Voiped Telecom Team</strong></p>
    </div>
  `;
};
