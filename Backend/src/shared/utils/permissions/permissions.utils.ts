import { PERMISSION_WILD_CARD } from "../../constants/app.constant.js";
import { AppPermissionValue } from "../../permissions/seed.permission.js";

export const hasPermissions = (requiredPermissions: string[], userPermissions: string[]) => {
  return requiredPermissions.every((required) => {
    // Exact match
    if (userPermissions.includes(required)) return true;

    // Wildcard match: User.All covers User.Update, User.Delete, etc.
    const [domain] = required.split(":");
    if (userPermissions.includes(`${domain}:${PERMISSION_WILD_CARD}`)) return true;

    return false;
  });
};
