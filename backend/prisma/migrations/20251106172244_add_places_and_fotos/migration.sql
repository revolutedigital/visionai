-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "horarioFuncionamento" TEXT,
ADD COLUMN     "placesErro" TEXT,
ADD COLUMN     "placesProcessadoEm" TIMESTAMP(3),
ADD COLUMN     "placesStatus" TEXT NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "potencialCategoria" TEXT,
ADD COLUMN     "potencialScore" INTEGER,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "telefonePlace" TEXT,
ADD COLUMN     "tipoEstabelecimento" TEXT,
ADD COLUMN     "totalAvaliacoes" INTEGER,
ADD COLUMN     "websitePlace" TEXT;

-- CreateTable
CREATE TABLE "fotos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "photoReference" TEXT NOT NULL,
    "url" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "analisadaPorIA" BOOLEAN NOT NULL DEFAULT false,
    "analiseResultado" TEXT,
    "analiseEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fotos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fotos_clienteId_idx" ON "fotos"("clienteId");

-- CreateIndex
CREATE INDEX "fotos_analisadaPorIA_idx" ON "fotos"("analisadaPorIA");

-- CreateIndex
CREATE INDEX "clientes_placesStatus_idx" ON "clientes"("placesStatus");

-- CreateIndex
CREATE INDEX "clientes_potencialCategoria_idx" ON "clientes"("potencialCategoria");

-- AddForeignKey
ALTER TABLE "fotos" ADD CONSTRAINT "fotos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
