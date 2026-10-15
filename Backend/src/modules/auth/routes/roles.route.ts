import express from "express";
import { validateResource } from "../middlewares/validateResource.js";
import {
  addRoleController,
  assignPermissionsToRoleController,
  deleteRoleController,
  editRoleController,
  getAllPermissionsOfRoleController,
  getRolesController,
} from "../controllers/roles.controller.js";
import {
  addRoleSchema,
  assignPermissionsToRoleSchema,
  assignRolesSchema,
  deleteRoleSchema,
  editRoleSchema,
  getAllPermissionsOfRoleSchema,
} from "../validations/roles.schema.js";
import { validateAuthorization } from "../middlewares/validateAuthorization.js";
import { validateAuthentication } from "../middlewares/validateAuthentication.js";
import { PermissionPermission, RolePermission } from "../utils/permissions/auth.permission.js";

const router = express.Router();

// Create a new role
router.post(
  "/",
  validateResource(addRoleSchema),
  validateAuthorization([RolePermission.Create]),
  addRoleController,
);

// Get all roles
router.get("/", validateAuthorization([RolePermission.Read]), getRolesController);

// Delete a role by id
router.delete(
  "/:roleId",
  validateResource(deleteRoleSchema),
  validateAuthorization([RolePermission.Delete]),
  deleteRoleController,
);

// Update role details
router.patch(
  "/:roleId",
  validateResource(editRoleSchema),
  validateAuthorization([RolePermission.Update]),
  editRoleController,
);

// Assign/replace permissions to a role
router.put(
  "/:roleId/permissions",
  validateResource(assignPermissionsToRoleSchema),
  validateAuthorization([RolePermission.AssignPermission]),
  assignPermissionsToRoleController,
);

// Get all permissions assigned to a role
router.get(
  "/:roleId/permissions",
  validateResource(getAllPermissionsOfRoleSchema),
  validateAuthorization([RolePermission.Read, PermissionPermission.Read]),
  getAllPermissionsOfRoleController,
);

export default router;
