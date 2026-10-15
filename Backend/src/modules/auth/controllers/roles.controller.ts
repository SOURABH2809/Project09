import { NextFunction, Request, Response } from "express";
import {
  addRoleService,
  assignPermissionsToRoleService,
  deleteRoleService,
  editRoleService,
  getAllPermissionsOfRoleService,
  getRolesService,
} from "../services/role.service.js";
import { successResponse } from "../utils/request-handling/response.utils.js";

export const addRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await addRoleService({
      ...req.body,
      userId: req.user.userId,
    });

    return res.status(201).json(successResponse("Role added successfully", result));
  } catch (error) {
    next(error);
  }
};

export const getRolesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getRolesService();

    return res.status(200).json(successResponse("Fetched all roles.", result));
  } catch (error) {
    next(error);
  }
};

export const assignPermissionsToRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.userId;
    const roleToAssign = req.params.roleId;
    const result = await assignPermissionsToRoleService(
      userId,
      roleToAssign as string,
      req.body.permissions,
    );

    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const deleteRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.roleId as string;
    const result = await deleteRoleService(id);

    return res.status(200).json(successResponse(result.message));
  } catch (error: unknown) {
    next(error);
  }
};

export const editRoleController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.roleId as string;
    const userId = req.user.userId;
    const { name, normalizedName, description } = req.body;
    const result = await editRoleService(id, userId, name, normalizedName, description);

    return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const getAllPermissionsOfRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roleId = req.params.roleId as string;
    const result = await getAllPermissionsOfRoleService(roleId);

    return res
      .status(200)
      .json(successResponse("All permissions retrieved of role successfully", result));
  } catch (error) {
    next(error);
  }
};
