import { Prisma } from "../database/generated/prisma/client.js";

export type AuditState = Prisma.InputJsonValue | null | undefined;

export type CustomerActivityLogInput = {
  customerId: string;
  actorUserId: string;
  actorUserName?: string;
  actionType: string;
  resourceType: string;
  resourceId?: string | null;
  resourceName?: string | null;
  beforeState?: AuditState;
  afterState?: AuditState;
  status?: "SUCCESS" | "FAILED";
};

export type CustomerContextSwitchLogInput = {
  userId: string;
  fromCustomerId?: string | null;
  toCustomerId: string;
  status?: "SUCCESS" | "FAILED";
  previousContextDurationMs?: number | null;
};
