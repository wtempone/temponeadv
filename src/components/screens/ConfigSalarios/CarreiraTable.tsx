import { useEffect, useState } from 'react';
import { MantineReactTable, useMantineReactTable, MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
import { Modal, TextInput, Button, Group, ActionIcon } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { Carreira, TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import { NivelTable } from './NivelTable';

export function CarreiraTable({ vigenciaId, cargaId }: { vigenciaId: string; cargaId: string }) {
  const [data, setData] = useState<Carreira[]>([]);
  const [editingRow, setEditingRow] = useState<MRT_Row<Carreira> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formValues, setFormValues] = useState<Carreira>({ nome: '', sigla: '' });
  const repo = new TabelaSalarialRepository();

  useEffect(() => {
    repo.getCarreiras(vigenciaId, cargaId).then(setData);
  }, [vigenciaId, cargaId]);

  const columns: MRT_ColumnDef<Carreira>[] = [
    { accessorKey: 'sigla', header: 'Sigla' },
    { accessorKey: 'nome', header: 'Nome' },
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
          setFormValues({ nome: '', sigla: '' });
          setIsCreating(true);
        }}
      >
        <IconPlus size={20} />
      </ActionIcon>
    ),
    renderDetailPanel: ({ row }) => (
      <NivelTable vigenciaId={vigenciaId} cargaId={cargaId} carreiraId={row.original.id!} />
    ),
  });

  const handleEdit = (row: MRT_Row<Carreira>) => {
    setEditingRow(row);
    setFormValues({ ...row.original });
  };

  const handleDelete = async (id: string) => {
    await repo.deleteCarreira(vigenciaId, cargaId, id);
    repo.getCarreiras(vigenciaId, cargaId).then(setData);
  };

  const handleSave = async () => {
    if (isCreating) {
      await repo.addCarreira(vigenciaId, cargaId, formValues);
    } else if (editingRow) {
      await repo.updateCarreira(vigenciaId, cargaId, editingRow.original.id!, formValues);
    }
    repo.getCarreiras(vigenciaId, cargaId).then(setData);
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
        title={isCreating ? 'Nova Carreira' : 'Editar Carreira'}
        centered
      >
        <TextInput
          label="Sigla"
          value={formValues.sigla}
          onChange={(e) => setFormValues({ ...formValues, sigla: e.currentTarget.value })}
        />
        <TextInput
          label="Nome"
          value={formValues.nome}
          onChange={(e) => setFormValues({ ...formValues, nome: e.currentTarget.value })}
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
