import prisma from "../config/prisma.client.js";
import { ImpersonationData, SigninSchema, SignupSchema } from "../types/auth.types.js";
import { UserClass } from "../types/user.types.js";
import { comparePassword, hashPassword } from "../utils/encryption/hash.js";
import { AppError } from "../utils/errors/AppError.js";
import { randomUUID } from "crypto";
import {
  decodeJwtToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/encryption/jwt.js";
import {
  IMPERSONATION_SESSION_PREFIX,
  refreshImpersonationTokenService,
} from "./impersonate.service.js";
import { Prisma, User, UserType } from "../database/generated/prisma/client.js";
import { sanitizeString } from "../utils/helpers/common.helper.js";
import { publishEmail } from "../../../shared/queues/producers/email.producer.js";
import { EmailPayload, EmailTemplateEnum } from "../../../shared/types/email.js";
import {
  generateHashedToken,
  getAccessTokenPayload,
  getRefreshTokenPayload,
  hashToken,
} from "../utils/encryption/token.js";
import {
  PASSWORD_EXPIRY_DURATION_MS,
  CUSTOMER_SUPER_ADMIN_GROUP_NAME,
  SALES_USER_GROUP_NAME,
} from "../../../shared/constants/app.constant.js";
import { CustomerMappingRoleScope } from "../../../shared/constants/customerRoleScope.constant.js";
import redis from "../../../shared/config/redis.conf.js";
import {
  REFRESH_TOKEN_EXPIRES_IN,
  SESSION_TTL,
} from "../constants/auth.constant.js";
import { JwtPayload } from "../../../shared/types/auth.js";
import { getUserPermissionsAgainstCache } from "./user.service.js";
import { saveDataInRedis } from "../utils/redis/redis.utils.js";
import { changeActiveCustomerContextService } from "./shared.utils.js";
import {
  CustomerActivityActionType,
  CustomerActivityResourceType,
  createCustomerActivityLog,
} from "./customerActivityLog.service.js";
import { invalidateUserPermissionsCache } from "./customerAdmin.utils.js";
import { invalidateUserPermissionCacheService } from "./permission.service.js";

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  accountActive: true,
  userType: true,
} as const;

export const signupService = async ({ email, firstName, lastName, password }: SignupSchema) => {
  email = sanitizeString(email)?.toLowerCase() as string;

  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingUser?.deletedAt) {
    throw new AppError("A user with this email was previously deleted. Please restore it.", 409);
  }

  if (existingUser) {
    if (existingUser.userType === UserType.CUSTOMER) {
      throw new AppError(
        "This email is already registered with customer account, use different email.",
        409,
      );
    }

    throw new AppError("Email Already registered with internal user.", 409);
  }

  let newUser;
  try {
    newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash: await hashPassword(password),
        passwordResetRequired: false,
        accountActive: true,
        userType: UserType.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Email Already exists. Please login.", 409);
    }
    throw error;
  }

  return true;
};

