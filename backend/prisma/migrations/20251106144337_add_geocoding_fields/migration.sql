-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "enderecoCompleto" TEXT,
ADD COLUMN     "enderecoFormatado" TEXT,
ADD COLUMN     "geocodingErro" TEXT,
ADD COLUMN     "geocodingProcessadoEm" TIMESTAMP(3),
ADD COLUMN     "geocodingStatus" TEXT NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "placeId" TEXT;

-- CreateIndex
CREATE INDEX "clientes_geocodingStatus_idx" ON "clientes"("geocodingStatus");
