import { Box, Button, Stack, Title, LoadingOverlay, Group } from '@mantine/core';
import { IconChevronRight, IconCalendar, IconTrash } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import dayjs from 'dayjs';
import { CarreirasTable } from './CarreirasTable';
import classes from './TabelaSalarialViewer.module.css';
import { modals } from '@mantine/modals';

function parseDateLocal(dateLike: string | Date): Date | null {
  if (!dateLike) return null;
  if (dateLike instanceof Date) return new Date(dateLike.getFullYear(), dateLike.getMonth(), dateLike.getDate());
  const s = String(dateLike).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    const day = Number(m[3]);
    return new Date(year, month, day);
  }
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function TabelaSalarialViewer() {
  const [vigencias, setVigencias] = useState<any[]>([]);
  const [expandedVigencias, setExpandedVigencias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const repo = new TabelaSalarialRepository();
    repo.getVigencias().then(setVigencias).catch(console.error);
  }, []);

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const repo = new TabelaSalarialRepository();
      const dataInicial = parseDateLocal(parsed.dataInicial);
      const dataFinal = parseDateLocal(parsed.dataFinal);
      if (!dataInicial || !dataFinal) throw new Error('Datas inválidas no arquivo de importação');

      await repo.addVigencia({
        descricao: parsed.descricao,
        dataInicial,
        dataFinal,
      });

      const vigencia = (await repo.getVigencias()).find((v) => v.descricao === parsed.descricao);
      if (!vigencia) throw new Error('Erro ao localizar vigência criada');

      for (const carreira of parsed.carreiras ?? []) {
        await repo.addCarreira(vigencia.id!, carreira);
        const carreiraDoc = (await repo.getCarreiras(vigencia.id!)).find(
          (c) => c.nome === carreira.nome && c.sigla === carreira.sigla,
        );
        if (!carreiraDoc) continue;

        for (const carga of carreira.cargaHorariaSemanal ?? []) {
          await repo.addCarga(vigencia.id!, carreiraDoc.id!, carga);
          const cargaDoc = (await repo.getCargas(vigencia.id!, carreiraDoc.id!)).find(
            (c) => c.descricao === carga.descricao && Number(c.horasPorSemana) === Number(carga.horasPorSemana),
          );
          if (!cargaDoc) continue;

          for (const nivel of carga.niveis ?? []) {
            await repo.addNivel(vigencia.id!, carreiraDoc.id!, cargaDoc.id!, nivel);
            const nivelDoc = (await repo.getNiveis(vigencia.id!, carreiraDoc.id!, cargaDoc.id!)).find(
              (n) => Number(n.nivel) === Number(nivel.nivel),
            );
            if (!nivelDoc) continue;

            for (const grau of nivel.graus ?? []) {
              await repo.addGrau(vigencia.id!, carreiraDoc.id!, cargaDoc.id!, nivelDoc.id!, grau);
            }
          }
        }
      }

      const updated = await repo.getVigencias();
      setVigencias(updated);
    } catch (err) {
      console.error('Erro ao importar arquivo', err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function confirmDeleteVigencia(id: string, descricao: string) {
    modals.openConfirmModal({
      title: 'Excluir vigência',
      children: `Tem certeza que deseja excluir a vigência "${descricao}"? Essa ação não pode ser desfeita.`,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const repo = new TabelaSalarialRepository();
        await repo.deleteVigencia(id);
        const updated = await repo.getVigencias();
        setVigencias(updated);
      },
    });
  }

  return (
    <Stack>
      <Group wrap="nowrap" justify="space-between" mb="md">
        <Title order={4}>Tabelas Salariais</Title>
        <Button onClick={() => fileInputRef.current?.click()} variant="filled" mb="md">
          Importar
        </Button>
      </Group>

      <input type="file" accept="application/json" ref={fileInputRef} onChange={handleImportFile} hidden />

      <DataTable
        emptyState={<></>}
        withColumnBorders
        highlightOnHover
        noHeader
        columns={[
          {
            accessor: 'descricao',
            render: ({ id, descricao }: any) => (
              <Box>
                <IconChevronRight
                  className={clsx(classes.icon, classes.expandIcon, {
                    [classes.expandIconRotated]: expandedVigencias.includes(id),
                  })}
                />
                <IconCalendar className={classes.icon} />
                {descricao}
              </Box>
            ),
          },
          {
            accessor: 'dataInicial',
            textAlign: 'right',
            render: ({ dataInicial }: any) => dayjs(dataInicial).format('DD/MM/YYYY'),
          },
          {
            accessor: 'dataFinal',
            textAlign: 'right',
            render: ({ dataFinal }: any) => dayjs(dataFinal).format('DD/MM/YYYY'),
          },
          {
            accessor: 'delete',
            textAlign: 'right',
            width: 40,
            render: ({ id, descricao }: any) => (
              <IconTrash
                style={{ cursor: 'pointer' }}
                color="red"
                size={18}
                onClick={() => confirmDeleteVigencia(id, descricao)}
              />
            ),
          },
        ]}
        records={vigencias}
        rowExpansion={{
          allowMultiple: true,
          expanded: {
            recordIds: expandedVigencias,
            onRecordIdsChange: setExpandedVigencias,
          },
          content: ({ record }) => <CarreirasTable vigenciaId={record.id} />,
        }}
      />

      <LoadingOverlay visible={loading} />
    </Stack>
  );
}
