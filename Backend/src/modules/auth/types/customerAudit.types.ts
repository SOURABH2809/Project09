import { CustomerAuditStatus } from "../database/generated/prisma/enums.js";
import { Prisma } from "../database/generated/prisma/client.js";

export type AuditQuery = {
  page?: number;
  limit?: number;
  customerName?: string;
  actorUserName?: string;
  actorUserEmail?: string;
  actionType?: string;
  resourceType?: string;
  status?: CustomerAuditStatus;
  from?: string;
  to?: string;
};

export type ContextSwitchQuery = {
  page?: number;
  limit?: number;
  userName?: string;
  userEmail?: string;
  fromCustomerName?: string;
  toCustomerName?: string;
  status?: CustomerAuditStatus;
  from?: string;
  to?: string;
};

export type ActivityLogRecord = Prisma.CustomerActivityLogGetPayload<{
  include: {
    actorUser: {
      select: {
        id: true;
        email: true;
        userType: true;
      };
    };
  };
}>;

export type ContextSwitchLogRecord = Prisma.CustomerContextSwitchLogGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
        userType: true;
      };
    };
  };
}>;
