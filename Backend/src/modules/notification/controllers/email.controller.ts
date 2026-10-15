import { Request, Response } from "express";
import { sendEmail } from "../services/email.service.js";
import { EmailTemplateEnum } from "../../../shared/types/email.js";
import { successResponse } from "../utils/response-handling/response.utils.js";

export const testEmail = async (req: Request, res: Response) => {
  await sendEmail({
    to: "test@test.com",
    subject: "Welcome to TestApp",
    data: {
      name: "Test Name",
      resetPasswordPageUrl: "http://test-url",
    },
    templateType: EmailTemplateEnum.WELCOME_NEW_USER_TEMPLATE,
  });

  return res.json(successResponse("Test email sent"));
};
