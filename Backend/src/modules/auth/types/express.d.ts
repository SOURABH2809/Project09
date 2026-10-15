import { JwtPayload } from "jsonwebtoken";
import { ImpersonationData } from "./auth.types.ts";

interface TenantContext {
  customerId: string;
  roleScope: string;
  isCustomerAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & {
        userId: string;
        sid?: string;
        activeCustomerId?: string;
      };
      actor?: {
        id?: string;
        type?: string;
      };
      isImpersonating?: boolean;
      impersonationData?: ImpersonationData | null;
    }
  }
}

export {};