export const signinService = async ({ email, password }: SigninSchema) => {
  email = email.trim().toLowerCase();
  password = password.trim();

  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    include: {},
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.accountActive) {
    throw new AppError("Your account is disabled.", 403);
  }

  // User not set initial password yet
  if (!user.passwordHash) {
    throw new AppError("Please set your initial password first.", 401);
  }

  // Password Check and update failed login attempts
  await compareAndUpdateFailedLoginAttempts(password, user);

  // Check if password age exceeds configured expiry period
  await checkAndUpdateUserPasswordResetRequired(user);

  // Successful Login, Reset failed attempts
  await prisma.user.update({
    where: { email },
    data: {
      failedLoginAttempts: 0,
      lastLoginFailedAt: null,
    },
  });

  const sessionId = randomUUID();
  const redisBound = await saveDataInRedis(
    `session:${sessionId}`,
    user.id,
    SESSION_TTL,
    "Redis unavailable during login, skipping session creation",
    true,
  );
  const accessToken = signAccessToken(
    getAccessTokenPayload({
      userId: user.id,
      email: user.email,
      passwordChangedAt: user.passwordChangedAt?.getTime() || user.createdAt.getTime(),
      passwordResetRequired: user.passwordResetRequired,
      sid: sessionId,
      redisBound: redisBound === true,
    }),
  );
  const refreshToken = signRefreshToken(
    getRefreshTokenPayload({
      userId: user.id,
      sid: sessionId,
      redisBound: redisBound === true,
    }),
  );
  await createAndSaveRefreshToken(user.id, refreshToken);
  const permissions = await getUserPermissionsAgainstCache(user.id);

  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        permissions,
      },
    },
    accessToken,
    refreshToken,
  };

  /*
  // If device is trusted, skip 2FA and complete login
  // if (deviceToken && user.twoFactorEnabled && user.isGoogleAuthenticatorEnabled) {
  //   const isTrusted = await checkTrustedDevice(user.id, deviceToken);
  //   if (isTrusted) {
  //     const sessionId = randomUUID();

  //     const res = await saveDataInRedis(
  //       `session:${sessionId}`,
  //       user.id,
  //       SESSION_TTL,
  //       "Redis unavailable during login, skipping session creation",
  //       true, // Suppress error
  //     );

  //     const accessToken = signAccessToken(
  //       getAccessTokenPayload({
  //         userId: user.id,
  //         email: user.email,
  //         passwordChangedAt: user.passwordChangedAt?.getTime() || user.createdAt.getTime(),
  //         passwordResetRequired: user.passwordResetRequired,
  //         sid: sessionId,
  //         redisBound: res === true,
  //         customerId: user.customerId || "",
  //         supplierId: user.supplierId || "",
  //       }),
  //     );

  //     const refreshToken = signRefreshToken(
  //       getRefreshTokenPayload({
  //         userId: user.id,
  //         sid: sessionId,
  //         redisBound: res === true,
  //         customerId: user.customerId || "",
  //         supplierId: user.supplierId || "",
  //       }),
  //     );

  //     await createAndSaveRefreshToken(user.id, refreshToken);

  //     const permissions: string[] = await getUserPermissionsAgainstCache(user.id);
  //     let businessEntities: { id: string; name: string; isActive: boolean }[] = [];
  //     if (user.customerId) {
  //       businessEntities =
  //         await CustomerServiceRegistry.getAllBusinessEntitiesAssociatedWithCustomerService(
  //           user.customerId || "",
  //         );
  //     } else if (user.supplierId) {
  //       const businessEntity =
  //         await CustomerServiceRegistry.getAllBusinessEntitiesAssociatedWithSupplierService(
  //           user.supplierId || "",
  //         );
  //       businessEntities = Array.isArray(businessEntity) ? businessEntity : [businessEntity];
  //     } else {
  //       const canUserListCustomers = permissions.some((perm: string) =>
  //         customerListPermissions.includes(perm),
  //       );
  //       if (canUserListCustomers) {
  //         businessEntities =
  //           await CustomerServiceRegistry.getAllBusinessEntitiesWithoutFilterService();
  //       }
  //     }

  //     const sanitizedUser = {
  //       id: user.id,
  //       email: user.email,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       permissions,
  //       businessEntities,
  //     };

  //     return {
  //       data: { user: sanitizedUser },
  //       accessToken,
  //       refreshToken,
  //     };
  //   }
  // }

  */
};

