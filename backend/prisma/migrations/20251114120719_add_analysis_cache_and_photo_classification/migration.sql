-- AddColumn
ALTER TABLE "clientes" ADD COLUMN     "tipologiaNome" TEXT;
ALTER TABLE "clientes" ADD COLUMN     "tipologiaDivergente" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "clientes" ADD COLUMN     "analysisPromptVersion" TEXT;

-- AlterColumn
ALTER TABLE "fotos" ADD COLUMN     "fileHash" TEXT;
ALTER TABLE "fotos" ADD COLUMN     "photoCategory" TEXT;
ALTER TABLE "fotos" ADD COLUMN     "photoCategoryConfidence" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "analysis_cache" (
    "id" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "analiseResultado" TEXT NOT NULL,
    "tipologia" TEXT,
    "tipologiaNome" TEXT,
    "confianca" DOUBLE PRECISION,
    "promptVersion" TEXT,
    "modelUsed" TEXT,
    "timesUsed" INTEGER NOT NULL DEFAULT 1,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_versions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analysis_cache_fileHash_key" ON "analysis_cache"("fileHash");

-- CreateIndex
CREATE INDEX "analysis_cache_fileHash_idx" ON "analysis_cache"("fileHash");

-- CreateIndex
CREATE INDEX "analysis_cache_tipologia_idx" ON "analysis_cache"("tipologia");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_versions_name_version_key" ON "prompt_versions"("name", "version");

-- CreateIndex
CREATE INDEX "prompt_versions_name_isActive_idx" ON "prompt_versions"("name", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "fotos_fileHash_key" ON "fotos"("fileHash");

-- CreateIndex
CREATE INDEX "fotos_fileHash_idx" ON "fotos"("fileHash");
