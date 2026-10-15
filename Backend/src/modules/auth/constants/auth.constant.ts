import ms, { StringValue } from "ms";

// Refresh Token
export const REFRESH_TOKEN_PATH = "/";
export const REFRESH_TOKEN_COOKIE_KEY = "refreshToken";
export const REFRESH_TOKEN_EXPIRES_IN = ms(
  (process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d") as StringValue,
);
export const RESET_PASSWORD_TOKEN_EXPIRES_IN = ms(
  (process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN ?? "10m") as StringValue,
);

// Auto Logout
export const SESSION_TTL = Number(process.env.SESSION_TTL) || 86400; // 24 hours in seconds
export const LAST_USED_CONTEXT_TTL = Number(process.env.LAST_USED_CONTEXT_TTL) || 86400; // 24 hours in seconds

// Hasing
export const HASHING_ALGORITHM = "sha256";
export const HASHING_ENCODING = "hex";
