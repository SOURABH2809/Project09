import prisma from "../config/prisma.client.js";
import {
  CustomerActivityLogInput,
  CustomerContextSwitchLogInput,
} from "../types/customerActivityLog.types.js";

export const CustomerActivityLogStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const;

export const CustomerActivityActionType = {
  CustomerUserCreated: "CUSTOMER_USER_CREATED",
  CustomerUserUpdated: "CUSTOMER_USER_UPDATED",
  CustomerUserDeleted: "CUSTOMER_USER_DELETED",
  CustomerUserPasswordReset: "CUSTOMER_USER_PASSWORD_RESET",
  CustomerUserPromoted: "CUSTOMER_USER_PROMOTED",
  CustomerUserDemoted: "CUSTOMER_USER_DEMOTED",
  CustomerUserRoleAssigned: "CUSTOMER_USER_ROLE_ASSIGNED",
  CustomerUserRoleRemoved: "CUSTOMER_USER_ROLE_REMOVED",
  CustomerGroupCreated: "CUSTOMER_GROUP_CREATED",
  CustomerGroupUpdated: "CUSTOMER_GROUP_UPDATED",
  CustomerGroupDeleted: "CUSTOMER_GROUP_DELETED",
  CustomerGroupUsersAssigned: "CUSTOMER_GROUP_USERS_ASSIGNED",
  CustomerGroupUsersRemoved: "CUSTOMER_GROUP_USERS_REMOVED",
  CustomerGroupRolesAssigned: "CUSTOMER_GROUP_ROLES_ASSIGNED",
  CustomerGroupRolesRemoved: "CUSTOMER_GROUP_ROLES_REMOVED",
  CustomerRoleCreated: "CUSTOMER_ROLE_CREATED",
  CustomerRoleUpdated: "CUSTOMER_ROLE_UPDATED",
  CustomerRoleDeleted: "CUSTOMER_ROLE_DELETED",
  CustomerRolePermissionsAdded: "CUSTOMER_ROLE_PERMISSIONS_ADDED",
  CustomerRolePermissionsRemoved: "CUSTOMER_ROLE_PERMISSIONS_REMOVED",
  CustomerLimitRequestCreated: "CUSTOMER_LIMIT_REQUEST_CREATED",
} as const;

export const CustomerActivityResourceType = {
  CustomerUser: "CUSTOMER_USER",
  CustomerGroup: "CUSTOMER_GROUP",
  CustomerRole: "CUSTOMER_ROLE",
  CustomerLimitRequest: "CUSTOMER_LIMIT_REQUEST",
} as const;

const resolveUserDisplayName = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!user) {
    return userId;
  }

  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || userId;
};

export const createCustomerActivityLog = async ({
  customerId,
  actorUserId,
  actorUserName,
  actionType,
  resourceType,
  resourceId,
  resourceName,
  beforeState,
  afterState,
  status = CustomerActivityLogStatus.SUCCESS,
}: CustomerActivityLogInput) => {
  try {
    await prisma.customerActivityLog.create({
      data: {
        customerId,
        actorUserId,
        actorUserName: actorUserName ?? (await resolveUserDisplayName(actorUserId)),
        actionType,
        resourceType,
        resourceId: resourceId ?? null,
        resourceName: resourceName ?? null,
        beforeState: beforeState ?? undefined,
        afterState: afterState ?? undefined,
        status,
      },
    });
  } catch (error) {
    console.log("[ERROR] Failed to create customer activity log", error);
  }
};

export const createCustomerContextSwitchLog = async ({
  userId,
  fromCustomerId = null,
  toCustomerId,
  status = CustomerActivityLogStatus.SUCCESS,
  previousContextDurationMs = null,
}: CustomerContextSwitchLogInput) => {
  try {
    await prisma.customerContextSwitchLog.create({
      data: {
        userId,
        fromCustomerId,
        toCustomerId,
        status,
        previousContextDurationMs,
      },
    });
  } catch (error) {
    console.log("[ERROR] Failed to create customer context switch log", error);
  }
};
