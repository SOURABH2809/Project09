import { NextFunction, Request, Response } from "express";
import { errorResponse } from "../utils/request-handling/response.utils.js";
import { getUserPermissionsAgainstCache } from "../../modules/auth/services/user.service.js";
import { hasPermissions } from "../utils/permissions/permissions.utils.js";

export const validateAuthorization =
  (requiredPermissions: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const activeCustomerId = req.user?.activeCustomerId;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized"));
    }

    try {
      const userPermissions = await getUserPermissionsAgainstCache(userId, activeCustomerId);

      if (!hasPermissions(requiredPermissions, userPermissions)) {
        return res.status(403).json(errorResponse("Forbidden: insufficient permissions"));
      }
    } catch (error) {
      next(error);
    }

    next();
  };
