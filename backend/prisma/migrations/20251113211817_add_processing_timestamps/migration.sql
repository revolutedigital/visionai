-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "geocodingIniciadoEm" TIMESTAMP(3),
ADD COLUMN     "placesIniciadoEm" TIMESTAMP(3),
ADD COLUMN     "receitaIniciadoEm" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "processamentos_lote" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "iniciadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizadoEm" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "totalClientes" INTEGER NOT NULL,
    "processados" INTEGER NOT NULL DEFAULT 0,
    "sucesso" INTEGER NOT NULL DEFAULT 0,
    "falhas" INTEGER NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processamentos_lote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processamentos_lote_tipo_idx" ON "processamentos_lote"("tipo");

-- CreateIndex
CREATE INDEX "processamentos_lote_iniciadoEm_idx" ON "processamentos_lote"("iniciadoEm");
