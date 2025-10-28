import { useState, useEffect } from 'react';
import { Button, Input, Paper, Text, Table, Alert, Group } from '@mantine/core';
import classes from './ConsultaPromocao.module.css';
import { IMaskInput } from 'react-imask';
import { FaSearchDollar } from 'react-icons/fa';
import { SearchPromocaoDOByMasp, CountPromocaoDO } from '~/lib/repositories/promocoesDORepository';

export function ConsultaPromocao() {
  const [masp, setMasp] = useState('');
  const [resultado, setResultado] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [totalRegistros, setTotalRegistros] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await CountPromocaoDO();
        setTotalRegistros(count);
      } catch (error) {
        console.error('Erro ao contar registros:', error);
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setResultado(null);

    if (!masp.trim()) {
      setErro('O campo MASP é obrigatório.');
      return;
    }

    setLoading(true);

    try {
      const res = await SearchPromocaoDOByMasp(masp);
      setResultado(res);
    } catch (error) {
      console.error('Erro ao buscar promoção:', error);
      setResultado([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper>
        <Text fw={500} fz="lg" mb={5}>
          Consulte seu direito à promoção funcional
        </Text>

        <Text fz="sm" c="dimmed" mb="lg">
          Acompanhamento e requerimento de progressões funcionais e promoções por mérito ou antiguidade, assegurando o
          cumprimento dos critérios legais e a valorização da trajetória profissional.
        </Text>

        <form onSubmit={handleSubmit}>
          <div className={classes.controls}>
            <Input
              leftSection={<FaSearchDollar size={16} />}
              component={IMaskInput}
              mask="000000000"
              placeholder="Insira seu código MASP"
              classNames={{ input: classes.input }}
              size="md"
              radius="xl"
              color="green.9"
              value={masp}
              onChange={(e) => setMasp((e.target as HTMLInputElement).value)}
              error={erro}
            />
            <Button type="submit" className={classes.control} radius="xl" size="md" color="green.9" loading={loading}>
              Consultar
            </Button>
          </div>
        </form>

        {totalRegistros !== null && (
          <Text fz="sm" c="gray.7" mt="md">
            Total de análises disponíveis: <strong>{totalRegistros}</strong>
          </Text>
        )}
        {erro && (
          <Alert mt="md" color="red" title="Campo obrigatório">
            {erro}
          </Alert>
        )}

        {resultado && resultado.length > 0 && (
          <Table striped highlightOnHover mt="xl">
            <Table.Thead>
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
                  <Table.Td>{item.nome}</Table.Td>
                  <Table.Td>{item.masp}</Table.Td>
                  <Table.Td>{item.sre}</Table.Td>
                  <Table.Td>{item.carreira}</Table.Td>
                  <Table.Td>{item.nivelAtual}</Table.Td>
                  <Table.Td>{item.grauAtual}</Table.Td>
                  <Table.Td>{item.novoNivel}</Table.Td>
                  <Table.Td>{item.novoGrau}</Table.Td>
                  <Table.Td>{item.vigencia}</Table.Td>
                  <Table.Td>{item.publicacao}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
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
