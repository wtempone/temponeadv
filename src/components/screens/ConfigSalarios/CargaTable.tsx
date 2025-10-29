import { useEffect, useState } from 'react';
import { MantineReactTable, useMantineReactTable, MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
import { Modal, TextInput, NumberInput, Button, Group, ActionIcon } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { CargaHoraria, TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import { CarreiraTable } from './CarreiraTable';

export function CargaTable({ vigenciaId }: { vigenciaId: string }) {
  const [data, setData] = useState<CargaHoraria[]>([]);
  const [editingRow, setEditingRow] = useState<MRT_Row<CargaHoraria> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formValues, setFormValues] = useState<CargaHoraria>({ descricao: '', horasPorSemana: 0 });
  const repo = new TabelaSalarialRepository();

  useEffect(() => {
    repo.getCargas(vigenciaId).then(setData);
  }, [vigenciaId]);

  const columns: MRT_ColumnDef<CargaHoraria>[] = [
    { accessorKey: 'descricao', header: 'Descrição' },
    { accessorKey: 'horasPorSemana', header: 'Horas/Semana' },
  ];

  const table = useMantineReactTable({
    columns,
    data,
    renderBottomToolbar: false,
    enableEditing: true,
    enableExpanding: true,
    renderRowActions: ({ row }) => (
      <Group gap="xs">
        <ActionIcon color="blue" onClick={() => handleEdit(row)}>
          <IconEdit size={18} />
        </ActionIcon>
        <ActionIcon color="red" onClick={() => handleDelete(row.original.id!)}>
          <IconTrash size={18} />
        </ActionIcon>
      </Group>
    ),
    renderTopToolbarCustomActions: () => (
      <ActionIcon
        color="green"
        onClick={() => {
          setFormValues({ descricao: '', horasPorSemana: 0 });
          setIsCreating(true);
        }}
      >
        <IconPlus size={20} />
      </ActionIcon>
    ),
    renderDetailPanel: ({ row }) => <CarreiraTable vigenciaId={vigenciaId} cargaId={row.original.id!} />,
  });

  const handleEdit = (row: MRT_Row<CargaHoraria>) => {
    setEditingRow(row);
    setFormValues({ ...row.original });
  };

  const handleDelete = async (id: string) => {
    await repo.deleteCarga(vigenciaId, id);
    repo.getCargas(vigenciaId).then(setData);
  };

  const handleSave = async () => {
    if (isCreating) {
      await repo.addCarga(vigenciaId, formValues);
    } else if (editingRow) {
      await repo.updateCarga(vigenciaId, editingRow.original.id!, formValues);
    }
    repo.getCargas(vigenciaId).then(setData);
    setEditingRow(null);
    setIsCreating(false);
  };

  return (
    <>
      <MantineReactTable table={table} />
      <Modal
        opened={!!editingRow || isCreating}
        onClose={() => {
          setEditingRow(null);
          setIsCreating(false);
        }}
        title={isCreating ? 'Nova Carga Horária' : 'Editar Carga Horária'}
        centered
      >
        <TextInput
          label="Descrição"
          value={formValues.descricao}
          onChange={(e) => setFormValues({ ...formValues, descricao: e.currentTarget.value })}
        />
        <NumberInput
          label="Horas por Semana"
          value={formValues.horasPorSemana}
          onChange={(value) =>
            setFormValues({
              ...formValues,
              horasPorSemana: typeof value === 'number' ? value : Number(value) || 0,
            })
          }
        />
        <Group mt="xl" justify="flex-end">
          <Button
            variant="default"
            onClick={() => {
              setEditingRow(null);
              setIsCreating(false);
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </Group>
      </Modal>
    </>
  );
}
