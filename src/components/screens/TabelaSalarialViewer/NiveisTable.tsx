import { Box } from '@mantine/core';
import { IconChevronRight, IconHierarchy } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import { GrausTable } from './GrausTable';
import classes from './TabelaSalarialViewer.module.css';

export function NiveisTable({
  vigenciaId,
  carreiraId,
  cargaId,
}: {
  vigenciaId: string;
  carreiraId: string;
  cargaId: string;
}) {
  const [niveis, setNiveis] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    const repo = new TabelaSalarialRepository();
    if (!vigenciaId || !carreiraId || !cargaId) {
      setNiveis([]);
      return;
    }
    repo.getNiveis(vigenciaId, carreiraId, cargaId).then(setNiveis).catch(console.error);
  }, [vigenciaId, carreiraId, cargaId]);

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
              <IconHierarchy className={classes.icon} />
              {descricao}
            </Box>
          ),
        },
        { accessor: 'nivel', textAlign: 'right', width: 100 },
      ]}
      records={niveis}
      rowExpansion={{
        allowMultiple: true,
        expanded: { recordIds: expanded, onRecordIdsChange: setExpanded },
        content: ({ record }) => (
          <GrausTable vigenciaId={vigenciaId} carreiraId={carreiraId} cargaId={cargaId} nivelId={record.id} />
        ),
      }}
    />
  );
}
