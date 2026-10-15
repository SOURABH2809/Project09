import { NextFunction, Request, Response } from "express";
import {
  signinService,
  signupService,
  refreshTokenService,
  logoutService,
  getUserDetailsService,
  checkExistingAccountByEmailService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService,
  getUserDetailsForImpersonation,
} from "../services/index.js";
import { REFRESH_TOKEN_COOKIE_KEY } from "../constants/auth.constant.js";
import { refreshCookieOptions } from "../config/cookies.conf.js";
import { successResponse } from "../utils/request-handling/response.utils.js";

export const signupController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await signupService(req.body);

    return res.status(201).json(successResponse("User created successfully."));
  } catch (err) {
    next(err);
  }
};

export const signinController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await signinService(req.body);

    // Trusted device path: issue refresh cookie and return access token + user payload
    const { refreshToken, accessToken, data } = result as unknown as {
      refreshToken: string;
      accessToken: string;
      data: unknown;
    };

    res.cookie(REFRESH_TOKEN_COOKIE_KEY, refreshToken, refreshCookieOptions);

    return res.status(200).json({
      ...successResponse("User logged in successfully", data),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token controller
export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await refreshTokenService(req?.cookies?.refreshToken);

    res.cookie(REFRESH_TOKEN_COOKIE_KEY, result.refreshToken, refreshCookieOptions);

    return res.json(successResponse("Token Refreshed.", result.data));
  } catch (err) {
    next(err);
  }
};

export const getUserDetailsController = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.userId;
  const activeCustomerId = req.user.activeCustomerId;
  const isImpersonating = req.isImpersonating;
  const impersonationData = req.impersonationData;

  try {
    let result = null;
    if (isImpersonating && impersonationData) {
      result = await getUserDetailsForImpersonation(
        activeCustomerId,
        isImpersonating,
        impersonationData,
      );
    } else {
      result = await getUserDetailsService(userId, activeCustomerId);
    }

    return res.status(200).json(
      successResponse("User details retrieved successfully", {
        user: result,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await logoutService(refreshToken);
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE_KEY, refreshCookieOptions);

    return res.status(200).json(successResponse("Logged out successfully"));
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await forgotPasswordService(req.body.email);
    return res.json(successResponse("If the email exists, a reset token has been generated"));
  } catch (err) {
    next(err);
  }
};

export const checkExistingAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await checkExistingAccountByEmailService(req.body.email);

    return res.status(200).json(
      successResponse("Existing account check completed successfully", {
        account: result,
      }),
    );
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    await resetPasswordService(token, password);
    return res.json(successResponse("Password reset successfully"));
  } catch (err) {
    next(err);
  }
};

export const changePasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    await changePasswordService(userId, oldPassword, newPassword);

    return res.status(200).json(successResponse("Password changed successfully"));
  } catch (err) {
    next(err);
  }
};
