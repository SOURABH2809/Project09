import { randomUUID } from "crypto";
import prisma from "../config/prisma.client.js";
import { AppError } from "../utils/errors/AppError.js";
import redis from "../../../shared/config/redis.conf.js";
import { generateImpersonationToken, signAccessToken } from "../utils/encryption/jwt.js";
import { JwtPayload } from "../../../shared/types/auth.js";
import { getAccessTokenPayload } from "../utils/encryption/token.js";
import { json, set } from "zod";
import { saveDataInRedis } from "../utils/redis/redis.utils.js";

export const IMPERSONATION_SESSION_PREFIX = "impersonation:session:";
const IMPERSONATION_SESSION_TTL = 30 * 60;

interface ImpersonationSession {
  adminId: string;
  userId: string;
  createdAt: number;
}

const logImpersonationAction = async (
  action: "START" | "EXIT" | "REFRESH",
  adminId: string,
  userId: string | null = null,
  error: Error | null = null,
) => {
  try {
    const timestamp = new Date().toISOString();
    const status = error ? "FAILED" : "SUCCESS";
    const errorMessage = error?.message || null;

    // Log to console for now
    // TODO: Store in an audit log table for compliance and security review
    console.log(`[IMPERSONATION_AUDIT] ${action}`, {
      timestamp,
      adminId,
      userId,
      status,
      errorMessage,
    });

    // Future: Store in audit_logs table
    // await prisma.auditLog.create({
    //   data: {
    //     action: `IMPERSONATE_${action}`,
    //     actorId: adminId,
    //     targetUserId: userId,
    //     status,
    //     metadata: {
    //       error: errorMessage,
    //     },
    //   },
    // });
  } catch (err) {
    console.error("[AUDIT_LOG_ERROR] Failed to log impersonation action:", err);
    // Don't throw - audit logging shouldn't break the main flow
  }
};

export const getAdminImpersonationMappingRedisKey = (adminId: string) =>
  `${IMPERSONATION_SESSION_PREFIX}admin:${adminId}`;
export const getAdminImpersonationActiveContextRedisKey = (adminId: string, userId: string) =>
  `impersonation:context:${adminId}:${userId}`;

export const startImpersonationService = async (
  adminId: string,
  userId: string,
  adminEmail: string,
) => {
  try {
    //  Validate that both admin and user exist
    const [admin, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: adminId },
        select: { id: true, email: true, accountActive: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, accountActive: true },
      }),
    ]);

    if (!admin) {
      // await logImpersonationAction("START", adminId, userId, new Error("Admin user not found"));
      throw new AppError("Admin user not found", 404);
    }

    if (!admin.accountActive) {
      // await logImpersonationAction("START", adminId, userId, new Error("Admin account is disabled"));
      throw new AppError("Admin account is disabled", 403);
    }

    if (!targetUser) {
      // await logImpersonationAction("START", adminId, userId, new Error("Target user not found"));
      throw new AppError("Target user not found", 404);
    }

    if (!targetUser.accountActive) {
      // await logImpersonationAction("START", adminId, userId, new Error("Target user account is disabled"));
      throw new AppError("Target user account is disabled", 403);
    }

    // Create impersonation session
    const sessionId = randomUUID();
    const session: ImpersonationSession = {
      adminId,
      userId,
      createdAt: Date.now(),
    };

    if (adminId === userId) {
      // await logImpersonationAction("START", adminId, userId, new Error("Admin cannot impersonate themselves"));
      throw new AppError("Admin cannot impersonate themselves", 400);
    }
    const adminKey = getAdminImpersonationMappingRedisKey(adminId);
    if (await redis.exists(adminKey)) {
      // await logImpersonationAction("START", adminId, userId, new Error("Admin is already impersonating another user"));
      throw new AppError("Admin is already impersonating another user", 400);
    }

    // Store session in Redis with expiration
    const sessionKey = `${IMPERSONATION_SESSION_PREFIX}${sessionId}`;
    await redis.setex(sessionKey, IMPERSONATION_SESSION_TTL, JSON.stringify(session));

    await redis.setex(adminKey, IMPERSONATION_SESSION_TTL, JSON.stringify({ sessionId }));

    // Get default customer of target user
    const defaultCustomer = await prisma.userActiveCustomer.findFirst({
      where: { userId },
      select: { customerId: true },
    });

    const activeCustomerId = defaultCustomer?.customerId ?? null;

    const contextKey = getAdminImpersonationActiveContextRedisKey(adminId, userId);
    await saveDataInRedis(
      contextKey,
      activeCustomerId,
      IMPERSONATION_SESSION_TTL, // Tie context TTL to session TTL
      "Failed to set impersonation context in Redis",
      true,
    );

    // Generate impersonation token with email
    const token = generateImpersonationToken({
      userId,
      adminId,
      sessionId,
      email: targetUser.email,
      adminEmail,
      byPassTFA: true,
      byPassPasswordReset: true,
      activeCustomerId,
    });

    // Log successful impersonation start
    await logImpersonationAction("START", adminId, userId);

    return {
      accessToken: token,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    await logImpersonationAction(
      "START",
      adminId,
      userId,
      error instanceof Error ? error : new Error(String(error)),
    );
    throw error;
  }
};