export const refreshTokenService = async (refreshToken: string | null) => {
  if (!refreshToken) throw new AppError("Unauthorized", 401);
  const { userId }: JwtPayload = verifyRefreshToken(refreshToken);

  // Hash token and check DB
  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revoked: false,
      userId,
    },
  });

  if (!storedToken) throw new AppError("Token revoked", 401);

  // Rotate token (revoke old)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      passwordChangedAt: true,
      createdAt: true,
      passwordResetRequired: true,
      userType: true,
    },
  });

  if (!user) throw new AppError("User not found", 404);

  const sessionId = randomUUID();

  const res = await saveDataInRedis(
    `session:${sessionId}`,
    user.id,
    SESSION_TTL,
    "Redis unavailable during token refresh, skipping session creation",
    true, // Supress error
  );

  // Issue new tokens

  let activeCustomerId: string | undefined;

  if (user.userType === UserType.CUSTOMER) {
    // Automatically loads the last active context from Redis if available, fallback to first mapping
    const userActiveCustomer = await changeActiveCustomerContextService(user.id, null);
    activeCustomerId = userActiveCustomer.customerId || undefined;
  }

  const newAccessToken = signAccessToken(
    getAccessTokenPayload({
      userId: user.id,
      email: user.email,
      passwordChangedAt: user.passwordChangedAt?.getTime() || user.createdAt.getTime(),
      passwordResetRequired: user.passwordResetRequired,
      sid: sessionId,
      redisBound: res === true,
      activeCustomerId: activeCustomerId,
    }),
  );

  // Creating refresh token (long lived)
  const newRefreshToken = signRefreshToken(
    getRefreshTokenPayload({
      userId: user.id,
      sid: sessionId,
      redisBound: res === true,
    }),
  );

  const newHash = hashToken(newRefreshToken);

  await prisma.refreshToken.create({
    data: {
      tokenHash: newHash,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN),
    },
  });

  return {
    data: {
      accessToken: newAccessToken,
    },
    refreshToken: newRefreshToken,
  };
};

export const getUserDetailsService = async (userId: string, activeCustomerId?: string) => {
  const adminKey = `${IMPERSONATION_SESSION_PREFIX}admin:${userId}`;
  const contextKey = `impersonation:context:${userId}:*`;

  const keys = await redis.keys(contextKey);
  if (keys.length > 0) {
    await redis.del(keys);
  }
  if (await redis.exists(adminKey)) {
    await redis.del(adminKey);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    select: userSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const permissions = await getUserPermissionsAgainstCache(user.id, activeCustomerId);

  return { ...user, permissions };
};

export const getUserDetailsForImpersonation = async (
  activeCustomerId: string | undefined,
  isImpersonating: boolean,
  impersonationData: ImpersonationData,
) => {
  // Validate that both admin and user exist
  const adminId = impersonationData.impersonatingUserId;
  const userId = impersonationData.impersonatedUserId;

  const [admin, targetUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, accountActive: true, userType: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    }),
  ]);

  if (!admin) {
    throw new AppError("Admin user not found", 404);
  }

  if (!admin.accountActive) {
    throw new AppError("Admin account is disabled", 403);
  }

  if (!targetUser) {
    throw new AppError("Target user not found", 404);
  }

  if (!targetUser.accountActive) {
    throw new AppError("Target user account is disabled", 403);
  }

  // Validate redis session id
  const sessionKey = `${IMPERSONATION_SESSION_PREFIX}${impersonationData.sessionId}`;
  const sessionData = await redis.get(sessionKey);
  if (!sessionData) {
    throw new AppError("Impersonation session expired", 401);
  }

  const permissions = await getUserPermissionsAgainstCache(targetUser.id);

  return {
    ...targetUser,
    permissions,
    isImpersonating,
    impersonationData: {
      sessionId: impersonationData.sessionId,
      impersonatingUserId: admin.id,
      impersonatingUserEmail: admin.email,
      impersonatedUserId: targetUser.id,
      impersonatedUserEmail: targetUser.email,
      byPassPasswordReset: true,
      byPassTFA: true,
    },
  };
};

export const logoutService = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });

  const payload = decodeJwtToken(refreshToken);

  const sid = payload?.sid;
  if (payload?.sid) {
    await redis.del(`session:${sid}`);
  }
  return true;
};

export const forgotPasswordService = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  // Prevent email enumeration
  if (!user) return true;

  // Build reset password URL
  const { resetPasswordPageUrl } = await createAndSaveResetPasswordToken(user.id);

  const username = user.firstName;

  const passwordResetEmailPayload: EmailPayload = {
    to: user.email,
    subject: "Reset Your Password",
    data: {
      name: username,
      resetPasswordUrl: resetPasswordPageUrl,
    },
    templateType: EmailTemplateEnum.PASSWORD_RESET_TEMPLATE,
  };

  // Send password reset email
  await publishEmail(passwordResetEmailPayload);

  return true;
};

