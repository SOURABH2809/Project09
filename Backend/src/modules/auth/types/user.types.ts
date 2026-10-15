import { Prisma, User } from "../database/generated/prisma/client.js";
import { UserRoles } from "./roles.types.js";

export interface GetAllUserDetails {
  email?: string | null;
  name?: string | null;
  status?: boolean | null;
  page: number;
  limit: number;
  groups: string[] | null;
  sortBy: SortableColumn;
  orderBy: Prisma.SortOrder;
}

export enum AccountStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const SORTABLE_COLUMNS = {
  createdAt: "createdAt",
  email: "email",
  firstName: "firstName",
  lastName: "lastName",
  accountActive: "accountActive",
} as const;

export type SortableColumn = keyof typeof SORTABLE_COLUMNS;

export type UserClass =
  | {
      status: "no_user_exists";
      user: null;
    }
  | {
      status: "internal_user_exists";
      user: User;
    }
  | {
      status: "customer_user_exists";
      user: User;
    };
