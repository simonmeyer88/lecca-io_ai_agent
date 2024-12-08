-- CreateTable
CREATE TABLE "CompanyPreferences" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "FK_companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPreferences_FK_companyId_key" ON "CompanyPreferences"("FK_companyId");

-- AddForeignKey
ALTER TABLE "CompanyPreferences" ADD CONSTRAINT "CompanyPreferences_FK_companyId_fkey" FOREIGN KEY ("FK_companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
