import express from "express";
import {
  createPermissionController,
  getAllPermissionsController,
  getPermissionByIdController,
  updatePermissionController,
  deletePermissionController,
  getAllPermissionsFeatureAndPageWiseController,
} from "../controllers/permission.controller.js";
import { PermissionPermission } from "../utils/permissions/auth.permission.js";
import { validateAuthorization } from "../middlewares/validateAuthorization.js";
import { validateResource } from "../middlewares/validateResource.js";
import {
  createPermissionSchema,
  deletePermissionSchema,
  getPermissionByIdSchema,
  updatePermissionSchema,
} from "../validations/permission.schema.js";

const router = express.Router();

// Create a new permission
router.post(
  "/",
  validateResource(createPermissionSchema),
  validateAuthorization([PermissionPermission.Create]),
  createPermissionController,
);

// Get all permissions
router.get("/", validateAuthorization([PermissionPermission.Read]), getAllPermissionsController);

// Get all permissions feature and page wise
router.get(
  "/features",
  validateAuthorization([PermissionPermission.Read]),
  getAllPermissionsFeatureAndPageWiseController,
);

// Get a permission by Id
router.get(
  "/:permissionId",
  validateResource(getPermissionByIdSchema),
  validateAuthorization([PermissionPermission.Read]),
  getPermissionByIdController,
);

// Update permission details
router.put(
  "/:permissionId",
  validateResource(updatePermissionSchema),
  validateAuthorization([PermissionPermission.Update]),
  updatePermissionController,
);

// Delete a permission
router.delete(
  "/:permissionId",
  validateResource(deletePermissionSchema),
  validateAuthorization([PermissionPermission.Delete]),
  deletePermissionController,
);

export default router;
