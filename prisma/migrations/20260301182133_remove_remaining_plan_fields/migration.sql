/*
  Warnings:

  - You are about to drop the column `planEndDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `planStartDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `planType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndsAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "planEndDate",
DROP COLUMN "planStartDate",
DROP COLUMN "planType",
DROP COLUMN "trialEndsAt";
