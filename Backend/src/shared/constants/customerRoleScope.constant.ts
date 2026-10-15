export const CustomerMappingRoleScope = {
  CUSTOMER_SUPER_ADMIN: "customer_super_admin",
  CUSTOMER_ADMIN: "customer_admin",
  CUSTOMER_USER: "customer_user",
} as const;

export type CustomerMappingRoleScopeValue =
  (typeof CustomerMappingRoleScope)[keyof typeof CustomerMappingRoleScope];
