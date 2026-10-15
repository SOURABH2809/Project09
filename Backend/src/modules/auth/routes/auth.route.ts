import express from "express";
import {
  signinController,
  signupController,
  refreshTokenController,
  logoutController,
  getUserDetailsController,
  checkExistingAccountController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
} from "../controllers/index.js";
import { validateResource } from "../middlewares/validateResource.js";
import {
  signinSchema,
  signupSchema,
  forgotPasswordSchema,
  checkExistingAccountSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validations/auth.schema.js";
import { validateAuthentication } from "../middlewares/validateAuthentication.js";

const router = express.Router();

// Public customer registration
router.post("/signup", validateResource(signupSchema), signupController);

// Signin user
router.post("/signin", validateResource(signinSchema), signinController);

// Rotate access token
router.post("/refresh", refreshTokenController);

// Logout user, revoke refresh token, delete redis session
router.post("/logout", logoutController);

//  Protected Route to Get User Details
router.get("/me", validateAuthentication, getUserDetailsController);

// Check whether an email already belongs to an internal or customer account
router.post(
  "/check-existing-account",
  validateAuthentication,
  validateResource(checkExistingAccountSchema),
  checkExistingAccountController,
);

// Send password reset link email
router.post("/forgot-password", validateResource(forgotPasswordSchema), forgotPasswordController);

// Reset Password
router.post("/reset-password", validateResource(resetPasswordSchema), resetPasswordController);

// Change Password (Requires Authentication)
router.put(
  "/change-password",
  validateAuthentication,
  validateResource(changePasswordSchema),
  changePasswordController,
);

export default router;
