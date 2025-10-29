import { Table } from '@mantine/core';
import dayjs from 'dayjs';

export function TabelaResultadoPromocao({
  vigencia,
  publicacao,
  carreiraAtual,
  carreiraNova,
  salarioAtual,
  salarioNovo,
  nivelAtual,
  novoNivel,
  grauAtual,
  novoGrau,
}: {
  vigencia: Date;
  publicacao: Date;
  carreiraAtual: string;
  carreiraNova: string;
  salarioAtual: number;
  salarioNovo: number;
  nivelAtual: string;
  novoNivel: string;
  grauAtual: string;
  novoGrau: string;
}) {
  const meses: dayjs.Dayjs[] = [];
  let cursor = dayjs(vigencia).startOf('month');
  const fim = dayjs(publicacao).startOf('month');

  while (cursor.isBefore(fim) || cursor.isSame(fim)) {
    meses.push(cursor);
    cursor = cursor.add(1, 'month');
  }

  const diferencaMonetaria = salarioNovo - salarioAtual;
  const total = diferencaMonetaria * meses.length;

  const descricaoCalculo: string[] = [];
  if (nivelAtual !== novoNivel) {
    descricaoCalculo.push(`Nível: ${nivelAtual} → ${novoNivel}`);
  }
  if (grauAtual !== novoGrau) {
    descricaoCalculo.push(`Grau: ${grauAtual} → ${novoGrau}`);
  }

  return (
    <Table withColumnBorders highlightOnHover withTableBorder bdrs={10} mt="md">
      <Table.Thead bg="green.9" c="green.1">
        <Table.Tr>
          <Table.Th>Mês / Ano</Table.Th>
          <Table.Th>Cargo ocupado</Table.Th>
          <Table.Th>Cargo deveria ocupar</Table.Th>
          <Table.Th ta="right">Salário Recebido</Table.Th>
          <Table.Th ta="right">Salário que deveria receber</Table.Th>
          <Table.Th>Descrição do cálculo</Table.Th>
          <Table.Th>Diferença monetária</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {meses.map((m, idx) => (
          <Table.Tr key={idx}>
            <Table.Td>{m.format('MM/YYYY')}</Table.Td>
            <Table.Td>{carreiraAtual}</Table.Td>
            <Table.Td>{carreiraNova}</Table.Td>
            <Table.Td ta="right">R$ {salarioAtual.toFixed(2)}</Table.Td>
            <Table.Td ta="right">R$ {salarioNovo.toFixed(2)}</Table.Td>
            <Table.Td>{descricaoCalculo.join(' | ') || 'Sem alteração'}</Table.Td>
            <Table.Td ta="right">R$ {diferencaMonetaria.toFixed(2)}</Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr>
          <Table.Td colSpan={6} style={{ textAlign: 'right', fontWeight: 'bold' }}>
            Total acumulado:
          </Table.Td>
          <Table.Td ta="right" style={{ fontWeight: 'bold' }}>
            R$ {total.toFixed(2)}
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
