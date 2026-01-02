-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "secret_hash" TEXT NOT NULL,
    "creation_date" DATETIME NOT NULL
);
