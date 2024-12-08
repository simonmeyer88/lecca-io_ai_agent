/*
  Warnings:

  - You are about to drop the column `FK_organizationId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_FK_organizationId_fkey";

-- AlterTable
ALTER TABLE "CompanyUser" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::"CompanyUserRole"[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "FK_organizationId",
ADD COLUMN     "FK_activeCompanyId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_FK_activeCompanyId_fkey" FOREIGN KEY ("FK_activeCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
