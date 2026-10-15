import crypto from "crypto";
import { HASHING_ALGORITHM, HASHING_ENCODING } from "../../constants/auth.constant.js";

export interface AccessTokenPayload {
  userId: string;
  email: string;
  passwordChangedAt: number;
  passwordResetRequired: boolean;
  sid: string;
  redisBound: boolean;
  activeCustomerId?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  sid: string;
  redisBound: boolean;
  activeCustomerId?: string;
}

/**
 * Generate a random secure token
 */
export const generateToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString(HASHING_ENCODING);
};

/**
 * Hash a token using SHA-256
 */
export const hashToken = (token: string): string => {
  return crypto.createHash(HASHING_ALGORITHM).update(token).digest(HASHING_ENCODING);
};

/**
 * Generate and hash a token
 */
export const generateHashedToken = (bytes: number = 32) => {
  const token = generateToken(bytes);
  const tokenHash = hashToken(token);
  return { token, tokenHash };
};

export const getAccessTokenPayload: (payload: AccessTokenPayload) => AccessTokenPayload = ({
  userId,
  email,
  passwordChangedAt,
  passwordResetRequired,
  sid,
  redisBound,
  activeCustomerId,
}) => {
  return {
    userId,
    email,
    passwordChangedAt,
    passwordResetRequired,
    sid,
    redisBound,
    activeCustomerId,
  };
};

export const getRefreshTokenPayload: (payload: RefreshTokenPayload) => RefreshTokenPayload = ({
  userId,
  sid,
  redisBound,
}) => {
  return {
    userId,
    sid,
    redisBound,
  };
};
