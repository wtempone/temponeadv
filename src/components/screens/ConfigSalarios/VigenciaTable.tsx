import { useEffect, useState } from 'react';
import { MantineReactTable, useMantineReactTable, MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
import { Modal, TextInput, Button, Group, ActionIcon } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { Vigencia, TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';
import { CargaTable } from './CargaTable';

export function VigenciaTable() {
  const [data, setData] = useState<Vigencia[]>([]);
  const [editingRow, setEditingRow] = useState<MRT_Row<Vigencia> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formValues, setFormValues] = useState<Vigencia>({
    descricao: '',
    dataInicial: new Date(),
    dataFinal: new Date(),
  });

  const repo = new TabelaSalarialRepository();

  useEffect(() => {
    repo.getVigencias().then(setData);
  }, []);

  const columns: MRT_ColumnDef<Vigencia>[] = [
    { accessorKey: 'descricao', header: 'Descrição' },
    {
      accessorKey: 'dataInicial',
      header: 'Início',
      Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(),
    },
    {
      accessorKey: 'dataFinal',
      header: 'Fim',
      Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(),
    },
  ];

  const table = useMantineReactTable({
    columns,
    data,
    renderBottomToolbar: false,
    enableEditing: true,
    enableExpanding: true,
    mantineTableProps: {
      striped: false,
      highlightOnHover: false,
      withColumnBorders: false,
      sizes: 'xs', // 👈 reduz o tamanho da fonte
      verticalSpacing: 'xs', // 👈 reduz o espaçamento vertical
      horizontalSpacing: 'xs', // 👈 reduz o espaçamento horizontal
      cellPadding: 'xs',
    },

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
          setFormValues({ descricao: '', dataInicial: new Date(), dataFinal: new Date() });
          setIsCreating(true);
        }}
      >
        <IconPlus size={20} />
      </ActionIcon>
    ),
    renderDetailPanel: ({ row }) => <CargaTable vigenciaId={row.original.id!} />,
  });

  const handleEdit = (row: MRT_Row<Vigencia>) => {
    setEditingRow(row);
    setFormValues({ ...row.original });
  };

  const handleDelete = async (id: string) => {
    await repo.deleteVigencia(id);
    repo.getVigencias().then(setData);
  };

  const handleSave = async () => {
    if (isCreating) {
      await repo.addVigencia(formValues);
    } else if (editingRow) {
      await repo.updateVigencia(editingRow.original.id!, formValues);
    }
    repo.getVigencias().then(setData);
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
        title={isCreating ? 'Nova Vigência' : 'Editar Vigência'}
        centered
      >
        <TextInput
          label="Descrição"
          value={formValues.descricao}
          onChange={(e) => setFormValues({ ...formValues, descricao: e.currentTarget.value })}
        />
        <DateInput
          label="Data Inicial"
          value={formValues.dataInicial}
          onChange={(value) => setFormValues({ ...formValues, dataInicial: value! })}
        />
        <DateInput
          label="Data Final"
          value={formValues.dataFinal}
          onChange={(value) => setFormValues({ ...formValues, dataFinal: value! })}
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
