-- CreateTable
CREATE TABLE "CompanyInvitation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "roles" "CompanyUserRole"[] DEFAULT ARRAY[]::"CompanyUserRole"[],
    "FK_companyId" TEXT NOT NULL,

    CONSTRAINT "CompanyInvitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompanyInvitation" ADD CONSTRAINT "CompanyInvitation_FK_companyId_fkey" FOREIGN KEY ("FK_companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
