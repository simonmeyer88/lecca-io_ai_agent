-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_FK_defaultWorkspaceLlmConnection_fkey";

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_FK_defaultWorkspaceLlmConnection_fkey" FOREIGN KEY ("FK_defaultWorkspaceLlmConnection") REFERENCES "WorkspacePreferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
