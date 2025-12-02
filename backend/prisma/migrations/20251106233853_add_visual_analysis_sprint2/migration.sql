-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "ambienteEstabelecimento" TEXT,
ADD COLUMN     "indicadoresVisuais" TEXT,
ADD COLUMN     "nivelProfissionalizacao" TEXT,
ADD COLUMN     "presencaBranding" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicoAlvo" TEXT,
ADD COLUMN     "qualidadeSinalizacao" TEXT;