// passwrod reset service
// TODO: Remove whole user session
export const resetPasswordService = async (token: string, password: string) => {
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      used: false,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: {
          id: true,
          passwordHash: true, // To check if new password is same as old
        },
      },
    },
  });

  if (!resetToken) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  if (resetToken.user.passwordHash) {
    const isSamePassword = await comparePassword(password, resetToken.user.passwordHash);
    if (isSamePassword) {
      throw new AppError("New password cannot be the same as your current password", 400);
    }
  }

  const newPasswordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: newPasswordHash,
        failedLoginAttempts: 0, //  Reset failed login attempts
        lastLoginFailedAt: null,
        passwordChangedAt: new Date(),
        passwordResetRequired: false,
      },
    }),

    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),

    // Revoke all refresh tokens
    prisma.refreshToken.updateMany({
      where: { userId: resetToken.userId },
      data: { revoked: true },
    }),
  ]);

  return true;
};

export const changePasswordService = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      passwordHash: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt) {
    throw new AppError("User not found", 404);
  }

  if (!user.passwordHash) {
    throw new AppError("Please set your initial password first.", 400);
  }

  const isOldPasswordCorrect = await comparePassword(oldPassword, user.passwordHash);
  if (!isOldPasswordCorrect) {
    throw new AppError("Incorrect current password", 400);
  }

  const isSamePassword = await comparePassword(newPassword, user.passwordHash);
  if (isSamePassword) {
    throw new AppError("New password cannot be the same as your current password", 400);
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        passwordChangedAt: new Date(),
        passwordResetRequired: false,
      },
    }),

    // Optionally revoke all refresh tokens so the user has to login again on other devices
    prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { revoked: true },
    }),
  ]);

  return true;
};

export const createAndSaveResetPasswordToken = async (userId: string) => {
  // Generate Hash Token
  const { token: resetToken, tokenHash } = generateHashedToken();
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);
  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt: refreshTokenExpiresAt,
    },
  });

  const resetPasswordPageUrl = `${process.env.FE_RESET_PASSWORD_PAGE_URL}?token=${resetToken}`;

  return { resetToken, tokenHash, resetPasswordPageUrl };
};

export const createAndSaveRefreshToken = async (userId: string, token: string) => {
  // Generate Hash Token
  const tokenHash = hashToken(token);

  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);

  // Store refresh token for revocation & rotation
  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt: refreshTokenExpiresAt,
    },
  });

  return { tokenHash };
};

export const checkAndUpdateUserPasswordResetRequired = async (user: User) => {
  const passwordAge = user.passwordChangedAt
    ? Date.now() - user.passwordChangedAt.getTime()
    : Date.now() - user.createdAt.getTime();

  // If password expired or flag is set
  if (passwordAge > PASSWORD_EXPIRY_DURATION_MS || user.passwordResetRequired) {
    // Only update flag if not already set (avoid unnecessary DB write)
    if (!user.passwordResetRequired) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetRequired: true },
      });
    }

    throw new AppError(
      "Password reset required due to organization security policy.",
      403,
      "PASSWORD_RESET_REQUIRED",
    );
  }
};

export const compareAndUpdateFailedLoginAttempts = async (password: string, user: User) => {
  if (!user.passwordHash) return;

  const passwordMatched = await comparePassword(password, user.passwordHash);

  if (!passwordMatched) {
    await prisma.user.update({
      where: { email: user.email },
      data: {
        failedLoginAttempts: { increment: 1 },
        lastLoginFailedAt: new Date(),
      },
    });

    throw new AppError("Invalid credentials", 401);
  }
};

export const getUsersBasicDetailsService = async (userIds: string[]) => {
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  return users;
};

