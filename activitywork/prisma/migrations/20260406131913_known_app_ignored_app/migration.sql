-- CreateTable
CREATE TABLE "KnownApp" (
    "appName" TEXT NOT NULL PRIMARY KEY,
    "firstSeenAt" DATETIME NOT NULL,
    "lastSeenAt" DATETIME NOT NULL,
    "lastTitle" TEXT
);

-- CreateTable
CREATE TABLE "IgnoredApp" (
    "appName" TEXT NOT NULL PRIMARY KEY
);
