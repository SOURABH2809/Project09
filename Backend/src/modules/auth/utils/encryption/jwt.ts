import jwt, { SignOptions, JwtPayload as JwtLibPayload } from "jsonwebtoken";
import { StringValue } from "ms";
import { AppError } from "../errors/AppError.js";
import { JwtPayload } from "../../../../shared/types/auth.js";

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is required but not defined in environment variables");
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET is required but not defined in environment variables");
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN! as StringValue) || "15m";
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN! as StringValue) || "7d";
const IMPERSONATION_ACCESS_TOKEN_EXPIRES_IN =
  (process.env.REFRESH_TOKEN_EXPIRES_IN! as StringValue) || "30m";

export const signAccessToken = (payload: JwtPayload, expire?: StringValue) => {
  const options: SignOptions = {
    expiresIn: expire || ACCESS_TOKEN_EXPIRES_IN,
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
};

export const signRefreshToken = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtLibPayload | string;

  if (typeof decoded === "string") {
    throw new AppError("Invalid access token payload", 401);
  }

  return decoded as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtLibPayload | string;

  if (typeof decoded === "string") {
    throw new AppError("Invalid refresh token payload", 401);
  }

  return decoded as JwtPayload;
};

export const decodeJwtToken = (refreshToken: string): JwtPayload | null => {
  return jwt.decode(refreshToken) as JwtPayload | null;
};

export const generateImpersonationToken = ({
  userId,
  adminId,
  sessionId,
  email,
  adminEmail,
  byPassTFA,
  byPassPasswordReset,
  activeCustomerId,
}: {
  userId: string;
  adminId: string;
  sessionId: string;
  email: string;
  adminEmail: string;
  byPassTFA?: boolean;
  byPassPasswordReset?: boolean;
  activeCustomerId: string | null;
}) => {
  return signAccessToken(
    {
      userId,
      email,
      role: "user",
      actor: {
        id: adminId,
        email: adminEmail,
        type: "Admin",
      },
      impersonation: {
        active: true,
        sessionId,
      },
      byPassTFA: byPassTFA || false,
      byPassPasswordReset: byPassPasswordReset || false,
      activeCustomerId: activeCustomerId || undefined,
    },
    IMPERSONATION_ACCESS_TOKEN_EXPIRES_IN,
  ); // Impersonation tokens are short-lived
};
