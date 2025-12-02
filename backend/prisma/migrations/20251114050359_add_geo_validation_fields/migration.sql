-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "geoDistanceToCenter" DOUBLE PRECISION,
ADD COLUMN     "geoValidado" BOOLEAN,
ADD COLUMN     "geoWithinCity" BOOLEAN,
ADD COLUMN     "geoWithinState" BOOLEAN;
