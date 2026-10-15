import { AuthPermissions } from "./auth.permission.js";

type Values<T> = T[keyof T];

export const PERMISSION_DOMAINS = {
  ...AuthPermissions,
} as const;

export type AppPermissionValue = Values<Values<typeof PERMISSION_DOMAINS>>;

export const APP_PERMISSIONS = Object.values(PERMISSION_DOMAINS).flatMap(Object.values);
export const APP_PERMISSIONS_WITH_MODULE_NAMES = Object.values(PERMISSION_DOMAINS);
