import { Card, Group, Stack, Text, Title, Badge, ThemeIcon } from '@mantine/core';
import dayjs from 'dayjs';
import { useAuthState } from '~/components/contexts/UserContext';
import { toSafeDate } from '~/lib/utils/toSafeDate';
import { CiBadgeDollar } from 'react-icons/ci';

interface ResultadoPromocao {
  nome?: string;
  masp?: string;
  sre?: string;
  vigencia?: string | Date | null;
  publicacao?: string | Date | null;
  nivelAtual?: string;
  novoNivel?: string;
  grauAtual?: string;
  novoGrau?: string;
  totalAcumulado?: number | null;
  [key: string]: any;
}

function formatCurrencySafe(v?: number | null) {
  if (v === null || v === undefined) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CardResumoPromocao({ resultados }: { resultados: ResultadoPromocao[] }) {
  if (!resultados || resultados.length === 0) return null;
  const { state } = useAuthState();
  const isAuthenticated = state.state === 'SIGNED_IN';
  const itens = resultados.map((r) => {
    const vig = toSafeDate(r.vigencia);
    const pub = toSafeDate(r.publicacao);
    const inicio = vig ? dayjs(vig).startOf('month') : null;
    const fim = pub ? dayjs(pub).startOf('month') : null;
    const meses = inicio && fim ? Math.max(0, fim.diff(inicio, 'month') + 1) : 0;

    const difs: string[] = [];
    if (r.nivelAtual && r.novoNivel && r.nivelAtual !== r.novoNivel)
      difs.push(`Nível: ${r.nivelAtual} → ${r.novoNivel}`);
    if (r.grauAtual && r.novoGrau && r.grauAtual !== r.novoGrau) difs.push(`Grau: ${r.grauAtual} → ${r.novoGrau}`);
    const descricao = difs.length ? difs.join(' | ') : 'Sem alteração';

    return {
      nome: r.nome ?? '—',
      masp: r.masp ?? '—',
      sre: r.sre ?? '—',
      vigencia: inicio ? inicio.format('DD/MM/YYYY') : '—',
      publicacao: fim ? fim.format('DD/MM/YYYY') : '—',
      meses,
      descricao,
      totalAcumulado: typeof r.totalAcumulado === 'number' ? r.totalAcumulado : null,
    };
  });

  const somaTotal = itens.reduce((acc, it) => acc + (it.totalAcumulado ?? 0), 0);

  return (
    <>
      {isAuthenticated && (
        <Card withBorder shadow="md" radius="md" mt="xl">
          <Stack>
            <Group align="flex-start">
              <Title order={4} c="green.9">
                Resumo das promoções encontradas
              </Title>
            </Group>

            {itens.map((it, idx) => (
              <Group key={idx} justify="space-between" ml="sm">
                <Group justify="start">
                  <ThemeIcon color="green.9" variant="outline" size="sm" radius="xl">
                    <CiBadgeDollar size={20} />
                  </ThemeIcon>
                  <Text fw={600} truncate>
                    {itens.length > 1 ? `Promoção ${(idx ?? 0) + 1}` : 'Promoção'} - {it.vigencia} a {it.publicacao} (
                    {it.meses} mêses)
                  </Text>
                </Group>

                <Text fw={700} c="green.9">
                  {it.totalAcumulado !== null ? formatCurrencySafe(it.totalAcumulado) : '—'}
                </Text>
              </Group>
            ))}

            <Group justify="space-between" mt="sm">
              <Text fw={700} ta="right" fz="lg" c="green.9">
                Total
              </Text>
              <Text fw={700} ta="right" fz="lg" c="green.9">
                {formatCurrencySafe(somaTotal)}
              </Text>
            </Group>
          </Stack>
        </Card>
      )}
    </>
  );
}

export default CardResumoPromocao;
