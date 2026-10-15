import { NextFunction, Request, Response } from "express";
import {
  assignRolesToGroupService,
  assignUsersToGroupService,
  createUserGroupService,
  deleteUserGroupService,
  getAllUserGroupsService,
  getRolesOfGroupService,
  getUserGroupWithUsersService,
  updateUserGroupService,
} from "../services/index.js";
import { successResponse } from "../utils/request-handling/response.utils.js";

export const createUserGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.userId;
    const { name, normalizedName, description } = req.body;
    const result = await createUserGroupService(userId, name, normalizedName, description);
    return res.status(201).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const assignUsersToGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const groupId = req.params.groupId;
    const { users } = req.body;
    const result = await assignUsersToGroupService(groupId as string, users);
    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const updateUserGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.userId;
    const result = await updateUserGroupService(groupId as string, userId, req.body);
    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const deleteUserGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const groupId = req.params.groupId;
    const result = await deleteUserGroupService(groupId as string);
    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const getAllUserGroupsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAllUserGroupsService();
    return res.status(200).json(successResponse("UserGroup retrieved successfully", result));
  } catch (error) {
    next(error);
  }
};

export const getUserGroupWithUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const groupId = req.params.groupId;
    const result = await getUserGroupWithUsersService(groupId as string);

    return res
      .status(200)
      .json(successResponse("UserGroup retrieved with users successfully", result));
  } catch (error) {
    next(error);
  }
};

export const assignRolesToGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const groupId = req.params.groupId;
    const result = await assignRolesToGroupService(groupId as string, req.body.roles);

    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const getRolesOfGroupController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const groupId = req.params.groupId;
    const result = await getRolesOfGroupService(groupId as string);

    return res.status(200).json(successResponse("Fetched roles of UserGroup successfully", result));
  } catch (error) {
    next(error);
  }
};
