/*
  Warnings:

  - The values [ADMIN] on the enum `WorkspaceUserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WorkspaceUserRole_new" AS ENUM ('OWNER', 'MAINTAINER', 'MEMBER');
ALTER TABLE "WorkspaceInvitation" ALTER COLUMN "roles" DROP DEFAULT;
ALTER TABLE "WorkspaceUser" ALTER COLUMN "roles" DROP DEFAULT;
ALTER TABLE "WorkspaceUser" ALTER COLUMN "roles" TYPE "WorkspaceUserRole_new"[] USING ("roles"::text::"WorkspaceUserRole_new"[]);
ALTER TABLE "WorkspaceInvitation" ALTER COLUMN "roles" TYPE "WorkspaceUserRole_new"[] USING ("roles"::text::"WorkspaceUserRole_new"[]);
ALTER TYPE "WorkspaceUserRole" RENAME TO "WorkspaceUserRole_old";
ALTER TYPE "WorkspaceUserRole_new" RENAME TO "WorkspaceUserRole";
DROP TYPE "WorkspaceUserRole_old";
ALTER TABLE "WorkspaceInvitation" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::"WorkspaceUserRole"[];
ALTER TABLE "WorkspaceUser" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::"WorkspaceUserRole"[];
COMMIT;
