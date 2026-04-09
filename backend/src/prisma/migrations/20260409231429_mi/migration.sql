/*
  Warnings:

  - A unique constraint covering the columns `[rollNo,contestId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Session_rollNo_key";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "boilerplateCss" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "boilerplateHtml" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "boilerplateJs" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Session_rollNo_contestId_key" ON "Session"("rollNo", "contestId");
