import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors/AppError.js";
import prisma from "../config/prisma.client.js";
import { UserType } from "../database/generated/prisma/enums.js";

export const validateInternalUser = async (req: Request, _res: Response, next: NextFunction) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      accountActive: true,
      userType: UserType.INTERNAL,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new AppError("Access denied", 403);
  }

  return next();
};
