import { Job } from 'bull';
import { PrismaClient } from '@prisma/client';
import { receitaQueue } from '../queues/queue.config';
import { ReceitaService } from '../services/receita.service';
import { AddressNormalizationService } from '../services/address-normalization.service';
import StructuredLoggerService, {
  Etapa,
  Operacao,
  LogLevel,
} from '../services/structured-logger.service';

const prisma = new PrismaClient();
const receitaService = new ReceitaService();
const normalizationService = new AddressNormalizationService();
const logger = new StructuredLoggerService();

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
  enderecoNormalizado?: boolean;
  error?: string;
  correlationId?: string;
}

receitaQueue.process(async (job: Job<ReceitaJobData>): Promise<ReceitaJobResult> => {
  const { clienteId, loteId } = job.data;

  // Gerar correlation ID único para rastrear toda a jornada
  const correlationId = StructuredLoggerService.generateCorrelationId();

  // Contexto base do log
  const baseContext = {
    correlationId,
    clienteId,
    loteId,
    jobId: String(job.id),
    etapa: Etapa.RECEITA,
    origem: 'receita.worker',
    tentativa: job.attemptsMade + 1,
  };

  // Iniciar tracking de performance
  const perfTrackingId = `receita-${clienteId}`;
  logger.startPerformanceTracking(perfTrackingId, 'RECEITA_COMPLETO');

  try {
    // LOG: Buscar cliente no banco
    await logger.log({ ...baseContext, operacao: Operacao.DATABASE_READ }, {
      mensagem: 'Buscando dados do cliente no banco de dados',
      nivel: LogLevel.DEBUG,
    });

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
      await logger.logErro(baseContext, 'Cliente não encontrado no banco de dados', new Error('Cliente não encontrado'));
      throw new Error(`Cliente ${clienteId} não encontrado`);
    }

    // LOG: Início do processamento
    await logger.logInicio(baseContext, `Iniciando enriquecimento de dados: ${cliente.nome}`, {
      nome: cliente.nome,
      cnpj: cliente.cnpj,
      endereco: cliente.endereco,
      cidade: cliente.cidade,
      estado: cliente.estado,
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 INICIANDO ENRIQUECIMENTO: ${cliente.nome} [${correlationId.substring(0, 8)}]`);
    console.log(`${'='.repeat(60)}`);

    // ====================================================================
    // ETAPA 1: Consultar Receita Federal (se tiver CNPJ)
    // ====================================================================
    let cnpjEncontrado = false;
    let divergenciaEndereco = false;
    let enderecoParaNormalizar = cliente.endereco;
    const dadosReceita: any = {};

    if (cliente.cnpj && receitaService.validarCNPJ(cliente.cnpj)) {
      console.log(`\n🔍 ETAPA 1: Buscando dados na Receita Federal`);
      console.log(`   CNPJ: ${cliente.cnpj}`);

      await logger.log({ ...baseContext, operacao: Operacao.VALIDACAO }, {
        mensagem: 'Validando CNPJ e consultando Receita Federal',
        nivel: LogLevel.INFO,
        validacoes: {
          cnpjValido: true,
          cnpj: cliente.cnpj,
        },
      });

      // Atualizar status
      await prisma.cliente.update({
        where: { id: clienteId },
        data: {
          receitaStatus: 'PROCESSANDO',
          receitaIniciadoEm: new Date(),
        },
      });

      // Iniciar tracking da API call
      const apiTrackingId = `receita-api-${clienteId}`;
      logger.startPerformanceTracking(apiTrackingId, 'RECEITA_API_CALL');

      const receitaResult = await receitaService.consultarCNPJ(cliente.cnpj);
      const apiTime = logger.endPerformanceTracking(apiTrackingId);

      // LOG: Resultado da chamada da API
      await logger.logApiCall(baseContext, 'Consulta à Receita Federal concluída', {
        success: receitaResult.success,
        cnpj: cliente.cnpj,
        statusCode: receitaResult.success ? 200 : 500,
      }, apiTime);

      if (receitaResult.success && receitaResult.data) {
        const dados = receitaResult.data;
        cnpjEncontrado = true;

        console.log(`   ✅ Empresa encontrada: ${dados.razaoSocial}`);
        console.log(`   Nome Fantasia: ${dados.nomeFantasia || 'N/A'}`);
        console.log(`   Situação: ${dados.situacao}`);

        dadosReceita.razaoSocial = dados.razaoSocial;
        dadosReceita.nomeFantasia = dados.nomeFantasia;
        dadosReceita.situacao = dados.situacao;

        // Comparar endereços
        const enderecoCliente = `${cliente.endereco}, ${cliente.cidade || ''}`;
        const comparacao = receitaService.compararEnderecos(
          enderecoCliente,
          dados.enderecoCompleto
        );

        divergenciaEndereco = !comparacao.similar;

        // LOG: Validação de endereço
        await logger.logValidacao(baseContext, 'Comparação de endereços concluída', {
          enderecoCliente,
          enderecoReceita: dados.enderecoCompleto,
          similaridade: comparacao.similarity,
          divergencia: divergenciaEndereco,
        }, divergenciaEndereco ? LogLevel.WARN : LogLevel.INFO);

        if (divergenciaEndereco) {
          console.log(`   ⚠️  DIVERGÊNCIA DE ENDEREÇO (${comparacao.similarity}% similar)`);
          console.log(`   Planilha: ${enderecoCliente}`);
          console.log(`   Receita:  ${dados.enderecoCompleto}`);

          await logger.logAlerta({ ...baseContext, operacao: Operacao.VALIDACAO }, 'Divergência de endereço detectada', [
            `Similaridade: ${comparacao.similarity}%`,
            `Endereço da planilha difere do cadastro da Receita Federal`,
          ], {
            enderecoCliente,
            enderecoReceita: dados.enderecoCompleto,
          });
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

        // LOG: Dados salvos no banco
        await logger.log({ ...baseContext, operacao: Operacao.DATABASE_WRITE }, {
          mensagem: 'Dados da Receita Federal salvos no banco de dados',
          nivel: LogLevel.INFO,
          dadosSaida: {
            razaoSocial: dados.razaoSocial,
            nomeFantasia: dados.nomeFantasia,
            situacao: dados.situacao,
          },
        });

        // Se endereço da Receita for mais completo, usar ele para normalização
        if (!divergenciaEndereco && dados.endereco) {
          enderecoParaNormalizar = dados.enderecoCompleto;
          console.log(`   📍 Usando endereço da Receita para próximas etapas`);
        }
      } else {
        console.log(`   ❌ CNPJ não encontrado: ${receitaResult.error}`);

        await logger.logErro(baseContext, 'Falha ao consultar CNPJ na Receita Federal',
          new Error(receitaResult.error || 'Erro desconhecido'),
          { cnpj: cliente.cnpj }
        );

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
      console.log(`\n⏭️  ETAPA 1: Pulando Receita Federal (sem CNPJ válido)`);

      await logger.log({ ...baseContext, operacao: Operacao.VALIDACAO }, {
        mensagem: 'CNPJ não disponível ou inválido, pulando consulta à Receita Federal',
        nivel: LogLevel.INFO,
        validacoes: {
          cnpjValido: false,
          cnpj: cliente.cnpj || null,
        },
      });

      await prisma.cliente.update({
        where: { id: clienteId },
        data: {
          receitaStatus: 'NAO_APLICAVEL',
          receitaProcessadoEm: new Date(),
        },
      });
    }

    // ====================================================================
    // ETAPA 2: Normalizar endereço com IA (expandir abreviações)
    // ====================================================================
    console.log(`\n🔄 ETAPA 2: Normalizando endereço com IA`);
    console.log(`   Endereço original: ${enderecoParaNormalizar}`);

    const normTrackingId = `norm-${clienteId}`;
    logger.startPerformanceTracking(normTrackingId, 'NORMALIZACAO_ENDERECO');

    const normalizacaoResult = await normalizationService.normalizarEndereco(
      enderecoParaNormalizar
    );

    const normTime = logger.endPerformanceTracking(normTrackingId);

    let enderecoNormalizado = false;

    if (normalizacaoResult.success && normalizacaoResult.enderecoNormalizado) {
      enderecoNormalizado = true;

      console.log(`   ✅ Endereço normalizado: ${normalizacaoResult.enderecoNormalizado}`);

      if (normalizacaoResult.alteracoes && normalizacaoResult.alteracoes.length > 0) {
        console.log(`   Alterações: ${normalizacaoResult.alteracoes.join(', ')}`);
      }

      // LOG: Transformação de dados
      await logger.logTransformacao(
        baseContext,
        'Endereço normalizado com sucesso',
        { enderecoOriginal: enderecoParaNormalizar },
        { enderecoNormalizado: normalizacaoResult.enderecoNormalizado },
        normalizacaoResult.alteracoes || []
      );

      await prisma.cliente.update({
        where: { id: clienteId },
        data: {
          enderecoNormalizado: normalizacaoResult.enderecoNormalizado,
          alteracoesNormalizacao: normalizacaoResult.alteracoes
            ? JSON.stringify(normalizacaoResult.alteracoes)
            : null,
        },
      });
    } else {
      console.log(`   ⚠️  Falha na normalização: ${normalizacaoResult.error}`);

      await logger.logAlerta({ ...baseContext, operacao: Operacao.TRANSFORMACAO }, 'Falha na normalização, usando endereço original', [
        'Normalização de endereço falhou',
        'Usando endereço original para próximas etapas',
      ], {
        erro: normalizacaoResult.error,
        enderecoOriginal: enderecoParaNormalizar,
      });

      // Se falhou, usar endereço original mesmo
      await prisma.cliente.update({
        where: { id: clienteId },
        data: {
          enderecoNormalizado: enderecoParaNormalizar,
          alteracoesNormalizacao: JSON.stringify(['Normalização falhou - usando original']),
        },
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ ENRIQUECIMENTO CONCLUÍDO: ${cliente.nome}`);
    console.log(`${'='.repeat(60)}\n`);

    // Finalizar tracking de performance total
    const totalTime = logger.endPerformanceTracking(perfTrackingId);

    // LOG: Conclusão do processamento
    await logger.logConclusao(
      baseContext,
      `Enriquecimento concluído com sucesso: ${cliente.nome}`,
      {
        ...dadosReceita,
        enderecoNormalizado: normalizacaoResult.enderecoNormalizado,
        cnpjEncontrado,
        divergenciaEndereco,
      },
      [
        cnpjEncontrado ? 'Dados da Receita Federal obtidos' : 'CNPJ não consultado',
        enderecoNormalizado ? 'Endereço normalizado com IA' : 'Endereço não normalizado',
        divergenciaEndereco ? 'Divergência de endereço detectada' : 'Endereço validado',
      ],
      totalTime
    );

    return {
      success: true,
      clienteId,
      nome: cliente.nome,
      cnpjEncontrado,
      divergenciaEndereco,
      enderecoNormalizado,
      correlationId,
    };
  } catch (error: any) {
    console.error(`❌ Erro ao processar cliente ${clienteId}:`, error.message);

    const totalTime = logger.endPerformanceTracking(perfTrackingId);

    // LOG: Erro fatal
    await logger.logErro(baseContext, `Erro fatal no processamento: ${error.message}`, error, {
      tempoTotal: totalTime,
      tentativa: job.attemptsMade + 1,
      maxTentativas: job.opts.attempts,
    });

    // Marcar como erro no banco
    await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        receitaStatus: 'FALHA',
        receitaProcessadoEm: new Date(),
        receitaErro: error.message,
      },
    });

    return {
      success: false,
      clienteId,
      nome: 'ERRO',
      error: error.message,
      correlationId,
    };
  }
});

// Event handlers
receitaQueue.on('completed', (job: Job, result: ReceitaJobResult) => {
  if (result.success) {
    console.log(`✅ Job Receita concluído: ${result.nome} [Correlation: ${result.correlationId?.substring(0, 8)}]`);
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
