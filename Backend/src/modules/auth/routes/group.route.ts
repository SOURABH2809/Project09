import express from "express";
import {
  assignRolesToGroupController,
  assignUsersToGroupController,
  createUserGroupController,
  deleteUserGroupController,
  getAllUserGroupsController,
  getRolesOfGroupController,
  getUserGroupWithUsersController,
  updateUserGroupController,
} from "../controllers/group.controller.js";
import { validateAuthorization } from "../middlewares/validateAuthorization.js";
import {
  GroupPermission,
  RolePermission,
  UserPermission,
} from "../utils/permissions/auth.permission.js";
import { validateResource } from "../middlewares/validateResource.js";
import {
  assignRolesToGroupSchema,
  assignUsersToGroupSchema,
  createUserGroupSchema,
  deleteUserGroupSchema,
  getRolesOfGroupSchema,
  getUserGroupWithUsersSchema,
  updateUserGroupSchema,
} from "../validations/group.schema.js";

const router = express.Router();

// Create a new user group
router.post(
  "/",
  validateResource(createUserGroupSchema),
  validateAuthorization([GroupPermission.Create]),
  createUserGroupController,
);

// Get all user groups
router.get("/", validateAuthorization([GroupPermission.Read]), getAllUserGroupsController);

// Get a specific group along with its users
router.get(
  "/:groupId",
  validateResource(getUserGroupWithUsersSchema),
  validateAuthorization([GroupPermission.Read, UserPermission.Read]),
  getUserGroupWithUsersController,
);

// Update group details (name, normalizedName, description)
router.put(
  "/:groupId",
  validateResource(updateUserGroupSchema),
  validateAuthorization([GroupPermission.Update]),
  updateUserGroupController,
);

// Delete a user group
router.delete(
  "/:groupId",
  validateResource(deleteUserGroupSchema),
  validateAuthorization([GroupPermission.Delete]),
  deleteUserGroupController,
);

// Assign/replace users in a group
router.put(
  "/:groupId/users",
  validateResource(assignUsersToGroupSchema),
  validateAuthorization([GroupPermission.AssignUser]),
  assignUsersToGroupController,
);

// Assign/replace roles in a group
router.put(
  "/:groupId/roles",
  validateResource(assignRolesToGroupSchema),
  validateAuthorization([RolePermission.Update, GroupPermission.Update]),
  assignRolesToGroupController,
);

// Get all roles assigned to a group
router.get(
  "/:groupId/roles",
  validateResource(getRolesOfGroupSchema),
  validateAuthorization([GroupPermission.Read, RolePermission.Read]),
  getRolesOfGroupController,
);

export default router;