export const classifyUserByEmail = async (email: string): Promise<UserClass> => {
  const normalizedEmail = sanitizeString(email)?.toLowerCase() as string;

  const existingUser = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      deletedAt: null,
    },
  });

  if (!existingUser) {
    return {
      status: "no_user_exists",
      user: null,
    };
  }

  if (existingUser.userType === UserType.INTERNAL) {
    return {
      status: "internal_user_exists",
      user: existingUser,
    };
  }

  return {
    status: "customer_user_exists",
    user: existingUser,
  };
};

export const checkExistingAccountByEmailService = async (email: string) => {
  const existingUserClassification = await classifyUserByEmail(email);

  const existingUser = existingUserClassification.user;

  return {
    email: sanitizeString(email)?.toLowerCase() as string,
    status: existingUserClassification.status,
    message:
      existingUserClassification.status === "internal_user_exists"
        ? "Primary email is already in use. Please use a different email."
        : existingUserClassification.status === "customer_user_exists"
          ? "Primary email is already registrerd. Do you want to proceed with the existing account?"
          : "No existing account found for this email.",
    user: existingUser
      ? {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          userType: existingUser.userType,
        }
      : null,
  };
};

const getOrCreateCustomerUser = async ({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<User> => {
  email = sanitizeString(email)?.toLowerCase() as string;

  const existingUserClassification = await classifyUserByEmail(email);

  if (
    existingUserClassification.status === "internal_user_exists" ||
    existingUserClassification.status === "customer_user_exists"
  ) {
    return existingUserClassification.user;
  }

  return prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      accountActive: true,
      userType: UserType.CUSTOMER,
    },
  });
};

const getOrCreateSuperAdminUser = async ({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<User> => {
  email = sanitizeString(email)?.toLowerCase() as string;

  const existingUserClassification = await classifyUserByEmail(email);

  if (existingUserClassification.status === "internal_user_exists") {
    throw new AppError("Internal users cannot be assigned as customer super admin", 409);
  }

  if (existingUserClassification.status === "customer_user_exists") {
    return existingUserClassification.user;
  }

  return prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      accountActive: true,
      userType: UserType.CUSTOMER,
    },
  });
};

