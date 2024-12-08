/*
  Warnings:

  - Added the required column `connectionId` to the `Connection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "connectionId" TEXT NOT NULL;
