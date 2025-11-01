// lib/services/indiceMonetarioService.ts
import dayjs from 'dayjs';

const DEFAULT_SERIE_ID = 433; // IPCA como padrão

/**
 * Consulta o índice monetário (IPCA, INPC, etc.) para um mês específico.
 * @param mes - Data do mês desejado (dayjs)
 * @param serieId - Código da série no Banco Central (ex: IPCA = 433, INPC = 188)
 * @returns Valor percentual do índice no mês (ex: 0.42 para 0,42%)
 */
export async function getIndiceMonetarioForMonth(
  mes: dayjs.Dayjs,
  serieId: number = DEFAULT_SERIE_ID,
): Promise<number> {
  const dataInicial = mes.startOf('month').format('DD/MM/YYYY');
  const dataFinal = mes.endOf('month').format('DD/MM/YYYY');

  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serieId}/dados?formato=json&dataInicial=${dataInicial}&dataFinal=${dataFinal}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) return 0;

    const valor = parseFloat(data[0].valor.replace(',', '.'));
    return isNaN(valor) ? 0 : valor;
  } catch (err) {
    console.error(`Erro ao buscar índice ${serieId} para ${mes.format('MM/YYYY')}:`, err);
    return 0;
  }
}
