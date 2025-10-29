import { useEffect, useState } from 'react';
import { MantineReactTable, useMantineReactTable, MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
import { Modal, TextInput, NumberInput, Button, Group, ActionIcon } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { Nivel, TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import { GrauTable } from './GrauTable';

export function NivelTable({
  vigenciaId,
  cargaId,
  carreiraId,
}: {
  vigenciaId: string;
  cargaId: string;
  carreiraId: string;
}) {
  const [data, setData] = useState<Nivel[]>([]);
  const [editingRow, setEditingRow] = useState<MRT_Row<Nivel> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formValues, setFormValues] = useState<Nivel>({ nivel: 0, descricao: '' });
  const repo = new TabelaSalarialRepository();

  useEffect(() => {
    repo.getNiveis(vigenciaId, cargaId, carreiraId).then(setData);
  }, [vigenciaId, cargaId, carreiraId]);

  const columns: MRT_ColumnDef<Nivel>[] = [
    { accessorKey: 'nivel', header: 'Nível' },
    { accessorKey: 'descricao', header: 'Descrição' },
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
          setFormValues({ nivel: 0, descricao: '' });
          setIsCreating(true);
        }}
      >
        <IconPlus size={20} />
      </ActionIcon>
    ),
    renderDetailPanel: ({ row }) => (
      <GrauTable vigenciaId={vigenciaId} cargaId={cargaId} carreiraId={carreiraId} nivelId={row.original.id!} />
    ),
  });

  const handleEdit = (row: MRT_Row<Nivel>) => {
    setEditingRow(row);
    setFormValues({ ...row.original });
  };

  const handleDelete = async (id: string) => {
    await repo.deleteNivel(vigenciaId, cargaId, carreiraId, id);
    repo.getNiveis(vigenciaId, cargaId, carreiraId).then(setData);
  };

  const handleSave = async () => {
    if (isCreating) {
      await repo.addNivel(vigenciaId, cargaId, carreiraId, formValues);
    } else if (editingRow) {
      await repo.updateNivel(vigenciaId, cargaId, carreiraId, editingRow.original.id!, formValues);
    }
    repo.getNiveis(vigenciaId, cargaId, carreiraId).then(setData);
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
        title={isCreating ? 'Novo Nível' : 'Editar Nível'}
        centered
      >
        <NumberInput
          label="Nível"
          value={formValues.nivel}
          onChange={(value) =>
            setFormValues({ ...formValues, nivel: typeof value === 'number' ? value : Number(value) || 0 })
          }
        />
        <TextInput
          label="Descrição"
          value={formValues.descricao}
          onChange={(e) => setFormValues({ ...formValues, descricao: e.currentTarget.value })}
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
