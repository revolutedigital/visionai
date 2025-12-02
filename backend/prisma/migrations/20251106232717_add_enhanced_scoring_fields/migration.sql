-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "densidadeAvaliacoes" DOUBLE PRECISION,
ADD COLUMN     "diasAbertoPorSemana" INTEGER,
ADD COLUMN     "scoreAvaliacoes" DOUBLE PRECISION,
ADD COLUMN     "scoreDensidadeReviews" DOUBLE PRECISION,
ADD COLUMN     "scoreFotosQualidade" DOUBLE PRECISION,
ADD COLUMN     "scoreHorarioFunc" DOUBLE PRECISION,
ADD COLUMN     "scoreRating" DOUBLE PRECISION,
ADD COLUMN     "scoreWebsite" DOUBLE PRECISION,
ADD COLUMN     "scoringBreakdown" TEXT,
ADD COLUMN     "tempoAbertoSemanal" INTEGER;
