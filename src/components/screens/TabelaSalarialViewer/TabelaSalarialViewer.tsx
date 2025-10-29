import { Box, Button, Stack, Title, LoadingOverlay, Group } from '@mantine/core';
import { IconChevronRight, IconCalendar } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import dayjs from 'dayjs';
import { CarreirasTable } from './CarreirasTable';
import classes from './TabelaSalarialViewer.module.css';

function parseDateLocal(dateLike: string | Date): Date | null {
  if (!dateLike && dateLike !== 0) return null;
  if (dateLike instanceof Date) return new Date(dateLike.getFullYear(), dateLike.getMonth(), dateLike.getDate());
  const s = String(dateLike).trim();
  // aceita formatos ISO simples "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss..." - para o primeiro, cria Date local
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    const day = Number(m[3]);
    return new Date(year, month, day);
  }
  // tentativa fallback: criar Date e normalizar para componente local (evita deslocamento de timezone)
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
      // criar vigência usando parseDateLocal para evitar shift de um dia
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

      // parsed.carreiras esperado conforme nova estrutura:
      // { carreiras: [{ nome, sigla, cargaHorariaSemanal: [ { descricao, horasPorSemana, niveis: [...] } ] }] }
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
