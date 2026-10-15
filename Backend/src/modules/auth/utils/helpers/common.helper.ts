export const formatUserRoles = (
  userRoleMap: Array<{ userRoles: { id: string; name: string } }>,
) => {
  return userRoleMap.map((role) => ({ ...role.userRoles }));
};

export const sanitizeString = (value: string | null | undefined): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};
