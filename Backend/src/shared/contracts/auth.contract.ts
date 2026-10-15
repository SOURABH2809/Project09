import { User } from "../../modules/auth/database/generated/prisma/client.js";
import { UserRoles } from "../../modules/auth/types/roles.types.js";

export interface AuthContract {
  validateSalesUserService: (userId: string) => Promise<void>;
  getRolesService: () => Promise<UserRoles[]>;
  getAllUserIdsOfGroupByName: (groupName: string) => Promise<{ id: string; email: string }[]>;
  getUsersBasicDetailsService: (
    userIds: string[],
  ) => Promise<{ id: string; email: string; firstName: string; lastName: string }[]>;
  classifyUserByEmail: (
    email: string,
  ) => Promise<import("../../modules/auth/types/user.types.js").UserClass>;
  createAndSaveResetPasswordToken: (
    userId: string,
  ) => Promise<{ resetToken: string; tokenHash: string; resetPasswordPageUrl: string }>;
  getBasicDetailsOfUser: (userId: string) => Promise<Partial<User>>;
}
