/*
  Warnings:

  - The `type` column on the `in_app_notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InAppNotificationType" AS ENUM ('GENERAL', 'SYSTEM', 'ACCOUNT', 'BILLING', 'TRANSACTION', 'SECURITY', 'PERMISSION', 'REMINDER', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "InAppNotificationSeverity" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'CRITICAL');

-- AlterTable
ALTER TABLE "in_app_notifications" ADD COLUMN     "link" TEXT,
ADD COLUMN     "severity" "InAppNotificationSeverity" NOT NULL DEFAULT 'INFO',
DROP COLUMN "type",
ADD COLUMN     "type" "InAppNotificationType" NOT NULL DEFAULT 'GENERAL';
