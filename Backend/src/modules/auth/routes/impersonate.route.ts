import express from "express";
import { validateResource } from "../middlewares/validateResource.js";
import { ImpersonatePermission } from "../utils/permissions/auth.permission.js";
import { validateAuthorization } from "../middlewares/validateAuthorization.js";
import {
  impersonateLoginController,
  exitImpersonationController,
} from "../controllers/impersonate.controller.js";
import { impersonateLoginSchema, exitImpersonationSchema } from "../validations/auth.schema.js";
import { validateAuthentication } from "../middlewares/validateAuthentication.js";

const router = express.Router();

// Login as user by impersonating them (admin only)
router.post(
  "/login",
  validateAuthentication,
  validateResource(impersonateLoginSchema),
  validateAuthorization([ImpersonatePermission.Login]),
  impersonateLoginController,
);

// Exit impersonation and return to admin session
router.post(
  "/exit",
  validateAuthentication,
  validateResource(exitImpersonationSchema),
  exitImpersonationController,
);

export default router;
