-- CreateEnum
CREATE TYPE "CompanyUserPreferencesTheme" AS ENUM ('DARK', 'LIGHT');

-- CreateTable
CREATE TABLE "CompanyUserPreferences" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "theme" "CompanyUserPreferencesTheme" NOT NULL DEFAULT 'LIGHT',
    "FK_companyUserId" TEXT NOT NULL,

    CONSTRAINT "CompanyUserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyUserPreferences_FK_companyUserId_key" ON "CompanyUserPreferences"("FK_companyUserId");

-- AddForeignKey
ALTER TABLE "CompanyUserPreferences" ADD CONSTRAINT "CompanyUserPreferences_FK_companyUserId_fkey" FOREIGN KEY ("FK_companyUserId") REFERENCES "CompanyUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
