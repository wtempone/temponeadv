import { Badge, Table } from '@mantine/core';
import { useEffect, useState } from 'react';
import { TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';

export function GrausTable({
  vigenciaId,
  carreiraId,
  cargaId,
  nivelId,
}: {
  vigenciaId: string;
  carreiraId: string;
  cargaId: string;
  nivelId: string;
}) {
  const [graus, setGraus] = useState<any[]>([]);

  useEffect(() => {
    const repo = new TabelaSalarialRepository();
    if (!vigenciaId || !carreiraId || !cargaId || !nivelId) {
      setGraus([]);
      return;
    }
    repo.getGraus(vigenciaId, carreiraId, cargaId, nivelId).then(setGraus).catch(console.error);
  }, [vigenciaId, carreiraId, cargaId, nivelId]);

  return (
    <Table withColumnBorders highlightOnHover verticalSpacing={0} fz="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th ta="center">Grau</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>Salário</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {graus.map((g) => (
          <Table.Tr key={g.id}>
            <Table.Td align="center">{g.grau}</Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>R$ {Number(g.salario).toFixed(2)}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
