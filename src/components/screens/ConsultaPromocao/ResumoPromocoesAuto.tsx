import { differenceBy } from 'mantine-datatable';
import { CardResumoInformativo } from './CardResumoInformativo';
import { toSafeDate } from '~/lib/utils/toSafeDate';
import dayjs from 'dayjs';

type PromocaoItem = {
  vigencia?: string | Date | null;
  publicacao?: string | Date | null;
  nivelAtual?: string;
  novoNivel?: string;
  grauAtual?: string;
  novoGrau?: string;
  [key: string]: any;
};

type PrecomputedMap = Record<string, { totalAcumulado?: number | null; diferencaMensal?: number | null }>;

type Props = {
  resultado: PromocaoItem[];
  precomputedMap: PrecomputedMap;
};

export function ResumoPromocoesAuto({ resultado, precomputedMap }: Props) {
  if (!resultado || resultado.length === 0) return null;

  const recursos = resultado.map((item, idx) => {
    const pre = precomputedMap[String(idx)];
    const vigencia = item.vigencia ? new Date(item.vigencia).toLocaleDateString('pt-BR') : '—';
    const publicacao = item.publicacao ? new Date(item.publicacao).toLocaleDateString('pt-BR') : '—';

    const vig = toSafeDate(item.vigencia);
    const pub = toSafeDate(item.publicacao);
    const inicio = vig ? dayjs(vig).startOf('month') : null;
    const fim = pub ? dayjs(pub).startOf('month') : null;
    const qtdMeses = inicio && fim ? Math.max(0, fim.diff(inicio, 'month') + 1) : 0;

    const nivelAtual = item.nivelAtual ?? '—';
    const novoNivel = item.novoNivel ?? '—';
    const grauAtual = item.grauAtual ?? '—';
    const novoGrau = item.novoGrau ?? '—';

    const alteracao =
      nivelAtual !== novoNivel || grauAtual !== novoGrau
        ? `Nível ${nivelAtual} / Grau ${grauAtual} → Nível ${novoNivel} / Grau ${novoGrau}`
        : 'Sem alteração';

    const valor = pre?.totalAcumulado ? `R$ ${pre.totalAcumulado.toFixed(2)}` : '—';
    const direfencaMensal = pre?.diferencaMensal ? `R$ ${pre.diferencaMensal.toFixed(2)}` : '—';

    return {
      vigencia,
      publicacao,
      alteracao,
      valor,
      direfencaMensal,
      qtdMeses,
    };
  });
  const nomeServidor = resultado[0]?.nome ?? '—';
  const valorTotal = recursos.reduce((soma, r) => {
    const num = parseFloat(r.valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
    return isNaN(num) ? soma : soma + num;
  }, 0);

  return (
    <CardResumoInformativo nomeServidor={nomeServidor} recursos={recursos} valorTotal={`R$ ${valorTotal.toFixed(2)}`} />
  );
}
