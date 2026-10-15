import { Prisma } from "../database/generated/prisma/client.js";

export interface SignupSchema {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  customerId: string | null;
  customerName: string | null;
}

export interface SigninSchema {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
  passwordChangedAt?: number;
  passwordResetRequired?: boolean;
}

export interface EditUserProfileSchema {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export type UserWithRoles = Prisma.UserGetPayload<{
  // include: {
  //   userRoleMap: {
  //     select: {
  //       userRoles: {
  //         select: {
  //           id: true;
  //           name: true;
  //         };
  //       };
  //     };
  //   };
  // };
}>;

export type UserSelectWithRoles = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    firstName: true;
    lastName: true;
    profileImageUrl: true;
    userRoleMap: {
      select: {
        userRoles: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;

export interface ImpersonationData {
  impersonatedUserId: string;
  impersonatedUserEmail?: string;
  sessionId: string;
  impersonatingUserId: string;
  impersonatingUserEmail?: string;
}
