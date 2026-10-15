import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/request-handling/response.utils.js";
import {
  editUserDetailsService,
  softDeleteUserService,
  getAllUsersService,
  restoreDeletedUserService,
  updateUserAccountStatusService,
  assignGroupsToUserService,
  getGroupsOfUserService,
} from "../services/user.service.js";
import { AccountStatus, SortableColumn } from "../types/user.types.js";
import { Prisma } from "../database/generated/prisma/client.js";

// controller to edit user details
export const editUserDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user.userId;

  try {
    const result = await editUserDetailsService(userId, req.body);

    return res
      .status(200)
      .json(successResponse("User details updated successfully", { user: result }));
  } catch (error) {
    next(error);
  }
};

// controller to edit user profile by admin
export const editUserProfileByAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params; // Get from params

    const result = await editUserDetailsService(userId as string, req.body);

    return res
      .status(200)
      .json(successResponse("User profile updated successfully", { user: result }));
  } catch (error) {
    next(error);
  }
};

// controller to soft delete a user
export const softDeleteUserController = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    await softDeleteUserService(userId as string);

    return res.status(200).json(successResponse("Account deleted successfully"));
  } catch (error) {
    next(error);
  }
};

export const getAllUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, email, name, status, groups, sortBy, orderBy } = req.query;

    let groupsArray: string[] = [];
    if (groups) {
      groupsArray = (groups as string).split(",");
    }

    const result = await getAllUsersService({
      email: email as string,
      name: name as string,
      status: status == null ? null : status !== "false",
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      groups: groupsArray,
      sortBy: (sortBy || "createdAt") as SortableColumn,
      orderBy: (orderBy || "desc") as Prisma.SortOrder,
    });

    return res.status(200).json(successResponse("User retrieved successfully.", result));
  } catch (error) {
    next(error);
  }
};

//controller to restore a deleted user
export const restoreDeletedUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params; // Get userId from URL params

    const result = await restoreDeletedUserService(userId as string);

    return res.status(200).json(successResponse("User restored successfully", { user: result }));
  } catch (error) {
    next(error);
  }
};

// controller to update user account status (activate/deactivate)
export const updateUserAccountStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { status } = req.body as { status: AccountStatus };

    const result = await updateUserAccountStatusService(userId as string, status);

    const message = result.accountActive
      ? "User activated successfully"
      : "User deactivated successfully";

    return res.status(200).json(successResponse(message));
  } catch (error) {
    next(error);
  }
};

// Controller to assign user groups to user
export const assignGroupsToUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId: userToAssign } = req.params;
    const { groups } = req.body;

    const result = await assignGroupsToUserService(userToAssign as string, groups);
    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const getGroupsOfUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const result = await getGroupsOfUserService(userId as string);
    return res.status(200).json(successResponse("Groups retrieved successfully.", result));
  } catch (error) {
    next(error);
  }
};
