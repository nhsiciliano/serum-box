/*
  Warnings:

  - You are about to drop the column `lastPaymentFailed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paypalSubscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionCancelDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastPaymentFailed",
DROP COLUMN "paypalSubscriptionId",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "subscriptionCancelDate",
DROP COLUMN "subscriptionStatus",
ALTER COLUMN "planType" SET DEFAULT 'full',
ALTER COLUMN "maxGrids" SET DEFAULT 999999,
ALTER COLUMN "maxTubes" SET DEFAULT 999999,
ALTER COLUMN "isUnlimited" SET DEFAULT true;

-- DropTable
DROP TABLE "Transaction";
