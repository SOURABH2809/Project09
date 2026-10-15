import express from "express";
import {
  assignGroupsToUserController,
  editUserDetailsController,
  editUserProfileByAdminController,
  getAllUsersController,
  restoreDeletedUserController,
  softDeleteUserController,
  updateUserAccountStatusController,
  getGroupsOfUserController,
} from "../controllers/user.controller.js";
import { validateResource } from "../middlewares/validateResource.js";
import {
  assignGroupsToUserSchema,
  deleteUserSchema,
  editUserProfileByAdminSchema,
  editUserProfileSchema,
  getAllUserSchema,
  getGroupsOfUserSchema,
  restoreUserSchema,
  updateAccountStatusSchema,
} from "../validations/user.schema.js";
import { validateAuthorization } from "../middlewares/validateAuthorization.js";
import { validateAuthentication } from "../middlewares/validateAuthentication.js";
import { GroupPermission, UserPermission } from "../utils/permissions/auth.permission.js";

const router = express.Router();

// Get all users (admin)
router.get(
  "/",
  validateResource(getAllUserSchema),
  validateAuthorization([UserPermission.Read]),
  getAllUsersController,
);

// Update own profile
router.put("/", validateResource(editUserProfileSchema), editUserDetailsController);

// Update user profile by admin
router.put(
  "/:userId/profile",
  validateResource(editUserProfileByAdminSchema),
  validateAuthorization([UserPermission.Update]),
  editUserProfileByAdminController,
);

// Soft delete user
router.delete(
  "/:userId",
  validateResource(deleteUserSchema),
  validateAuthorization([UserPermission.Delete]),
  softDeleteUserController,
);

// Restore deleted user
router.patch(
  "/:userId/restore",
  validateResource(restoreUserSchema),
  validateAuthorization([UserPermission.Restore]),
  restoreDeletedUserController,
);

// Update account status
router.patch(
  "/:userId/status",
  validateResource(updateAccountStatusSchema),
  validateAuthorization([UserPermission.StatusUpdate]),
  updateUserAccountStatusController,
);

// Assign groups to a user
router.put(
  "/:userId/groups",
  validateResource(assignGroupsToUserSchema),
  validateAuthorization([UserPermission.Read, GroupPermission.Read]),
  assignGroupsToUserController,
);

// Get groups assigned to a user
router.get(
  "/:userId/groups",
  validateResource(getGroupsOfUserSchema),
  validateAuthorization([UserPermission.Read, GroupPermission.Read]),
  getGroupsOfUserController,
);

export default router;
