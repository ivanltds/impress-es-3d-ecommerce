-- CreateTable Universe
CREATE TABLE "Universe" (
    "id"          TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "comingSoon"  BOOLEAN NOT NULL DEFAULT false,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Universe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Universe_slug_key" ON "Universe"("slug");

-- CreateTable ProductUniverse
CREATE TABLE "ProductUniverse" (
    "productId"   TEXT NOT NULL,
    "universeId"  TEXT NOT NULL,

    CONSTRAINT "ProductUniverse_pkey" PRIMARY KEY ("productId","universeId")
);

-- CreateIndex
CREATE INDEX "ProductUniverse_universeId_idx" ON "ProductUniverse"("universeId");

-- CreateIndex
CREATE INDEX "ProductUniverse_productId_idx"  ON "ProductUniverse"("productId");

-- AddForeignKey
ALTER TABLE "ProductUniverse" ADD CONSTRAINT "ProductUniverse_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUniverse" ADD CONSTRAINT "ProductUniverse_universeId_fkey"
    FOREIGN KEY ("universeId") REFERENCES "Universe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Testimonial
CREATE TABLE "Testimonial" (
    "id"           TEXT NOT NULL,
    "authorName"   TEXT NOT NULL,
    "authorPhoto"  TEXT,
    "productPhoto" TEXT,
    "text"         TEXT NOT NULL,
    "universeId"   TEXT,
    "isPublished"  BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Testimonial_isPublished_idx" ON "Testimonial"("isPublished");

-- CreateIndex
CREATE INDEX "Testimonial_universeId_isPublished_idx" ON "Testimonial"("universeId", "isPublished");

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_universeId_fkey"
    FOREIGN KEY ("universeId") REFERENCES "Universe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
