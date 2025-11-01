import { Table, Text } from '@mantine/core';

type Props = { resultado: any[] | null };

export default function TabelaPromocao({ resultado }: Props) {
  if (!resultado || resultado.length === 0) return null;

  return (
    <Table
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
            <Table.Td>{item.vigencia instanceof Date ? item.vigencia.toLocaleDateString('pt-BR') : '-'}</Table.Td>
            <Table.Td>{item.publicacao instanceof Date ? item.publicacao.toLocaleDateString('pt-BR') : '-'}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
