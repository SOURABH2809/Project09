import "dotenv/config";
import prisma from "../config/prisma.client.js";
import { UserType } from "../database/generated/prisma/client.js";
import { hashPassword } from "../utils/encryption/hash.js";

const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || "admin@test.com").trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "Admin@12345";

const seedAdmin = async () => {
  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME || "Admin",
      lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME || "User",
      passwordHash,
      accountActive: true,
      userType: UserType.INTERNAL,
      deletedAt: null,
    },
    create: {
      email,
      firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME || "Admin",
      lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME || "User",
      passwordHash,
      accountActive: true,
      userType: UserType.INTERNAL,
    },
  });

  const adminRole = await prisma.userRoles.upsert({
    where: { normalizedName: "ADMIN" },
    update: { name: "ADMIN", description: "System Administrator" },
    create: {
      name: "ADMIN",
      normalizedName: "ADMIN",
      description: "System Administrator",
      createdById: admin.id,
    },
  });

  const adminGroup = await prisma.userGroup.upsert({
    where: { normalizedName: "ADMIN" },
    update: { name: "ADMIN", description: "System Administrator Group" },
    create: {
      name: "ADMIN",
      normalizedName: "ADMIN",
      description: "System Administrator Group",
      createdById: admin.id,
    },
  });

  await prisma.userGroupMap.upsert({
    where: { userId_groupId: { userId: admin.id, groupId: adminGroup.id } },
    update: {},
    create: { userId: admin.id, groupId: adminGroup.id },
  });

  await prisma.userGroupRoleMap.upsert({
    where: { groupId_roleId: { groupId: adminGroup.id, roleId: adminRole.id } },
    update: {},
    create: { groupId: adminGroup.id, roleId: adminRole.id },
  });

  const permissions = await prisma.userPermissions.findMany({ select: { id: true } });
  await prisma.userPermissionRoleMap.createMany({
    data: permissions.map(({ id }) => ({
      roleId: adminRole.id,
      permissionId: id,
      permissionMapCreatedById: admin.id,
    })),
    skipDuplicates: true,
  });

  console.log(`Admin seed complete: ${email}`);
};

seedAdmin()
  .catch((error) => {
    console.error("Admin seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
