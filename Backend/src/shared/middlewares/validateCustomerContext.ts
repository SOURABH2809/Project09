import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/AppError.js";
import prisma from "../../modules/auth/config/prisma.client.js";

export const validateCustomerContext = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const tokenCustomerId = req.user?.customerId;

    const customerId = tokenCustomerId;

    if (!customerId) {
      throw new AppError("Missing customer context.", 403);
    }

    // Validate (userId, customerId) mapping is active
    const mapping = await prisma.userCustomerMapping.findFirst({
      where: {
        userId,
        customerId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (!mapping) {
      throw new AppError("Access denied: You do not have access to this customer", 403);
    }

    // Check if user is the Super Admin / Admin for this customer
    const customerAdmin = await prisma.customerAdmin.findFirst({
      where: {
        userId,
        customerId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (customerAdmin) {
      req.user.isCustomerAdmin = true;
    } else {
      req.user.isCustomerAdmin = false;
    }

    return next();
  } catch (error) {
    next(error);
  }
};
