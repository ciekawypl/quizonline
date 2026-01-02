/*
  Warnings:

  - A unique constraint covering the columns `[session_hash]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_session_hash_key" ON "User"("session_hash");
