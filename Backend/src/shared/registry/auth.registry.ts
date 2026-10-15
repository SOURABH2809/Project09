import { AuthContract } from "../contracts/auth.contract.js";
import { getRolesService } from "../../modules/auth/services/role.service.js";
import { getAllUserIdsOfGroupByName } from "../../modules/auth/services/group.service.js";
import {
  getUsersBasicDetailsService,
  validateSalesUserService,
  classifyUserByEmail,
  createAndSaveResetPasswordToken,
} from "../../modules/auth/services/auth.service.js";
import { getBasicDetailsOfUser } from "../../modules/auth/services/user.service.js";

export const AuthServiceRegistry: AuthContract = {
  validateSalesUserService: (...args) => validateSalesUserService(...args),
  getRolesService: (...args) => getRolesService(...args),

  getAllUserIdsOfGroupByName: (...args) => getAllUserIdsOfGroupByName(...args),
  getUsersBasicDetailsService: (...args) => getUsersBasicDetailsService(...args),

  classifyUserByEmail: (...args) => classifyUserByEmail(...args),
  createAndSaveResetPasswordToken: (...args) => createAndSaveResetPasswordToken(...args),

  getBasicDetailsOfUser: (...args) => getBasicDetailsOfUser(...args),
};
