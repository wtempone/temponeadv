import { useEffect, useState } from 'react';
import { MantineReactTable, useMantineReactTable, MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
import { Modal, TextInput, NumberInput, Button, Group, ActionIcon } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { Grau, TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';

export function GrauTable({
  vigenciaId,
  cargaId,
  carreiraId,
  nivelId,
}: {
  vigenciaId: string;
  cargaId: string;
  carreiraId: string;
  nivelId: string;
}) {
  const [data, setData] = useState<Grau[]>([]);
  const [editingRow, setEditingRow] = useState<MRT_Row<Grau> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formValues, setFormValues] = useState<Grau>({ grau: '', salario: 0 });
  const repo = new TabelaSalarialRepository();

  useEffect(() => {
    repo.getGraus(vigenciaId, cargaId, carreiraId, nivelId).then(setData);
  }, [vigenciaId, cargaId, carreiraId, nivelId]);

  const columns: MRT_ColumnDef<Grau>[] = [
    { accessorKey: 'grau', header: 'Grau' },
    { accessorKey: 'salario', header: 'Salário' },
  ];

  const table = useMantineReactTable({
    columns,
    data,
    renderBottomToolbar: false,
    enableEditing: true,
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
          setFormValues({ grau: '', salario: 0 });
          setIsCreating(true);
        }}
      >
        <IconPlus size={20} />
      </ActionIcon>
    ),
  });

  const handleEdit = (row: MRT_Row<Grau>) => {
    setEditingRow(row);
    setFormValues({ ...row.original });
  };

  const handleDelete = async (id: string) => {
    await repo.deleteGrau(vigenciaId, cargaId, carreiraId, nivelId, id);
    repo.getGraus(vigenciaId, cargaId, carreiraId, nivelId).then(setData);
  };

  const handleSave = async () => {
    if (isCreating) {
      await repo.addGrau(vigenciaId, cargaId, carreiraId, nivelId, formValues);
    } else if (editingRow) {
      await repo.updateGrau(vigenciaId, cargaId, carreiraId, nivelId, editingRow.original.id!, formValues);
    }
    repo.getGraus(vigenciaId, cargaId, carreiraId, nivelId).then(setData);
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
        title={isCreating ? 'Novo Grau' : 'Editar Grau'}
        centered
      >
        <TextInput
          label="Grau"
          value={formValues.grau}
          onChange={(e) => setFormValues({ ...formValues, grau: e.currentTarget.value })}
        />
        <NumberInput
          label="Salário"
          value={formValues.salario}
          onChange={(value) =>
            setFormValues({
              ...formValues,
              salario: typeof value === 'number' ? value : Number(value) || 0,
            })
          }
          min={0}
          decimalScale={2}
          step={100}
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
