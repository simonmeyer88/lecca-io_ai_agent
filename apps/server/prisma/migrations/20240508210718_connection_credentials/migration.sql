-- AlterTable
ALTER TABLE "Connection" ADD COLUMN     "accessToken" VARCHAR,
ADD COLUMN     "apiKey" VARCHAR,
ADD COLUMN     "password" VARCHAR,
ADD COLUMN     "refreshToken" VARCHAR,
ADD COLUMN     "username" VARCHAR;
