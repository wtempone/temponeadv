import { Card, Group, Text, Select, Box, Alert, Divider, Stack, Badge, Loader, Accordion } from '@mantine/core';
import { romanToInt } from '~/lib/utils/RomanToInt';
import { TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import { TabelaResultadoPromocao } from './TabelaResultadoPromocao';
import { toSafeDate } from '~/lib/utils/toSafeDate';
import classes from './PainelResultadoPromocao.module.css';
import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useAuthState } from '~/components/contexts/UserContext';

type PromocaoItem = {
  nome?: string;
  masp?: string;
  sre?: string;
  carreira?: string;
  nivelAtual?: string;
  grauAtual?: string;
  novoNivel?: string;
  novoGrau?: string;
  vigencia?: string | Date | null;
  publicacao?: string | Date | null;
  cargaHoras?: number;
  siglaCarreira?: string;
  [key: string]: any;
};

type CarreiraType = {
  id?: string;
  sigla: string;
  nome: string;
  [key: string]: any;
};

type CargaType = {
  id?: string;
  descricao: string;
  horasPorSemana: number;
  [key: string]: any;
};

type MesSalarios = {
  mes: dayjs.Dayjs;
  salarioAtual?: number | null;
  salarioNovo?: number | null;
  erro?: string | null;
  vigenciaNome?: string | null;
  vigenciaInicio?: Date | null;
  vigenciaFim?: Date | null;
};

type Precomputed = {
  mesesSalarios?: MesSalarios[];
  totalAcumulado?: number | null;
  diferencaMensal?: number | null;
};

type Props = {
  item: PromocaoItem;
  badgeText?: string;
  index?: number;
  totalCount?: number;
  precomputed?: Precomputed | null;
  onRequestCompute?: (index: number, cargaHoras: number) => void;
};

