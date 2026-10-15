const MODULE_NAME = "Auth";

export const UserPermission = {
  Create: "user:create",
  Read: "user:view",
  Update: "user:update",
  Delete: "user:delete",
  Restore: "user:restore",
  StatusUpdate: "user:update-status",
  All: "user:all",

  __ModuleName: MODULE_NAME,
  __pageName: "Manage-Users",
} as const;

export const GroupPermission = {
  Create: "group:create",
  Update: "group:update",
  Delete: "group:delete",
  AssignUser: "group:assign-users",
  Read: "group:view",
  All: "group:all",
  __ModuleName: MODULE_NAME,
  __pageName: "Manage-User-Groups",
} as const;

export const RolePermission = {
  Create: "role:create",
  Update: "role:update",
  Delete: "role:delete",
  AssignPermission: "role:assign-permission",
  Read: "role:view",
  All: "role:all",
  __ModuleName: MODULE_NAME,
  __pageName: "Manage-Roles",
} as const;

export const PermissionPermission = {
  Create: "permission:create",
  Update: "permission:update",
  Delete: "permission:delete",
  Read: "permission:view",
  All: "permission:all",
  __ModuleName: MODULE_NAME,
  __pageName: "Permissions",
} as const;

export const ImpersonatePermission = {
  Login: "impersonate:login",
  __ModuleName: MODULE_NAME,
  __pageName: "Impersonate-Users",
} as const;

export const AuthPermissions = {
  UserPermission,
  GroupPermission,
  RolePermission,
  PermissionPermission,
  ImpersonatePermission,
} as const;
