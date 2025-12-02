import { Job } from 'bull';
import { PrismaClient } from '@prisma/client';
import { receitaQueue } from '../queues/queue.config';
import { ReceitaService } from '../services/receita.service';

const prisma = new PrismaClient();
const receitaService = new ReceitaService();

interface ReceitaJobData {
  clienteId: string;
  loteId?: string;
}

interface ReceitaJobResult {
  success: boolean;
  clienteId: string;
  nome: string;
  cnpjEncontrado?: boolean;
  divergenciaEndereco?: boolean;
  error?: string;
}

/**
 * Receita Worker
 *
 * APENAS consulta Receita Federal
 * Normalização foi movida para normalization.worker.ts
 */
receitaQueue.process(async (job: Job<ReceitaJobData>): Promise<ReceitaJobResult> => {
  const { clienteId, loteId } = job.data;

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        endereco: true,
        cidade: true,
        estado: true,
        cep: true,
      },
    });

    if (!cliente) {
      throw new Error(`Cliente ${clienteId} não encontrado`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 RECEITA FEDERAL: ${cliente.nome}`);
    console.log(`${'='.repeat(60)}`);

    let cnpjEncontrado = false;
    let divergenciaEndereco = false;

    if (cliente.cnpj && receitaService.validarCNPJ(cliente.cnpj)) {
      console.log(`\n🔍 Buscando dados na Receita Federal`);
      console.log(`   CNPJ: ${cliente.cnpj}`);

      await prisma.cliente.update({
        where: { id: clienteId },
        data: {
          receitaStatus: 'PROCESSANDO',
          receitaIniciadoEm: new Date(),
        },
      });

      const receitaResult = await receitaService.consultarCNPJ(cliente.cnpj);

      if (receitaResult.success && receitaResult.data) {
        const dados = receitaResult.data;
        cnpjEncontrado = true;

        console.log(`   ✅ Empresa encontrada: ${dados.razaoSocial}`);
        console.log(`   Nome Fantasia: ${dados.nomeFantasia || 'N/A'}`);
        console.log(`   Situação: ${dados.situacao}`);

        // Comparar endereços
        const enderecoCliente = `${cliente.endereco}, ${cliente.cidade || ''}`;
        const comparacao = receitaService.compararEnderecos(
          enderecoCliente,
          dados.enderecoCompleto
        );

        divergenciaEndereco = !comparacao.similar;

        if (divergenciaEndereco) {
          console.log(`   ⚠️  DIVERGÊNCIA DE ENDEREÇO (${comparacao.similarity}% similar)`);
          console.log(`   Planilha: ${enderecoCliente}`);
          console.log(`   Receita:  ${dados.enderecoCompleto}`);
        } else {
          console.log(`   ✅ Endereço validado (${comparacao.similarity}% similar)`);
        }

        // Atualizar banco com dados da Receita
        await prisma.cliente.update({
          where: { id: clienteId },
          data: {
            receitaStatus: 'SUCESSO',
            receitaProcessadoEm: new Date(),
            razaoSocial: dados.razaoSocial,
            nomeFantasia: dados.nomeFantasia,
            enderecoReceita: dados.enderecoCompleto,
            situacaoReceita: dados.situacao,
            dataAberturaReceita: dados.dataAbertura,
            naturezaJuridica: dados.naturezaJuridica,
            atividadePrincipal: dados.atividadePrincipal,
            divergenciaEndereco,
            similaridadeEndereco: comparacao.similarity,
          },
        });
      } else {
        console.log(`   ❌ CNPJ não encontrado: ${receitaResult.error}`);

        await prisma.cliente.update({
          where: { id: clienteId },
          data: {
            receitaStatus: 'FALHA',
            receitaProcessadoEm: new Date(),
            receitaErro: receitaResult.error,
          },
        });
      }
    } else {
      console.log(`\n⏭️  Pulando Receita Federal (sem CNPJ válido)`);

      await prisma.cliente.update({
        where: { id: clienteId },
        data: {
          receitaStatus: 'NAO_APLICAVEL',
          receitaProcessadoEm: new Date(),
        },
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ RECEITA FEDERAL CONCLUÍDA: ${cliente.nome}`);
    console.log(`${'='.repeat(60)}\n`);

    // Atualizar processamento em lote
    if (loteId) {
      await prisma.processamentoLote.update({
        where: { id: loteId },
        data: {
          processados: { increment: 1 },
          sucesso: { increment: 1 },
        },
      });
    }

    return {
      success: true,
      clienteId,
      nome: cliente.nome,
      cnpjEncontrado,
      divergenciaEndereco,
    };
  } catch (error: any) {
    console.error(`❌ Erro ao processar cliente ${clienteId}:`, error.message);

    await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        receitaStatus: 'FALHA',
        receitaProcessadoEm: new Date(),
        receitaErro: error.message,
      },
    });

    if (loteId) {
      await prisma.processamentoLote.update({
        where: { id: loteId },
        data: {
          processados: { increment: 1 },
          falhas: { increment: 1 },
        },
      });
    }

    return {
      success: false,
      clienteId,
      nome: 'ERRO',
      error: error.message,
    };
  }
});

// Event handlers
receitaQueue.on('completed', (job: Job, result: ReceitaJobResult) => {
  if (result.success) {
    console.log(`✅ Job Receita concluído: ${result.nome}`);
  }
});

receitaQueue.on('failed', (job: Job, error: Error) => {
  console.error(`❌ Job Receita falhou: ${job.data.clienteId}`, error.message);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Encerrando worker Receita...');
  await receitaQueue.close();
  await prisma.$disconnect();
  process.exit(0);
});

export default receitaQueue;
