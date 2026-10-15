export interface JwtPayload {
  userId: string;
  role?: string;
  redisBound?: boolean;
  sid?: string;
  email?: string;
  iat?: number;
  exp?: number;
  passwordChangedAt?: number;
  passwordResetRequired?: boolean;
  activeCustomerId?: string;
  actor?: {
    id: string;
    email: string;
    type: "Admin";
  };
  impersonation?: {
    active: boolean;
    sessionId: string;
  };
  byPassTFA?: boolean;
  byPassPasswordReset?: boolean;
}
