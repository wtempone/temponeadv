import { Box } from '@mantine/core';
import { IconChevronRight, IconClock } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import { NiveisTable } from './NiveisTable';
import classes from './TabelaSalarialViewer.module.css';

export function CargaTable({ vigenciaId, carreiraId }: { vigenciaId: string; carreiraId: string }) {
  const [cargas, setCargas] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    const repo = new TabelaSalarialRepository();
    if (!vigenciaId || !carreiraId) {
      setCargas([]);
      return;
    }
    repo.getCargas(vigenciaId, carreiraId).then(setCargas).catch(console.error);
  }, [vigenciaId, carreiraId]);

  return (
    <DataTable
      noHeader
      emptyState={<></>}
      withColumnBorders
      columns={[
        {
          accessor: 'descricao',
          render: ({ id, descricao }: any) => (
            <Box ml={20}>
              <IconChevronRight
                className={clsx(classes.icon, classes.expandIcon, {
                  [classes.expandIconRotated]: expanded.includes(id),
                })}
              />
              <IconClock className={classes.icon} />
              {descricao}
            </Box>
          ),
        },
        { accessor: 'horasPorSemana', textAlign: 'right', width: 100 },
      ]}
      records={cargas}
      rowExpansion={{
        allowMultiple: true,
        expanded: { recordIds: expanded, onRecordIdsChange: setExpanded },
        content: ({ record }) => <NiveisTable vigenciaId={vigenciaId} carreiraId={carreiraId} cargaId={record.id} />,
      }}
    />
  );
}