export default function PainelResultadoPromocao({
  item,
  badgeText,
  index = 0,
  totalCount = 1,
  precomputed = null,
  onRequestCompute,
}: Props) {
  const [erro, setErro] = useState('');
  const [vigencia, setVigencia] = useState<any | null>(null);
  const [carreiras, setCarreiras] = useState<CarreiraType[]>([]);
  const [carreiraResolvida, setCarreiraResolvida] = useState<CarreiraType | null>(null);
  const [cargas, setCargas] = useState<CargaType[]>([]);
  const [cargaSelecionada, setCargaSelecionada] = useState<string | null>(null);
  const [loadingCargas, setLoadingCargas] = useState<boolean>(false);
  const [requestedCompute, setRequestedCompute] = useState(false);
  const { state } = useAuthState();
  const isAuthenticated = state.state === 'SIGNED_IN';

  useEffect(() => {
    const carregarDados = async () => {
      setErro('');
      setVigencia(null);
      setCarreiras([]);
      setCarreiraResolvida(null);
      setCargas([]);
      setCargaSelecionada(null);
      setRequestedCompute(false);

      const dataVigencia = toSafeDate(item.vigencia);
      if (!dataVigencia) {
        setErro('Data de vigência inválida no registro retornado.');
        return;
      }

      const repo = new TabelaSalarialRepository();
      try {
        const vigencias = await repo.getVigencias();
        const encontrada = vigencias.find((v: any) => dataVigencia >= v.dataInicial && dataVigencia <= v.dataFinal);
        if (!encontrada) {
          setErro('Nenhuma vigência encontrada para a data da promoção deste registro.');
          return;
        }
        setVigencia(encontrada);

        setLoadingCargas(true);
        const carreirasDisponiveis = await repo.getCarreiras(encontrada.id!);
        setCarreiras(carreirasDisponiveis);

        const encontradaCarreira =
          carreirasDisponiveis.find((c) => c.sigla === item.carreira || c.nome === item.carreira) ||
          carreirasDisponiveis[0] ||
          null;

        if (encontradaCarreira) {
          setCarreiraResolvida(encontradaCarreira);
          const cargasDisponiveis = await repo.getCargas(encontrada.id!, encontradaCarreira.id!);
          setCargas(cargasDisponiveis || []);
          if (cargasDisponiveis && cargasDisponiveis.length === 1) {
            // carga única — dispara seleção automática
            setCargaSelecionada(cargasDisponiveis[0].id!);
          }
        } else {
          setCarreiras([]);
          setCargas([]);
        }
      } catch (err) {
        console.error(err);
        setErro('Erro ao carregar dados da tabela salarial para este registro.');
      } finally {
        setLoadingCargas(false);
      }
    };

    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  // quando carga única estiver definida ou quando usuário selecionar, solicitar cálculo ao pai (uma vez)
  useEffect(() => {
    if (!onRequestCompute) return;
    if (precomputed && typeof precomputed.totalAcumulado !== 'undefined') return; // já temos
    if (requestedCompute) return;

    // se carga única definida
    if (cargas.length === 1 && cargaSelecionada) {
      const c = cargas[0];
      onRequestCompute(index ?? 0, c.horasPorSemana);
      setRequestedCompute(true);
      return;
    }

    // se usuário selecionou uma carga específica
    if (cargaSelecionada) {
      const c = cargas.find((x) => x.id === cargaSelecionada);
      if (c) {
        onRequestCompute(index ?? 0, c.horasPorSemana);
        setRequestedCompute(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargas, cargaSelecionada, precomputed, onRequestCompute, index, requestedCompute]);

  const publicacaoDate = toSafeDate(item.publicacao);
  const vigenciaDate = toSafeDate(item.vigencia);

  const painelTitulo = totalCount && totalCount > 1 ? `Promoção ${(index ?? 0) + 1}` : 'Promoção';

  const cargaUnica = cargas.length === 1 ? cargas[0] : null;
  const cargaAtivaHoras =
    cargaUnica?.horasPorSemana ??
    cargas.find((c) => c.id === cargaSelecionada)?.horasPorSemana ??
    item.cargaHoras ??
    item.horasPorSemana ??
    0;

  // calcula total do demonstrativo: usa precomputed.totalAcumulado, senão soma salarioNovo dos meses
  const totalDemonstrativo = useMemo(() => {
    if (precomputed && typeof precomputed.totalAcumulado === 'number') {
      return precomputed.totalAcumulado;
    }
    if (precomputed && Array.isArray(precomputed.mesesSalarios)) {
      return precomputed.mesesSalarios.reduce((acc, m) => acc + (m.salarioNovo ?? 0), 0);
    }
    return null;
  }, [precomputed]);

  const mesesCount = useMemo(() => {
    if (!vigenciaDate || !publicacaoDate) return null;
    const start = dayjs(vigenciaDate).startOf('month');
    const end = dayjs(publicacaoDate).startOf('month');
    const diff = end.diff(start, 'month');
    return diff >= 0 ? diff + 1 : 0;
  }, [vigenciaDate, publicacaoDate]);

  const formatBR = (value: number | null) => {
    if (value === null || typeof value === 'undefined') return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <>
      {isAuthenticated && (
        <Card withBorder radius="md" className={classes.card} mt="md">
          <Group mt="md" mb="xs" align="center">
            <Text fw={700}>{painelTitulo}</Text>
            {badgeText && <Badge variant="outline">{badgeText}</Badge>}
          </Group>

          <Card.Section className={classes.section} mt="md">
            <Text fz="sm" c="dimmed" className={classes.label}>
              Dados da promoção
            </Text>

            <Stack gap={0} mt="sm">
              <Group justify="space-between">
                <Text fz="sm" c="dimmed">
                  Carreira
                </Text>
                <Text fz="sm">
                  {carreiraResolvida
                    ? `${carreiraResolvida.sigla} - ${carreiraResolvida.nome}`
                    : (item.carreira ?? '—')}
                </Text>
              </Group>

              <Group justify="space-between">
                <Text fz="sm" c="dimmed">
                  Nível / Grau
                </Text>
                <Text fz="sm" fw={700}>
                  {item.nivelAtual ?? '—'} / {item.grauAtual ?? '—'} → {item.novoNivel ?? '—'} / {item.novoGrau ?? '—'}
                </Text>
              </Group>

              <Group justify="space-between">
                <Text fz="sm" c="dimmed">
                  Vigência
                </Text>
                <Text fz="sm">{vigenciaDate ? vigenciaDate.toLocaleDateString('pt-BR') : '—'}</Text>
              </Group>

              <Group justify="space-between">
                <Text fz="sm" c="dimmed">
                  Publicação
                </Text>
                <Text fz="sm">{publicacaoDate ? publicacaoDate.toLocaleDateString('pt-BR') : '—'}</Text>
              </Group>

              {/* Quantidade de meses entre vigência e publicação (inclusivo) */}
              <Group justify="space-between">
                <Text fz="sm" c="dimmed">
                  Quantidade de meses
                </Text>
                <Text fz="sm">{mesesCount !== null ? `${mesesCount} mês${mesesCount === 1 ? '' : 'es'}` : '—'}</Text>
              </Group>

              {loadingCargas && (
                <Group justify="center" mt="xs">
                  <Loader size="xs" />
                </Group>
              )}

              {/* Se houver mais de uma carga, mostra Select; se única, oculta e usa cargaUnica */}
              {cargas.length > 1 && (
                <>
                  <Group justify="space-between">
                    <Text fz="sm" c="dimmed">
                      Carga horária
                    </Text>
                    <Select
                      placeholder={cargas.length ? 'Escolha uma carga horária' : '—'}
                      data={cargas.map((c) => ({
                        value: c.id!,
                        label: `${c.descricao} (${c.horasPorSemana}h/semana)`,
                      }))}
                      value={cargaSelecionada}
                      onChange={setCargaSelecionada}
                      searchable
                      clearable
                    />
                  </Group>
                </>
              )}

              {cargaUnica && (
                <Group justify="space-between">
                  <Text fz="sm" c="dimmed">
                    Carga horária
                  </Text>
                  <Text fz="sm">
                    {cargaUnica.descricao} ({cargaUnica.horasPorSemana}h/semana)
                  </Text>
                </Group>
              )}
            </Stack>
          </Card.Section>

          {erro && (
            <Card.Section className={classes.section}>
              <Alert color="red" title="Erro">
                {erro}
              </Alert>
            </Card.Section>
          )}
          <Divider />

          <Card.Section>
            {vigenciaDate && publicacaoDate && carreiraResolvida ? (
              <Box>
                <Accordion variant="separated" chevronIconSize={25}>
                  <Accordion.Item value="demonstrativo">
                    <Accordion.Control>
                      {/* Título do accordion mostra o total quando conhecido */}
                      <Group justify="space-between" style={{ width: '100%' }}>
                        <Stack gap={0}>
                          <Text fz="sm" c="dimmed" className={classes.label} m={0}>
                            Valor
                          </Text>
                          <Text fz="xs" c="dimmed" m={0}>
                            Clique para ver o demonstrativo mensal completo
                          </Text>
                        </Stack>
                        <Text fw={700} className={classes.label} c="green.9" fz="md" mr="xs">
                          {formatBR(totalDemonstrativo)}
                        </Text>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <TabelaResultadoPromocao precomputedMeses={precomputed?.mesesSalarios ?? null} />
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Box>
            ) : (
              <Text fz="sm" c="dimmed" mt="sm">
                Selecione a carga horária (quando aplicável) e certifique-se de que vigência e publicação estão
                definidas para ver o demonstrativo mensal.
              </Text>
            )}
          </Card.Section>
        </Card>
      )}
    </>
  );
}
