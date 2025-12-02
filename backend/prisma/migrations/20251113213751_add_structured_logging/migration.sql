-- CreateTable
CREATE TABLE "processamento_logs" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "clienteId" TEXT,
    "loteId" TEXT,
    "jobId" TEXT,
    "etapa" TEXT NOT NULL,
    "operacao" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "detalhes" TEXT,
    "dadosEntrada" TEXT,
    "dadosSaida" TEXT,
    "transformacoes" TEXT,
    "tempoExecucaoMs" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tentativa" INTEGER NOT NULL DEFAULT 1,
    "origem" TEXT,
    "versao" TEXT,
    "validacoes" TEXT,
    "alertas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processamento_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processamento_logs_correlationId_idx" ON "processamento_logs"("correlationId");

-- CreateIndex
CREATE INDEX "processamento_logs_clienteId_idx" ON "processamento_logs"("clienteId");

-- CreateIndex
CREATE INDEX "processamento_logs_loteId_idx" ON "processamento_logs"("loteId");

-- CreateIndex
CREATE INDEX "processamento_logs_etapa_idx" ON "processamento_logs"("etapa");

-- CreateIndex
CREATE INDEX "processamento_logs_nivel_idx" ON "processamento_logs"("nivel");

-- CreateIndex
CREATE INDEX "processamento_logs_timestamp_idx" ON "processamento_logs"("timestamp");

-- CreateIndex
CREATE INDEX "processamento_logs_operacao_idx" ON "processamento_logs"("operacao");
