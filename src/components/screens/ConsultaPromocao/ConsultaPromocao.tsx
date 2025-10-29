import { useState, useEffect } from 'react';
import { Button, Input, Paper, Text, Table, Alert, Select, Box, Title } from '@mantine/core';
import { IMaskInput } from 'react-imask';
import { FaSearchDollar } from 'react-icons/fa';
import classes from './ConsultaPromocao.module.css';

import { SearchPromocaoDOByMasp, CountPromocaoDO } from '~/lib/repositories/promocoesDORepository';
import { TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import { consultarSalario } from '~/lib/repositories/tabelaSalarialRepository';
import { romanToInt } from '~/lib/utils/RomanToInt';
import { TabelaResultadoPromocao } from './TabelaResultadoPromocao';
export function ConsultaPromocao() {
  const [masp, setMasp] = useState('');
  const [resultado, setResultado] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [totalRegistros, setTotalRegistros] = useState<number | null>(null);

  const [vigencia, setVigencia] = useState<any | null>(null);
  const [carreiras, setCarreiras] = useState<any[]>([]);
  const [carreiraSelecionadaId, setCarreiraSelecionadaId] = useState<string | null>(null);
  const [cargas, setCargas] = useState<any[]>([]);
  const [cargaSelecionada, setCargaSelecionada] = useState<string | null>(null);
  const [salarios, setSalarios] = useState<{ atual: number; novo: number } | null>(null);

  useEffect(() => {
    CountPromocaoDO().then(setTotalRegistros).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setResultado(null);
    setVigencia(null);
    setCarreiras([]);
    setCarreiraSelecionadaId(null);
    setCargas([]);
    setCargaSelecionada(null);
    setSalarios(null);

    if (!masp.trim()) {
      setErro('O campo MASP é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      const res = await SearchPromocaoDOByMasp(masp);
      setResultado(res);

      if (!res || res.length === 0) {
        setErro('');
        return;
      }

      const item = res[0];
      const dataVigencia = item.vigencia instanceof Date ? item.vigencia : new Date(item.vigencia);
      if (!dataVigencia || isNaN(dataVigencia.getTime())) {
        setErro('Data de vigência inválida no registro retornado.');
        return;
      }

      const repo = new TabelaSalarialRepository();
      const vigencias = await repo.getVigencias();
      const encontrada = vigencias.find((v) => dataVigencia >= v.dataInicial && dataVigencia <= v.dataFinal);
      if (!encontrada) {
        setErro('Nenhuma vigência encontrada para a data da promoção.');
        return;
      }
      setVigencia(encontrada);

      // carregar carreiras da vigência
      const carreirasDisponiveis = await repo.getCarreiras(encontrada.id!);
      setCarreiras(carreirasDisponiveis);

      // tentar selecionar carreira com base em item.carreira (sigla ou nome)
      const selecionada = carreirasDisponiveis.find((c) => c.sigla === item.carreira || c.nome === item.carreira);
      if (selecionada) {
        setCarreiraSelecionadaId(selecionada.id!);
        // carregar cargas para a carreira encontrada
        const cargasDisponiveis = await repo.getCargas(encontrada.id!, selecionada.id!);
        setCargas(cargasDisponiveis);
        if (cargasDisponiveis.length === 1) {
          setCargaSelecionada(cargasDisponiveis[0].id!);
        }
      } else {
        // se não encontrou carreira automaticamente, deixa usuário escolher
        setCarreiraSelecionadaId(null);
        setCargas([]);
        setCargaSelecionada(null);
      }
    } catch (error) {
      console.error('Erro ao buscar promoção:', error);
      setErro('Erro ao buscar promoção. Veja o console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  // quando carreira muda, recarrega cargas daquela carreira
  useEffect(() => {
    const loadCargas = async () => {
      setErro('');
      setCargas([]);
      setCargaSelecionada(null);
      setSalarios(null);
      if (!vigencia || !carreiraSelecionadaId) return;
      const repo = new TabelaSalarialRepository();
      try {
        const cargasDisponiveis = await repo.getCargas(vigencia.id!, carreiraSelecionadaId);
        setCargas(cargasDisponiveis);
        if (cargasDisponiveis.length === 1) {
          setCargaSelecionada(cargasDisponiveis[0].id!);
        }
      } catch (err) {
        console.error(err);
        setErro('Erro ao carregar cargas da carreira selecionada.');
      }
    };
    loadCargas();
  }, [carreiraSelecionadaId, vigencia]);

  useEffect(() => {
    const calcular = async () => {
      setErro('');
      setSalarios(null);

      if (!resultado || resultado.length === 0) return;
      if (!vigencia) {
        setErro('Vigência não definida.');
        return;
      }
      if (!carreiraSelecionadaId) {
        setErro('Carreira não selecionada.');
        return;
      }
      if (!cargaSelecionada) return;

      const item = resultado[0];
      const carga = cargas.find((c) => c.id === cargaSelecionada);
      if (!carga) {
        setErro('Carga horária selecionada não encontrada.');
        return;
      }

      const nivelAtual = romanToInt(String(item.nivelAtual));
      const novoNivel = romanToInt(String(item.novoNivel));
      if (isNaN(nivelAtual) || isNaN(novoNivel)) {
        setErro('Erro ao converter nível romano para número.');
        return;
      }

      const siglaCarreira = (() => {
        const c = carreiras.find((cc) => cc.id === carreiraSelecionadaId);
        return c ? c.sigla : item.carreira;
      })();

      // Salário atual
      const atualRes = await consultarSalario(
        item.vigencia instanceof Date ? item.vigencia : new Date(item.vigencia),
        siglaCarreira,
        carga.horasPorSemana,
        nivelAtual,
        item.grauAtual,
      );
      if (typeof atualRes === 'object' && 'erro' in atualRes) {
        setErro(`Parou ao obter salário atual: ${atualRes.erro}`);
        return;
      }

      // Salário novo
      const novoRes = await consultarSalario(
        item.vigencia instanceof Date ? item.vigencia : new Date(item.vigencia),
        siglaCarreira,
        carga.horasPorSemana,
        novoNivel,
        item.novoGrau,
      );
      if (typeof novoRes === 'object' && 'erro' in novoRes) {
        setErro(`Parou ao obter salário novo: ${novoRes.erro}`);
        return;
      }

      setSalarios({ atual: atualRes, novo: novoRes });
    };

    if (cargaSelecionada) calcular();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargaSelecionada, carreiraSelecionadaId, vigencia, resultado, cargas]);

  return (
    <div>
      <Paper p="md">
        <Text fw={500} fz="lg" mb={5}>
          Consulte sua promoção funcional
        </Text>

        <Text fz="sm" c="dimmed" mb="lg">
          Verifique se você tem direito à promoção por mérito ou antiguidade.
        </Text>

        <form onSubmit={handleSubmit}>
          <div className={classes.controls}>
            <Input
              leftSection={<FaSearchDollar size={16} />}
              component={IMaskInput}
              mask="000000000"
              placeholder="Digite o código MASP"
              classNames={{ input: classes.input }}
              size="md"
              radius="xl"
              value={masp}
              onChange={(e) => setMasp((e.target as HTMLInputElement).value)}
            />
            <Button type="submit" className={classes.control} color="green.9" radius="xl" size="md" loading={loading}>
              Consultar
            </Button>
          </div>
        </form>

        {/* {totalRegistros !== null && (
          <Text fz="sm" c="dimmed" mt="lg">
            Atualmente temos aproximadamente <strong>{totalRegistros}</strong> análises para consulta.
          </Text>
        )} */}

        {erro && (
          <Alert mt="md" color="red" title="Erro">
            {erro}
          </Alert>
        )}

        {resultado && resultado.length > 0 && (
          <>
            {/* <Table
              striped
              highlightOnHover
              mt="xl"
              withTableBorder
              withColumnBorders
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid var(--mantine-color-green-9)',
              }}
            >
              <Table.Thead
                style={{
                  backgroundColor: 'var(--mantine-color-green-9)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  letterSpacing: '0.5px',
                }}
              >
                <Table.Tr>
                  <Table.Th>Nome</Table.Th>
                  <Table.Th>MASP</Table.Th>
                  <Table.Th>SRE</Table.Th>
                  <Table.Th>Carreira</Table.Th>
                  <Table.Th>Nível Atual</Table.Th>
                  <Table.Th>Grau Atual</Table.Th>
                  <Table.Th>Novo Nível</Table.Th>
                  <Table.Th>Novo Grau</Table.Th>
                  <Table.Th>Vigência</Table.Th>
                  <Table.Th>Publicação</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {resultado.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Text fw={500}>{item.nome}</Text>
                    </Table.Td>
                    <Table.Td>{item.masp}</Table.Td>
                    <Table.Td>{item.sre}</Table.Td>
                    <Table.Td>
                      <Text c="green.9" fw={500}>
                        {item.carreira}
                      </Text>
                    </Table.Td>
                    <Table.Td>{item.nivelAtual}</Table.Td>
                    <Table.Td>{item.grauAtual}</Table.Td>
                    <Table.Td>{item.novoNivel}</Table.Td>
                    <Table.Td>{item.novoGrau}</Table.Td>
                    <Table.Td>
                      {item.vigencia instanceof Date ? item.vigencia.toLocaleDateString('pt-BR') : '-'}
                    </Table.Td>
                    <Table.Td>
                      {item.publicacao instanceof Date ? item.publicacao.toLocaleDateString('pt-BR') : '-'}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table> */}

            {carreiras.length > 1 && (
              <Select
                label="Selecione a carreira"
                placeholder="Escolha uma carreira"
                data={carreiras.map((c) => ({ value: c.id!, label: `${c.sigla} - ${c.nome}` }))}
                value={carreiraSelecionadaId}
                onChange={setCarreiraSelecionadaId}
                mt="lg"
              />
            )}

            {cargas.length > 1 && (
              <Select
                label="Selecione a carga horária"
                placeholder="Escolha uma opção"
                data={cargas.map((c) => ({
                  value: c.id!,
                  label: `${c.descricao} (${c.horasPorSemana}h/semana)`,
                }))}
                value={cargaSelecionada}
                onChange={setCargaSelecionada}
                mt="lg"
              />
            )}

            {salarios && resultado && resultado.length > 0 && (
              <Paper mt="md">
                <Title size="xl" mt="lg">
                  Resultados de promoção encontrados
                </Title>
                <div>
                  {carreiras.length === 1 && carreiras[0] && (
                    <Text mt="lg" fz="sm" c="dimmed">
                      Carreira:{' '}
                      <strong>
                        {carreiras[0].sigla} - {carreiras[0].nome}
                      </strong>
                    </Text>
                  )}

                  {cargas.length === 1 && cargas[0] && (
                    <Text mb="lg" fz="sm" c="dimmed">
                      Carga horária:{' '}
                      <strong>
                        {cargas[0].descricao} ({cargas[0].horasPorSemana}h semanais)
                      </strong>
                    </Text>
                  )}
                  {/* 
                  <Text>
                    Salário atual: <strong>R$ {salarios.atual.toFixed(2)}</strong>
                  </Text>
                  <Text>
                    Salário após promoção: <strong>R$ {salarios.novo.toFixed(2)}</strong>
                  </Text>
                  <Text>
                    Diferença mensal: <strong>R$ {(salarios.novo - salarios.atual).toFixed(2)}</strong>
                  </Text> */}

                  <Box mt="md">
                    {(() => {
                      const item = resultado[0];
                      const vigencia = item.vigencia instanceof Date ? item.vigencia : new Date(item.vigencia);
                      const publicacao = item.publicacao instanceof Date ? item.publicacao : new Date(item.publicacao);

                      const nivelAtual = romanToInt(String(item.nivelAtual));
                      const novoNivel = romanToInt(String(item.novoNivel));
                      const grauAtual = String(item.grauAtual);
                      const novoGrau = String(item.novoGrau);

                      const nivelDiff = novoNivel - nivelAtual;
                      const grauDiff = novoGrau.localeCompare(grauAtual);

                      const mesesDiff = Math.max(
                        0,
                        Math.floor((publicacao.getTime() - vigencia.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)),
                      );
                      const anos = Math.floor(mesesDiff / 12);
                      const meses = mesesDiff % 12;
                      return (
                        <>
                          {mesesDiff > 0 && (
                            <Text mt="sm">
                              Identificamos uma diferença entre a data da vigência (
                              {vigencia.toLocaleDateString('pt-BR')}) e a data da publicação (
                              {publicacao.toLocaleDateString('pt-BR')}):{' '}
                              <strong>
                                {anos} ano(s) e {meses} mês(es)
                              </strong>{' '}
                              de diferença.
                            </Text>
                          )}

                          {nivelDiff !== 0 && (
                            <Text mt="sm">
                              O nível foi alterado de <strong>{item.nivelAtual}</strong> para{' '}
                              <strong>{item.novoNivel}</strong>, indicando uma progressão de{' '}
                              <strong>{Math.abs(nivelDiff)} nível(is)</strong>.
                            </Text>
                          )}

                          {grauDiff !== 0 && (
                            <Text mt="sm">
                              O grau foi alterado de <strong>{grauAtual}</strong> para <strong>{novoGrau}</strong>,
                              representando uma mudança de <strong>{Math.abs(grauDiff)} grau(s)</strong>.
                            </Text>
                          )}

                          <Text mt="sm">
                            Com isso, o servidor deveria estar recebendo o salário novo de{' '}
                            <strong>R$ {salarios.novo.toFixed(2)}</strong>, mas estava recebendo{' '}
                            <strong>R$ {salarios.atual.toFixed(2)}</strong>.
                          </Text>

                          <Text mt="sm">
                            A cada mês, deveria receber a diferença de{' '}
                            <strong>R$ {(salarios.novo - salarios.atual).toFixed(2)}</strong>.
                          </Text>
                          <TabelaResultadoPromocao
                            vigencia={item.vigencia}
                            publicacao={item.publicacao}
                            carreiraAtual={`${item.carreira}${romanToInt(item.nivelAtual)}-${item.grauAtual}`}
                            carreiraNova={`${item.carreira}${romanToInt(item.novoNivel)}-${item.novoGrau}`}
                            salarioAtual={salarios.atual}
                            salarioNovo={salarios.novo}
                            nivelAtual={item.nivelAtual}
                            novoNivel={item.novoNivel}
                            grauAtual={item.grauAtual}
                            novoGrau={item.novoGrau}
                          />
                        </>
                      );
                    })()}
                  </Box>
                </div>
              </Paper>
            )}
          </>
        )}

        {resultado && resultado.length === 0 && (
          <Alert mt="xl" color="red" title="Nenhum registro encontrado">
            Não encontramos nenhuma promoção funcional para o MASP informado.
          </Alert>
        )}
      </Paper>
    </div>
  );
}
