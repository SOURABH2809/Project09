import { get } from "node:http";
import { EmailTemplate, EmailTemplateType } from "../../../shared/types/email.js";
import { graphClient } from "../config/graph.js";
import { getCustomerAskForChangesTemplate } from "../templates/customerAskForChanges.template.js";
import { getCustomerWithdrawalTemplate } from "../templates/customerWithdrawalTemplateData.js";
import { getNewCustomerSubmissionTemplate } from "../templates/newCustomerSubmissionTemplateData.js";
import { getWelcomeNewCustomerUserTemplate } from "../templates/getWelcomeNewCustomerUserTemplate.js";
import { getPasswordResetTemplate } from "../templates/passwordReset.template.js";
import { getWelcomeNewUserTemplate } from "../templates/welcomeNewUser.template.js";
import { getCustomerApprovedTemplate } from "../templates/getCustomerApprovedTemplate.js";
import { getCustomerSuperAdminAssignedTemplate } from "../templates/getCustomerSuperAdminAssignedTemplate.js";
import { getCustomerUserAssignedTemplate } from "../templates/getCustomerUserAssignedTemplate.js";
import { getWelcomeNewSupplierUserTemplate } from "../templates/getWelcomeNewSupplierUserTemplate.js";
import { getCoverageAnalysisCompletedTemplate } from "../templates/coverageAnalysisCompleted.template.js";
import { getSupplierDocumentSignedTemplate } from "../templates/supplierDocumentSigned.template.js";
import { getCustomerSignatureRequestTemplate } from "../templates/customerSignatureRequest.template.js";

const templates: EmailTemplate = {
  WELCOME_NEW_USER_TEMPLATE: getWelcomeNewUserTemplate,
  PASSWORD_RESET_TEMPLATE: getPasswordResetTemplate,
  CUSTOMER_CHANGES_REQUIRED_TEMPLATE: getCustomerAskForChangesTemplate,
  NEW_CUSTOMER_SUBMISSION_TEMPLATE: getNewCustomerSubmissionTemplate,
  CUSTOMER_WITHDRAWAL_TEMPLATE: getCustomerWithdrawalTemplate,
  CUSTOMER_APPROVED_TEMPLATE: getCustomerApprovedTemplate,
  CUSTOMER_SUPER_ADMIN_ASSIGNED_TEMPLATE: getCustomerSuperAdminAssignedTemplate,
  CUSTOMER_USER_ASSIGNED_TEMPLATE: getCustomerUserAssignedTemplate,
  WELCOME_NEW_CUSTOMER_USER_TEMPLATE: getWelcomeNewCustomerUserTemplate,
  WELCOME_NEW_SUPPLIER_USER_TEMPLATE: getWelcomeNewSupplierUserTemplate,
  COVERAGE_ANALYSIS_COMPLETED_TEMPLATE: getCoverageAnalysisCompletedTemplate,
  SUPPLIER_DOCUMENT_SIGNED_TEMPLATE: getSupplierDocumentSignedTemplate,
  CUSTOMER_SIGNATURE_REQUEST_TEMPLATE: getCustomerSignatureRequestTemplate,
};

export const sendEmail = async ({
  to,
  subject,
  data,
  templateType,
}: {
  to: string;
  subject: string;
  data: unknown;
  templateType: EmailTemplateType;
}) => {
  const client = graphClient();

  const html = templates[templateType](data);
  const email = {
    message: {
      subject,
      body: {
        contentType: "Html",
        content: html,
      },
      toRecipients: [
        {
          emailAddress: {
            address: to,
          },
        },
      ],
    },
    saveToSentItems: "false",
  };

  const senderEmail = process.env.SENDER_EMAIL;
  if (!senderEmail) {
    throw new Error("SENDER_EMAIL is not configured.");
  }

  await client.api(`/users/${senderEmail}/sendMail`).post(email);

  return {
    status: "success",
    message: "Email sent successfully",
  };
};
