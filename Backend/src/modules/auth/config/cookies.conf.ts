import { CookieOptions } from "express";
import { REFRESH_TOKEN_PATH } from "../constants/auth.constant.js";
import ms, { StringValue } from "ms";

const REFRESH_TOKEN_EXPIRES_IN = ms ((process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d") as StringValue);
const isProduction = process.env.NODE_ENV === "production";

export const refreshCookieOptions: CookieOptions  = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: REFRESH_TOKEN_PATH,
  maxAge: REFRESH_TOKEN_EXPIRES_IN,
}
