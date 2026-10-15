-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('INTERNAL', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('Google', 'Azure');

-- CreateEnum
CREATE TYPE "CustomerAuditStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "passwordHash" TEXT,
    "passwordChangedAt" TIMESTAMP(3),
    "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false,
    "accountActive" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastLoginFailedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "userType" "UserType" NOT NULL DEFAULT 'INTERNAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_group_map" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_group_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_group_role_map" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_group_role_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "description" TEXT,
    "action" TEXT NOT NULL,
    "resourceKey" TEXT NOT NULL,
    "resourceName" TEXT NOT NULL,
    "subFeatureKey" TEXT,
    "subFeatureName" TEXT,
    "pageKey" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "permissionCreatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "permissionUpdatedById" TEXT,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permission_role_map" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "permissionMapDeletedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "permissionMapCreatedById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "permissionMapUpdatedById" TEXT,

    CONSTRAINT "user_permission_role_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_identity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_customer_mapping" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "roleScope" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_customer_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customer_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "description" TEXT,
    "customerId" UUID,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customer_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_role_permissions" (
    "id" TEXT NOT NULL,
    "customerRoleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "description" TEXT,
    "customerId" UUID NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_user_role_map" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerRoleId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_user_role_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_user_group_map" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_user_group_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_group_role_map" (
    "id" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,
    "customerRoleId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_group_role_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_active_customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_active_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_activity_logs" (
    "id" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorUserName" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "resourceName" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "status" "CustomerAuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_context_switch_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromCustomerId" UUID,
    "toCustomerId" UUID NOT NULL,
    "status" "CustomerAuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "previousContextDurationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_context_switch_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_groups_name_key" ON "user_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_groups_normalizedName_key" ON "user_groups"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "user_group_map_userId_groupId_key" ON "user_group_map"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_name_key" ON "user_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_normalizedName_key" ON "user_roles"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "user_group_role_map_groupId_roleId_key" ON "user_group_role_map"("groupId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_name_key" ON "user_permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_normalizedName_key" ON "user_permissions"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "user_permission_role_map_roleId_permissionId_deletedAt_key" ON "user_permission_role_map"("roleId", "permissionId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_identity_provider_providerUserId_key" ON "user_identity"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "user_customer_mapping_userId_idx" ON "user_customer_mapping"("userId");

-- CreateIndex
CREATE INDEX "user_customer_mapping_customerId_idx" ON "user_customer_mapping"("customerId");

-- CreateIndex
CREATE INDEX "user_customer_mapping_isActive_idx" ON "user_customer_mapping"("isActive");

-- CreateIndex
CREATE INDEX "user_customer_mapping_createdById_idx" ON "user_customer_mapping"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "user_customer_mapping_userId_customerId_key" ON "user_customer_mapping"("userId", "customerId");

-- CreateIndex
CREATE INDEX "customer_admins_customerId_idx" ON "customer_admins"("customerId");

-- CreateIndex
CREATE INDEX "customer_admins_userId_idx" ON "customer_admins"("userId");

-- CreateIndex
CREATE INDEX "customer_admins_isActive_idx" ON "customer_admins"("isActive");

-- CreateIndex
CREATE INDEX "customer_admins_deletedAt_idx" ON "customer_admins"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "customer_admins_userId_customerId_key" ON "customer_admins"("userId", "customerId");

-- CreateIndex
CREATE INDEX "customer_roles_customerId_idx" ON "customer_roles"("customerId");

-- CreateIndex
CREATE INDEX "customer_roles_createdById_idx" ON "customer_roles"("createdById");

-- CreateIndex
CREATE INDEX "customer_roles_deletedAt_idx" ON "customer_roles"("deletedAt");

-- CreateIndex
CREATE INDEX "customer_role_permissions_customerRoleId_idx" ON "customer_role_permissions"("customerRoleId");

-- CreateIndex
CREATE INDEX "customer_role_permissions_permissionId_idx" ON "customer_role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_role_permissions_customerRoleId_permissionId_key" ON "customer_role_permissions"("customerRoleId", "permissionId");

-- CreateIndex
CREATE INDEX "customer_groups_customerId_idx" ON "customer_groups"("customerId");

-- CreateIndex
CREATE INDEX "customer_groups_createdById_idx" ON "customer_groups"("createdById");

-- CreateIndex
CREATE INDEX "customer_groups_deletedAt_idx" ON "customer_groups"("deletedAt");

-- CreateIndex
CREATE INDEX "customer_user_role_map_userId_idx" ON "customer_user_role_map"("userId");

-- CreateIndex
CREATE INDEX "customer_user_role_map_customerRoleId_idx" ON "customer_user_role_map"("customerRoleId");

-- CreateIndex
CREATE INDEX "customer_user_role_map_customerId_idx" ON "customer_user_role_map"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_user_role_map_userId_customerRoleId_key" ON "customer_user_role_map"("userId", "customerRoleId");

-- CreateIndex
CREATE INDEX "customer_user_group_map_userId_idx" ON "customer_user_group_map"("userId");

-- CreateIndex
CREATE INDEX "customer_user_group_map_customerGroupId_idx" ON "customer_user_group_map"("customerGroupId");

-- CreateIndex
CREATE INDEX "customer_user_group_map_customerId_idx" ON "customer_user_group_map"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_user_group_map_userId_customerGroupId_key" ON "customer_user_group_map"("userId", "customerGroupId");

-- CreateIndex
CREATE INDEX "customer_group_role_map_customerGroupId_idx" ON "customer_group_role_map"("customerGroupId");

-- CreateIndex
CREATE INDEX "customer_group_role_map_customerRoleId_idx" ON "customer_group_role_map"("customerRoleId");

-- CreateIndex
CREATE INDEX "customer_group_role_map_customerId_idx" ON "customer_group_role_map"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_group_role_map_customerGroupId_customerRoleId_key" ON "customer_group_role_map"("customerGroupId", "customerRoleId");

-- CreateIndex
CREATE INDEX "user_active_customer_customerId_idx" ON "user_active_customer"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "user_active_customer_userId_key" ON "user_active_customer"("userId");

-- CreateIndex
CREATE INDEX "customer_activity_logs_customerId_createdAt_idx" ON "customer_activity_logs"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "customer_activity_logs_actorUserId_createdAt_idx" ON "customer_activity_logs"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "customer_activity_logs_actionType_idx" ON "customer_activity_logs"("actionType");

-- CreateIndex
CREATE INDEX "customer_context_switch_logs_userId_createdAt_idx" ON "customer_context_switch_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "customer_context_switch_logs_toCustomerId_createdAt_idx" ON "customer_context_switch_logs"("toCustomerId", "createdAt");

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_map" ADD CONSTRAINT "user_group_map_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_map" ADD CONSTRAINT "user_group_map_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "user_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_role_map" ADD CONSTRAINT "user_group_role_map_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "user_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_role_map" ADD CONSTRAINT "user_group_role_map_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionCreatedById_fkey" FOREIGN KEY ("permissionCreatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissionUpdatedById_fkey" FOREIGN KEY ("permissionUpdatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission_role_map" ADD CONSTRAINT "user_permission_role_map_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission_role_map" ADD CONSTRAINT "user_permission_role_map_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "user_permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission_role_map" ADD CONSTRAINT "user_permission_role_map_permissionMapDeletedById_fkey" FOREIGN KEY ("permissionMapDeletedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission_role_map" ADD CONSTRAINT "user_permission_role_map_permissionMapCreatedById_fkey" FOREIGN KEY ("permissionMapCreatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission_role_map" ADD CONSTRAINT "user_permission_role_map_permissionMapUpdatedById_fkey" FOREIGN KEY ("permissionMapUpdatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_identity" ADD CONSTRAINT "user_identity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_customer_mapping" ADD CONSTRAINT "user_customer_mapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_customer_mapping" ADD CONSTRAINT "user_customer_mapping_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_admins" ADD CONSTRAINT "customer_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_admins" ADD CONSTRAINT "customer_admins_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_roles" ADD CONSTRAINT "customer_roles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_roles" ADD CONSTRAINT "customer_roles_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_role_permissions" ADD CONSTRAINT "customer_role_permissions_customerRoleId_fkey" FOREIGN KEY ("customerRoleId") REFERENCES "customer_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_role_permissions" ADD CONSTRAINT "customer_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "user_permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_role_permissions" ADD CONSTRAINT "customer_role_permissions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_groups" ADD CONSTRAINT "customer_groups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_groups" ADD CONSTRAINT "customer_groups_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_user_role_map" ADD CONSTRAINT "customer_user_role_map_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_user_role_map" ADD CONSTRAINT "customer_user_role_map_customerRoleId_fkey" FOREIGN KEY ("customerRoleId") REFERENCES "customer_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_user_role_map" ADD CONSTRAINT "customer_user_role_map_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_user_group_map" ADD CONSTRAINT "customer_user_group_map_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_user_group_map" ADD CONSTRAINT "customer_user_group_map_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_user_group_map" ADD CONSTRAINT "customer_user_group_map_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_role_map" ADD CONSTRAINT "customer_group_role_map_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_role_map" ADD CONSTRAINT "customer_group_role_map_customerRoleId_fkey" FOREIGN KEY ("customerRoleId") REFERENCES "customer_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_role_map" ADD CONSTRAINT "customer_group_role_map_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_active_customer" ADD CONSTRAINT "user_active_customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_activity_logs" ADD CONSTRAINT "customer_activity_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_context_switch_logs" ADD CONSTRAINT "customer_context_switch_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
