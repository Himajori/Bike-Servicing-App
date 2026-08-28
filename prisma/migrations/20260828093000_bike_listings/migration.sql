-- CreateTable
CREATE TABLE "BikeListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "color" TEXT,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "city" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sellerName" TEXT NOT NULL,
    "sellerEmail" TEXT NOT NULL,
    "sellerPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'FOR_SALE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
