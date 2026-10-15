export const getSupplierDocumentSignedTemplate = (data: any) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #004a99;">Signed Document Uploaded</h2>
      <p>Hello ${data.supplierName},</p>
      <p>This is to inform you that the signed <strong>${data.documentType}</strong> (${data.documentTitle}) has been successfully uploaded to our system.</p>
      <p>You can find the document attached or review it in our portal.</p>
      <br>
      <p>Best Regards,</p>
      <p><strong>Voiped Telecom Team</strong></p>
    </div>
  `;
};