const getlCustomerSuperAdminMembershipIds = async () => {
  const [group, role] = await Promise.all([
    prisma.userGroup.findFirst({
      where: {
        normalizedName: CUSTOMER_SUPER_ADMIN_GROUP_NAME,
      },
      select: {
        id: true,
      },
    }),
    prisma.userRoles.findFirst({
      where: {
        normalizedName: CUSTOMER_SUPER_ADMIN_GROUP_NAME,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!group || !role) {
    throw new AppError(
      "Customer Super Admin group/role is missing. Please add to perform further action.",
      500,
    );
  }

  return {
    groupId: group.id,
    roleId: role.id,
  };
};

export const createCustomerSuperAdminService = async (
  customerId: string,
  email: string,
  firstName: string,
  lastName: string,
  assignedById: string,
) => {
  const user = await getOrCreateSuperAdminUser({
    email,
    firstName,
    lastName,
  });

  const { groupId, roleId } = await getlCustomerSuperAdminMembershipIds();

  await prisma.$transaction([
    // Restore the customer mapping when the user is soft-deleted.
    prisma.userCustomerMapping.upsert({
      where: {
        userId_customerId: {
          userId: user.id,
          customerId,
        },
      },
      update: {
        isActive: true,
        deletedAt: null,
        roleScope: CustomerMappingRoleScope.CUSTOMER_SUPER_ADMIN,
        createdById: assignedById,
      },
      create: {
        userId: user.id,
        customerId,
        createdById: assignedById,
        roleScope: CustomerMappingRoleScope.CUSTOMER_SUPER_ADMIN,
      },
    }),
    // Super admin uses the global group/role, so clear any customer-scoped membership
    // for this customer before attaching the global membership.
    prisma.customerUserGroupMap.deleteMany({
      where: {
        userId: user.id,
        customerId,
      },
    }),
    prisma.customerUserRoleMap.deleteMany({
      where: {
        userId: user.id,
        customerId,
      },
    }),
    prisma.userGroupMap.upsert({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        groupId,
      },
    }),
    prisma.userGroupRoleMap.upsert({
      where: {
        groupId_roleId: {
          groupId,
          roleId,
        },
      },
      update: {},
      create: {
        groupId,
        roleId,
      },
    }),
    // Create Customer Admin entry
    prisma.customerAdmin.upsert({
      where: {
        userId_customerId: {
          userId: user.id,
          customerId,
        },
      },
      update: { isActive: true, deletedAt: null, assignedById },
      create: {
        userId: user.id,
        customerId,
        assignedById,
      },
    }),
  ]);

  await Promise.all([
    invalidateUserPermissionCacheService([user.id]),
    invalidateUserPermissionsCache(user.id, customerId),
  ]);

  await createCustomerActivityLog({
    customerId,
    actorUserId: assignedById,
    actionType: CustomerActivityActionType.CustomerUserCreated,
    resourceType: CustomerActivityResourceType.CustomerUser,
    resourceId: user.id,
    resourceName: `${user.firstName} ${user.lastName}`.trim(),
    beforeState: null,
    afterState: {
      userId: user.id,
      email: user.email,
      roleScope: CustomerMappingRoleScope.CUSTOMER_SUPER_ADMIN,
    },
  });

  return user;
};

export const createCustomerUser = async ({
  customerId,
  email,
  firstName,
  lastName,
  assignedById,
}: {
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  assignedById: string;
}) => {
  const user = await getOrCreateCustomerUser({ email, firstName, lastName });

  // Prevent internal conflict
  const activeMappingExists = await prisma.userCustomerMapping.findFirst({
    where: { userId: user.id, customerId, deletedAt: null },
    select: {
      id: true,
    },
  });

  if (activeMappingExists) {
    return user;
  }

  // Map user to customer with USER role scope
  await prisma.userCustomerMapping.upsert({
    where: {
      userId_customerId: {
        userId: user.id,
        customerId,
      },
    },
    update: {
      isActive: true,
      deletedAt: null,
      roleScope: CustomerMappingRoleScope.CUSTOMER_USER,
      createdById: assignedById,
    },
    create: {
      userId: user.id,
      customerId,
      createdById: assignedById,
      roleScope: CustomerMappingRoleScope.CUSTOMER_USER,
    },
  });


  return user;
};

export const createCustomerAdmin = async ({
  customerId,
  email,
  firstName,
  lastName,
  assignedById,
}: {
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  assignedById: string;
}) => {
  const user = await getOrCreateCustomerUser({ email, firstName, lastName });


  // Mapping
  await prisma.userCustomerMapping.upsert({
    where: {
      userId_customerId: {
        userId: user.id,
        customerId,
      },
    },
    update: {
      isActive: true,
      deletedAt: null,
      roleScope: CustomerMappingRoleScope.CUSTOMER_ADMIN,
      createdById: assignedById,
    },
    create: {
      userId: user.id,
      customerId,
      createdById: assignedById,
      roleScope: CustomerMappingRoleScope.CUSTOMER_ADMIN,
    },
  });

  // Admin table
  await prisma.customerAdmin.upsert({
    where: {
      userId_customerId: {
        userId: user.id,
        customerId,
      },
    },
    update: {
      isActive: true,
      deletedAt: null,
      assignedById,
    },
    create: {
      userId: user.id,
      customerId,
      assignedById,
    },
  });


  await createCustomerActivityLog({
    customerId,
    actorUserId: assignedById,
    actionType: CustomerActivityActionType.CustomerUserCreated,
    resourceType: CustomerActivityResourceType.CustomerUser,
    resourceId: user.id,
    resourceName: `${user.firstName} ${user.lastName}`.trim(),
    beforeState: null,
    afterState: {
      userId: user.id,
      email: user.email,
      roleScope: CustomerMappingRoleScope.CUSTOMER_ADMIN,
    },
  });

  return user;
};

export const validateSalesUserService = async (userId: string) => {
  const salesUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      accountActive: true,
      userGroup: {
        some: {
          group: {
            normalizedName: SALES_USER_GROUP_NAME,
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!salesUser) {
    throw new AppError("Sales user not found or inactive", 404);
  }
};
