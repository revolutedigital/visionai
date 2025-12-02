import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { logger } from './logger';
import { successToast, errorToast, loadingToast, dismissLoadingToast } from './toast';

/**
 * Utilitários para exportar dados do sistema
 */

/**
 * Exportar dados como JSON
 */
export function exportToJSON(data: any, filename: string = 'export.json') {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, filename);

    logger.info(`[Export] JSON exportado: ${filename}`);
    successToast('Exportado com sucesso', `Arquivo: ${filename}`);
  } catch (error) {
    logger.error('[Export] Erro ao exportar JSON', error as Error);
    errorToast('Erro ao exportar', 'Falha ao gerar arquivo JSON');
  }
}

/**
 * Exportar dados como CSV
 */
export function exportToCSV(data: any[], filename: string = 'export.csv') {
  try {
    if (data.length === 0) {
      errorToast('Nenhum dado para exportar');
      return;
    }

    // Converter array de objetos para CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escapar vírgulas e aspas
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      ),
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);

    logger.info(`[Export] CSV exportado: ${filename}`);
    successToast('Exportado com sucesso', `Arquivo: ${filename}`);
  } catch (error) {
    logger.error('[Export] Erro ao exportar CSV', error as Error);
    errorToast('Erro ao exportar', 'Falha ao gerar arquivo CSV');
  }
}

/**
 * Exportar dados como Excel (XLSX)
 */
export function exportToExcel(data: any[], filename: string = 'export.xlsx', sheetName: string = 'Dados') {
  try {
    if (data.length === 0) {
      errorToast('Nenhum dado para exportar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Gerar arquivo
    XLSX.writeFile(workbook, filename);

    logger.info(`[Export] Excel exportado: ${filename}`);
    successToast('Exportado com sucesso', `Arquivo: ${filename}`);
  } catch (error) {
    logger.error('[Export] Erro ao exportar Excel', error as Error);
    errorToast('Erro ao exportar', 'Falha ao gerar arquivo Excel');
  }
}

/**
 * Exportar múltiplas tabelas como Excel (múltiplas sheets)
 */
export function exportToExcelMultiple(
  sheets: Array<{ name: string; data: any[] }>,
  filename: string = 'export.xlsx'
) {
  try {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(({ name, data }) => {
      if (data.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, name);
      }
    });

    XLSX.writeFile(workbook, filename);

    logger.info(`[Export] Excel múltiplo exportado: ${filename} (${sheets.length} sheets)`);
    successToast('Exportado com sucesso', `${sheets.length} planilhas em ${filename}`);
  } catch (error) {
    logger.error('[Export] Erro ao exportar Excel múltiplo', error as Error);
    errorToast('Erro ao exportar', 'Falha ao gerar arquivo Excel');
  }
}

/**
 * Fazer backup completo do sistema
 */
export async function createBackup() {
  const toastId = loadingToast('Gerando backup completo...');

  try {
    // Buscar todos os dados
    const [clientesRes, statsRes] = await Promise.all([
      fetch('http://localhost:5000/api/clientes'),
      fetch('http://localhost:5000/api/stats'),
    ]);

    const clientes = await clientesRes.json();
    const stats = await statsRes.json();

    // Criar backup com timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        clientes: clientes.clientes || [],
        stats,
      },
    };

    exportToJSON(backupData, `backup-rac-${timestamp}.json`);

    dismissLoadingToast(toastId, 'success', 'Backup criado com sucesso!');

    logger.info('[Backup] Backup completo criado', {
      clientesCount: backupData.data.clientes.length,
      timestamp,
    });

    return backupData;
  } catch (error) {
    logger.error('[Backup] Erro ao criar backup', error as Error);
    dismissLoadingToast(toastId, 'error', 'Erro ao criar backup');
    throw error;
  }
}

/**
 * Exportar relatório de clientes para Excel
 */
export async function exportClientesReport() {
  const toastId = loadingToast('Exportando relatório de clientes...');

  try {
    const response = await fetch('http://localhost:5000/api/clientes');
    const data = await response.json();

    const clientes = data.clientes || [];

    if (clientes.length === 0) {
      dismissLoadingToast(toastId, 'error', 'Nenhum cliente para exportar');
      return;
    }

    // Formatar dados para export
    const formattedData = clientes.map((c: any) => ({
      ID: c.id,
      Nome: c.nome,
      Endereço: c.endereco,
      Tipologia: c.tipologia,
      'Tipologia Google': c.tipologiaGoogle,
      Latitude: c.latitude,
      Longitude: c.longitude,
      Status: c.status,
      'Data Criação': c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '',
    }));

    const timestamp = new Date().toISOString().split('T')[0];
    exportToExcel(formattedData, `clientes-${timestamp}.xlsx`, 'Clientes');

    dismissLoadingToast(toastId, 'success', `${clientes.length} clientes exportados`);
  } catch (error) {
    logger.error('[Export] Erro ao exportar clientes', error as Error);
    dismissLoadingToast(toastId, 'error', 'Erro ao exportar clientes');
  }
}
