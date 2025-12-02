-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "enrichmentErro" TEXT,
ADD COLUMN     "enrichmentProcessadoEm" TIMESTAMP(3),
ADD COLUMN     "enrichmentStatus" TEXT NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "redesSociais" TEXT,
ADD COLUMN     "website" TEXT;
