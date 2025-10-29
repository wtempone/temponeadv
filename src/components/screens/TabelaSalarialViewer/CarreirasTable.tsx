import { Box } from '@mantine/core';
import { IconChevronRight, IconSchool } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import { CargaTable } from './CargaTable';
import classes from './TabelaSalarialViewer.module.css';

export function CarreirasTable({ vigenciaId }: { vigenciaId: string }) {
  const [carreiras, setCarreiras] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    const repo = new TabelaSalarialRepository();
    repo.getCarreiras(vigenciaId).then(setCarreiras).catch(console.error);
  }, [vigenciaId]);

  return (
    <DataTable
      noHeader
      emptyState={<></>}
      withColumnBorders
      columns={[
        {
          accessor: 'nome',
          render: ({ id, nome }: any) => (
            <Box ml={10}>
              <IconChevronRight
                className={clsx(classes.icon, classes.expandIcon, {
                  [classes.expandIconRotated]: expanded.includes(id),
                })}
              />
              <IconSchool className={classes.icon} />
              {nome}
            </Box>
          ),
        },
        { accessor: 'sigla', textAlign: 'right', width: 100 },
      ]}
      records={carreiras}
      rowExpansion={{
        allowMultiple: true,
        expanded: { recordIds: expanded, onRecordIdsChange: setExpanded },
        content: ({ record }) => <CargaTable vigenciaId={vigenciaId} carreiraId={record.id} />,
      }}
    />
  );
}
