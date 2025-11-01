import { useRef, useState, useEffect } from 'react';
import { Paper, Text, Alert, Center, Stack, Loader, Group, Card, Button } from '@mantine/core';
import dayjs from 'dayjs';

import { CountPromocaoDO, SearchPromocaoDOByMasp } from '~/lib/repositories/promocoesDORepository';
import { TabelaSalarialRepository, consultarSalario } from '~/lib/repositories/tabelaSalarialRepository';
import { getIndiceMonetarioForMonth } from '~/lib/services/indiceMonetarioService';

import BuscaPromocaoForm from './BuscaPromocaoForm';
import TabelaPromocao from './TabelaPromocao';
import PainelResultadoPromocao from './PainelResultadoPromocao';
import { CardResumoPromocao } from './CardResumoPromocao';
import { CardProfessorResumo } from './CardProfessorResumo';
import { romanToInt } from '~/lib/utils/RomanToInt';
import { toSafeDate } from '~/lib/utils/toSafeDate';
import { ResumoPromocoesAuto } from './ResumoPromocoesAuto';
import { useAuthState } from '~/components/contexts/UserContext';
import { Link } from 'react-router-dom';

export function ConsultaPromocao() {
  const [masp, setMasp] = useState('');
  const [resultado, setResultado] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [totalRegistros, setTotalRegistros] = useState<number | null>(null);
  const { state } = useAuthState();
  const isAuthenticated = state.state === 'SIGNED_IN';
  const [precomputedMap, setPrecomputedMap] = useState<Record<string, any>>({});
  const [computing, setComputing] = useState(false);

  const salarioCache = useRef<Map<string, number | null>>(new Map());
  const indiceCache = useRef<Map<string, number>>(new Map()); // key: YYYY-MM, value: percentual (ex: 0.42)

  useEffect(() => {
    CountPromocaoDO().then(setTotalRegistros).catch(console.error);
  }, []);

  function generateMonthsArray(vigenciaDate: Date, publicacaoDate: Date) {
    const meses: dayjs.Dayjs[] = [];
    let cursor = dayjs(vigenciaDate).startOf('month');
    const fim = dayjs(publicacaoDate).startOf('month');
    while (cursor.isBefore(fim) || cursor.isSame(fim)) {
      meses.push(cursor);
      cursor = cursor.add(1, 'month');
    }
    return meses;
  }

  function makeCacheKey(referenciaDate: Date, sigla: string, cargaHoras: number, nivel: number, grau: string) {
    const refIso = dayjs(referenciaDate).startOf('month').format('YYYY-MM-01');
    return `${refIso}::${sigla}::${cargaHoras}h::N${nivel}::G${String(grau)}`;
  }

  // busca índice mensal com cache (retorna percentual como número, ex: 0.42 para 0,42%)
  async function fetchIndiceMes(mes: dayjs.Dayjs) {
    const key = mes.format('YYYY-MM');
    if (indiceCache.current.has(key)) return indiceCache.current.get(key)!;
    try {
      const valor = await getIndiceMonetarioForMonth(mes); // já retorna número (ex: 0.42)
      indiceCache.current.set(key, valor);
      return valor;
    } catch (err) {
      console.error('Erro fetchIndiceMes para', key, err);
      indiceCache.current.set(key, 0);
      return 0;
    }
  }

  // retorna array de meses (dayjs) entre start (inclusive) e end (inclusive)
  function monthsRangeInclusive(start: dayjs.Dayjs, end: dayjs.Dayjs) {
    const arr: dayjs.Dayjs[] = [];
    let cursor = start.startOf('month');
    const last = end.startOf('month');
    while (cursor.isBefore(last) || cursor.isSame(last)) {
      arr.push(cursor);
      cursor = cursor.add(1, 'month');
    }
    return arr;
  }

  // computeMesesEAcumuladoForItem agora inclui índice, coeficiente e valor atualizado por mês
  async function computeMesesEAcumuladoForItem(item: any, cargaHorasOverride?: number) {
    const repo = new TabelaSalarialRepository();
    const dataVigencia = toSafeDate(item.vigencia);
    const dataPublicacao = toSafeDate(item.publicacao);
    if (!dataVigencia || !dataPublicacao) {
      return { mesesSalarios: [], totalAcumulado: 0, diferencaMensal: null };
    }

    const meses = generateMonthsArray(dataVigencia, dataPublicacao);
    const vigencias = await repo.getVigencias();

    const nivelAtualNum = romanToInt(String(item.nivelAtual));
    const novoNivelNum = romanToInt(String(item.novoNivel));

    const sigla = item.carreira ?? item.siglaCarreira ?? item.sigla ?? '';
    const cargaHoras =
      typeof cargaHorasOverride === 'number'
        ? cargaHorasOverride
        : ((typeof item.cargaHoras === 'number' ? item.cargaHoras : undefined) ??
          (typeof item.horasPorSemana === 'number' ? item.horasPorSemana : undefined) ??
          0);

    // referência de atualização: data atual (hoje), atualizada até o mês corrente (startOf month)
    const referenciaAtual = dayjs(); // hoje
    const referenciaAtualMonth = referenciaAtual.startOf('month');

    const promises = meses.map(async (m) => {
      const referencia = m.date(1).toDate();

      const found = vigencias.find((v: any) => {
        if (!v || !v.dataInicial || !v.dataFinal) return false;
        const start = dayjs(v.dataInicial).startOf('day');
        const end = dayjs(v.dataFinal).endOf('day');
        const ref = dayjs(referencia).startOf('day');
        return !ref.isBefore(start) && !ref.isAfter(end);
      });

      const vigenciaNome = found?.descricao ?? null;
      const vigenciaInicio = found?.dataInicial ? new Date(found.dataInicial) : null;
      const vigenciaFim = found?.dataFinal ? new Date(found.dataFinal) : null;

      const keyAtual = makeCacheKey(referencia, sigla, cargaHoras, nivelAtualNum, item.grauAtual ?? '');
      const keyNovo = makeCacheKey(referencia, sigla, cargaHoras, novoNivelNum, item.novoGrau ?? '');

      const fromCacheAtual = salarioCache.current.has(keyAtual) ? salarioCache.current.get(keyAtual) : undefined;
      const fromCacheNovo = salarioCache.current.has(keyNovo) ? salarioCache.current.get(keyNovo) : undefined;

      try {
        let atualVal: number | null;
        if (fromCacheAtual !== undefined) {
          atualVal = fromCacheAtual;
        } else {
          const atualRes = await consultarSalario(referencia, sigla, cargaHoras, nivelAtualNum, item.grauAtual);
          atualVal =
            typeof atualRes === 'number'
              ? atualRes
              : atualRes && typeof atualRes === 'object' && 'erro' in atualRes
                ? null
                : Number(atualRes) || null;
          salarioCache.current.set(keyAtual, atualVal);
        }

        let novoVal: number | null;
        if (fromCacheNovo !== undefined) {
          novoVal = fromCacheNovo;
        } else {
          const novoRes = await consultarSalario(referencia, sigla, cargaHoras, novoNivelNum, item.novoGrau);
          novoVal =
            typeof novoRes === 'number'
              ? novoRes
              : novoRes && typeof novoRes === 'object' && 'erro' in novoRes
                ? null
                : Number(novoRes) || null;
          salarioCache.current.set(keyNovo, novoVal);
        }

        // índice do próprio mês (percentual)
        const indiceMes = await fetchIndiceMes(m);

        // coeficiente: produto dos (1 + indice/100) desde o mês 'm' até o mês de referenciaAtualMonth (inclusive)
        // se referenciaAtualMonth is before m, então coeficiente = 1 (nenhuma atualização)
        let coeficiente = 1;
        if (referenciaAtualMonth.isAfter(m) || referenciaAtualMonth.isSame(m)) {
          const monthsToCompound = monthsRangeInclusive(m, referenciaAtualMonth);
          // obter índices para cada mês do intervalo (com cache via fetchIndiceMes)
          const indices = await Promise.all(monthsToCompound.map((mm) => fetchIndiceMes(mm)));
          coeficiente = indices.reduce((acc, idxPercent) => acc * (1 + idxPercent / 100), 1);
        } else {
          coeficiente = 1;
        }

        // diferença nominal para o mês
        const diferencaNominal =
          (typeof novoVal === 'number' ? novoVal : 0) - (typeof atualVal === 'number' ? atualVal : 0);

        // valor atualizado até hoje (aplica coeficiente à diferença)
        const valorAtualizado = diferencaNominal * coeficiente;

        return {
          mes: m,
          salarioAtual: atualVal,
          salarioNovo: novoVal,
          erro: null,
          vigenciaNome,
          vigenciaInicio,
          vigenciaFim,
          indiceMes, // percentual para o mês (ex: 0.42)
          coeficiente, // número multiplicador (ex: 1.0123)
          valorAtualizado, // valor já corrigido até a referência atual
          diferencaNominal,
        };
      } catch (err: any) {
        console.error('Erro consultarSalario (pai) para', m.format('MM/YYYY'), err);
        salarioCache.current.set(keyAtual, null);
        salarioCache.current.set(keyNovo, null);
        // tentar ao menos obter índice do mês para preencher
        const indiceMes = await fetchIndiceMes(m);
        const coeficiente = 1; // sem cálculo
        return {
          mes: m,
          salarioAtual: null,
          salarioNovo: null,
          erro: err?.message ?? 'Erro',
          vigenciaNome,
          vigenciaInicio,
          vigenciaFim,
          indiceMes,
          coeficiente,
          valorAtualizado: 0,
          diferencaNominal: 0,
        };
      }
    });

    const mesesSalarios = await Promise.all(promises);

    // total acumulado atualizado: soma dos valores atualizados por mês (já corrigidos até hoje)
    const totalAcumulado = mesesSalarios.reduce(
      (s: number, ms: any) => s + (typeof ms.valorAtualizado === 'number' ? ms.valorAtualizado : 0),
      0,
    );

    const firstDif = mesesSalarios.find(
      (ms: any) => typeof ms.salarioAtual === 'number' && typeof ms.salarioNovo === 'number',
    );
    const diferencaMensal = firstDif ? firstDif.salarioNovo! - firstDif.salarioAtual! : null;

    return { mesesSalarios, totalAcumulado, diferencaMensal };
  }

  async function computeForIndex(index: number, item: any, cargaHorasFromPanel: number) {
    try {
      const res = await computeMesesEAcumuladoForItem(item, cargaHorasFromPanel);
      setPrecomputedMap((prev) => ({ ...prev, [String(index)]: res }));
      return res;
    } catch (err) {
      console.error('Erro computeForIndex', index, err);
      throw err;
    }
  }

  async function handleRequestCompute(index: number, cargaHorasFromPanel: number) {
    const existing = precomputedMap[String(index)];
    if (existing && typeof existing.totalAcumulado !== 'undefined') return;
    setComputing(true);
    try {
      await computeForIndex(index, resultado![index], cargaHorasFromPanel);
    } catch (err) {
      console.error('Erro ao computar item', index, err);
    } finally {
      setComputing(false);
    }
  }

  const handleBuscar = async (maspValue: string) => {
    setErro('');
    setResultado(null);
    setPrecomputedMap({});
    salarioCache.current.clear();
    indiceCache.current.clear();

    if (!maspValue.trim()) {
      setErro('O campo MASP é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      const res = await SearchPromocaoDOByMasp(maspValue);
      const lista = res ?? [];
      setResultado(lista);
      setMasp(maspValue);
    } catch (error) {
      console.error('Erro ao buscar promoção:', error);
      setErro('Erro ao buscar promoção. Veja o console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const precomputedReadyForAll = (() => {
    if (!resultado || resultado.length === 0) return false;
    for (let i = 0; i < resultado.length; i++) {
      if (!precomputedMap.hasOwnProperty(String(i))) return false;
      const v = precomputedMap[String(i)];
      if (!v || typeof v.totalAcumulado === 'undefined') return false;
    }
    return true;
  })();

  return (
    <div>
      <Paper p="md">
        <Stack>
          <Text ta="center" fw={500} fz="lg">
            Consulte sua promoção funcional
          </Text>

          <Text ta="center" fz="sm" c="dimmed" mb="md">
            Verifique se você tem direito à promoção por mérito ou antiguidade.
          </Text>
          <Center>
            <BuscaPromocaoForm onBuscar={handleBuscar} loading={loading} initialValue={masp} />
          </Center>
          {erro && (
            <Alert mt="md" color="red" title="Erro">
              {erro}
            </Alert>
          )}
        </Stack>

        {!isAuthenticated && resultado && resultado.length > 0 && (
          <ResumoPromocoesAuto resultado={resultado} precomputedMap={precomputedMap} />
        )}
        {isAuthenticated && resultado && resultado.length > 0 && (
          <CardProfessorResumo nome={resultado[0].nome} masp={resultado[0].masp} sre={resultado[0].sre} />
        )}

        {computing && (
          <Group justify="center" my="md">
            <Loader />
            <Text>Calculando demonstrações mensais e totais...</Text>
          </Group>
        )}

        {resultado && resultado.length > 0 && (
          <>
            {resultado.map((item, idx) => (
              <PainelResultadoPromocao
                key={`${item.masp ?? idx}-${idx}`}
                item={item}
                index={idx}
                totalCount={resultado.length}
                precomputed={precomputedMap[String(idx)]}
                onRequestCompute={handleRequestCompute}
              />
            ))}

            {resultado.length > 1 && (
              <>
                {precomputedReadyForAll ? (
                  <CardResumoPromocao
                    resultados={resultado.map((r, idx) => ({
                      nome: r.nome,
                      masp: r.masp,
                      sre: r.sre,
                      vigencia: r.vigencia,
                      publicacao: r.publicacao,
                      nivelAtual: r.nivelAtual,
                      novoNivel: r.novoNivel,
                      grauAtual: r.grauAtual,
                      novoGrau: r.novoGrau,
                      totalAcumulado: precomputedMap[String(idx)]?.totalAcumulado ?? null,
                    }))}
                  />
                ) : (
                  <>
                    {computing ? (
                      <Group justify="center" my="md">
                        <Loader />
                        <Text>Preparando resumo dos valores acumulados...</Text>
                      </Group>
                    ) : (
                      <CardResumoPromocao
                        resultados={resultado.map((r, idx) => ({
                          nome: r.nome,
                          masp: r.masp,
                          sre: r.sre,
                          vigencia: r.vigencia,
                          publicacao: r.publicacao,
                          nivelAtual: r.nivelAtual,
                          novoNivel: r.novoNivel,
                          grauAtual: r.grauAtual,
                          novoGrau: r.novoGrau,
                          totalAcumulado: precomputedMap[String(idx)]?.totalAcumulado ?? null,
                        }))}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {resultado && resultado.length === 0 && (
          <Alert mt="xl" color="red" title="Nenhum registro encontrado">
            Não encontramos nenhuma promoção funcional para o MASP informado.
          </Alert>
        )}
      </Paper>

      {!isAuthenticated && resultado && resultado.length > 0 && (
        <>
          <Group justify="end" m="md">
            <Stack>
              <Text c="dimmed" fz="sm">
                Para ver detalhes completos da promoção, faça login.
              </Text>
              <Button component={Link} variant="link" size="xl" to="/login">
                Ir para página de login
              </Button>
            </Stack>
          </Group>
        </>
      )}
    </div>
  );
}

export default ConsultaPromocao;
