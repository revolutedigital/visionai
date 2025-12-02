-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "crossValidationConfianca" INTEGER,
ADD COLUMN     "crossValidationDivergencias" TEXT,
ADD COLUMN     "crossValidationMetodo" TEXT,
ADD COLUMN     "nearbyPlaceId" TEXT,
ADD COLUMN     "textPlaceId" TEXT;
