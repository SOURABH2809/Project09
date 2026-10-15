import { NextFunction, Request, Response } from "express";
import { successResponse } from "../utils/request-handling/response.utils.js";
import {
  getAllPermissionsService,
  getPermissionByIdService,
  getAllPermissionsFeatureAndPageWiseService,
} from "../services/permission.service.js";
import { AppError } from "../utils/errors/AppError.js";

export const createPermissionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    throw new AppError("Permission creation is currently disabled. Please contact support.", 503);
    // const userId = req.user.userId;
    // const { name, normalizedName, description } = req.body;
    // const result = await createPermissionService(userId, name, normalizedName, description);

    // return res.status(201).json(successResponse(result.message, result.data));
  } catch (error) {
    next(error);
  }
};

export const getAllPermissionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const permissions = await getAllPermissionsService();
    return res.status(200).json(successResponse("Permissions fetched successfully.", permissions));
  } catch (error) {
    next(error);
  }
};

export const getPermissionByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { permissionId } = req.params;

    const permission = await getPermissionByIdService(permissionId as string);
    return res.status(200).json(successResponse("Permission fetched successfully.", permission));
  } catch (error) {
    next(error);
  }
};

export const updatePermissionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    throw new AppError("Permission update is currently disabled. Please contact support.", 503);
    // const { permissionId } = req.params;
    // const userId = req.user.userId;
    // const { name, normalizedName, description } = req.body;

    // const result = await updatePermissionService(
    //   permissionId as string,
    //   userId,
    //   name,
    //   normalizedName,
    //   description,
    // );

    // return res.status(200).json(successResponse(result.message, result.data));
  } catch (error) {
    next(error);
  }
};

export const deletePermissionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    throw new AppError("Permission deletion is currently disabled. Please contact support.", 503);
    // const { permissionId } = req.params;

    // const result = await deletePermissionService(permissionId as string);
    // return res.status(200).json(successResponse(result.message));
  } catch (error) {
    next(error);
  }
};

export const getAllPermissionsFeatureAndPageWiseController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const permissions = await getAllPermissionsFeatureAndPageWiseService();
    return res.status(200).json(successResponse("Permissions fetched successfully.", permissions));
  } catch (error) {
    next(error);
  }
};
