-- CreateTable
CREATE TABLE "planilhas" (
    "id" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PROCESSANDO',
    "totalLinhas" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planilhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "planilhaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "tipoServico" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clientes_nome_idx" ON "clientes"("nome");

-- CreateIndex
CREATE INDEX "clientes_status_idx" ON "clientes"("status");

-- CreateIndex
CREATE INDEX "clientes_planilhaId_idx" ON "clientes"("planilhaId");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_planilhaId_fkey" FOREIGN KEY ("planilhaId") REFERENCES "planilhas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
