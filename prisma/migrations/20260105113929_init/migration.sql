/*
  Warnings:

  - Added the required column `userId` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "session_hash" TEXT NOT NULL
);
INSERT INTO "new_Session" ("id", "session_hash", "username") SELECT "id", "session_hash", "username" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_session_hash_key" ON "Session"("session_hash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
