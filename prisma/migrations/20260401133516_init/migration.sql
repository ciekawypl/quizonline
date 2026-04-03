-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "endedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quizId" TEXT NOT NULL,
    CONSTRAINT "Game_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("endedAt", "id", "quizId") SELECT "endedAt", "id", "quizId" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE TABLE "new_Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "gameId" INTEGER NOT NULL,
    CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Player" ("gameId", "id", "name", "userId") SELECT "gameId", "id", "name", "userId" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE TABLE "new_Solution" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "answerId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    CONSTRAINT "Solution_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Solution_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Solution_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Solution" ("answerId", "id", "playerId", "questionId") SELECT "answerId", "id", "playerId", "questionId" FROM "Solution";
DROP TABLE "Solution";
ALTER TABLE "new_Solution" RENAME TO "Solution";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