export const validateImpersonationSessionService = async (
  sessionId: string,
): Promise<ImpersonationSession> => {
  const sessionKey = `${IMPERSONATION_SESSION_PREFIX}${sessionId}`;
  const sessionData = await redis.get(sessionKey);

  if (!sessionData) {
    throw new AppError("Impersonation session expired", 401);
  }

  try {
    const session = JSON.parse(sessionData) as ImpersonationSession;
    return session;
  } catch (error) {
    throw new AppError("Invalid impersonation session data", 401);
  }
};

export const exitImpersonationService = async (
  decodedToken: JwtPayload,
): Promise<{ token: string }> => {
  try {
    // Validate that impersonation is active
    if (!decodedToken.impersonation?.active || !decodedToken.actor) {
      throw new AppError("Not currently impersonating", 400);
    }

    const adminId = decodedToken.actor.id;
    const userId = decodedToken.userId;

    // Validate and clear Redis session
    const sessionId = decodedToken.impersonation.sessionId;
    const sessionKey = `${IMPERSONATION_SESSION_PREFIX}${sessionId}`;

    try {
      await redis.del(sessionKey);
    } catch (error) {
      console.error("Error deleting impersonation session:", error);
      // Continue even if Redis deletion fails
    }

    // Verify admin user still exists and is active
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.accountActive) {
      await logImpersonationAction(
        "EXIT",
        adminId,
        userId,
        new Error("Admin account is no longer valid"),
      );
      throw new AppError("Admin account is no longer valid", 403);
    }

    const adminKey = getAdminImpersonationMappingRedisKey(adminId);
    if (await redis.exists(adminKey)) {
      await redis.del(adminKey);
    }

    // Usual Token
    const token = signAccessToken(
      getAccessTokenPayload({
        userId: admin.id,
        email: admin.email,
        passwordChangedAt: admin.passwordChangedAt?.getTime() || admin.createdAt.getTime(),
        passwordResetRequired: admin.passwordResetRequired,
        sid: sessionId,
        redisBound: true,
      }),
    );

    // Log successful exit
    await logImpersonationAction("EXIT", adminId, userId);

    return { token };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw error;
  }
};

export const refreshImpersonationTokenService = async (
  decodedToken: JwtPayload,
): Promise<string> => {
  try {
    if (!decodedToken.impersonation?.active) {
      throw new AppError("Not an impersonation token", 400);
    }

    const adminId = decodedToken.actor?.id;
    const userId = decodedToken.userId;

    // Validate session still exists
    const session = await validateImpersonationSessionService(decodedToken.impersonation.sessionId);

    //  Extend session TTL
    const sessionKey = `${IMPERSONATION_SESSION_PREFIX}${decodedToken.impersonation.sessionId}`;
    await redis.expire(sessionKey, IMPERSONATION_SESSION_TTL);

    // Generate new impersonation token
    const newToken = generateImpersonationToken({
      userId: session.userId,
      adminId: session.adminId,
      sessionId: decodedToken.impersonation.sessionId,
      email: decodedToken.email!,
      adminEmail: decodedToken.actor?.email || "",
      activeCustomerId: decodedToken.activeCustomerId || null,
    });

    // Log successful refresh
    await logImpersonationAction("REFRESH", adminId || "", userId);

    return newToken;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw error;
  }
};
