export interface AddRoleSchema {
  name: string;
  normalizedName: string;
  description: string | null;
  userId: string;
}

export interface UserRolesSchema {
  groupToAssign: string;
  roles: string[];
}

export interface UserRoles {
  id: string;
  name: string;
  normalizedName: string;
}
