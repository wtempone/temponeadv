import { useEffect, useMemo, useState } from 'react';
import { MantineReactTable, useMantineReactTable, MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
import { MRT_Localization_PT_BR } from 'mantine-react-table/locales/pt-BR/index.cjs';
import {
  AddFuncionario,
  DeleteFuncionario,
  ListFuncionario,
  UpdateFuncionario,
  Funcionario,
} from '~/lib/repositories/funcionariosRepository';
import { Button, Modal, Flex, Tooltip, ActionIcon, Avatar } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { FormFuncionario } from '../Edit/FormFuncionario';
import { notifications } from '@mantine/notifications';
import { ref, deleteObject } from 'firebase/storage';
import { useStorage } from '~/lib/firebase';

export function ListaFuncionarios() {
  const [data, setData] = useState<Funcionario[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingRow, setEditingRow] = useState<Funcionario | null>(null);
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns = useMemo<MRT_ColumnDef<Funcionario>[]>(
    () => [
      {
        accessorKey: 'fotoUrl',
        header: 'Foto',
        Cell: ({ cell }) => <Avatar src={cell.getValue<string>()} radius="xl" />,
      },
      { accessorKey: 'name', header: 'Nome' },
      { accessorKey: 'description', header: 'Descrição' },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data,
    enableEditing: true,
    localization: MRT_Localization_PT_BR,
    renderRowActions: ({ row }) => (
      <Flex gap="md">
        <Tooltip label="Editar">
          <ActionIcon onClick={() => handleEdit(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Excluir">
          <ActionIcon color="red" onClick={() => handleDelete(row)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
  });

  useEffect(() => {
    async function load() {
      const result = await ListFuncionario();
      setData(result);
    }
    load();
  }, []);

  const handleEdit = (row: MRT_Row<Funcionario>) => {
    setEditingRow(row.original);
    setModalOpened(true);
  };

  const handleCreate = async (values: Funcionario) => {
    await AddFuncionario(values);
    notifications.show({
      title: 'Sucesso',
      message: 'Funcionário criado com sucesso!',
      color: 'green',
    });
    const updated = await ListFuncionario();
    setData(updated);
    setEditingRow(null);
    setModalOpened(false);
  };

  const handleUpdate = async (values: Funcionario) => {
    if (editingRow?.id) {
      const updatedFuncionario: Funcionario = {
        name: values.name,
        description: values.description,
        fotoUrl: values.fotoUrl,
      };
      await UpdateFuncionario(editingRow.id, updatedFuncionario);
      notifications.show({
        title: 'Sucesso',
        message: 'Funcionário atualizado com sucesso!',
        color: 'green',
      });
      const updated = await ListFuncionario();
      setData(updated);
      setEditingRow(null);
      setModalOpened(false);
    }
  };

  const handleDelete = (row: MRT_Row<Funcionario>) => {
    setDeleteId(row.original.id ?? null);
    setDeleteOpened(true);
  };

  return (
    <>
      <Button onClick={() => setModalOpened(true)} mb="md">
        Novo Funcionário
      </Button>

      <FormFuncionario
        key={editingRow?.id ?? 'new'}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingRow(null);
        }}
        onSubmit={editingRow ? handleUpdate : handleCreate}
        initialValues={editingRow ?? { name: '', description: '', fotoUrl: '' }}
        existingData={data}
      />

      <Modal opened={deleteOpened} onClose={() => setDeleteOpened(false)} title="Confirmar exclusão">
        <p>Tem certeza que deseja excluir este funcionário?</p>
        <Button
          color="red"
          onClick={async () => {
            if (deleteId) {
              const funcionario = data.find((f) => f.id === deleteId);
              if (funcionario?.fotoUrl && funcionario.fotoUrl.startsWith('https')) {
                try {
                  const imagePath = decodeURIComponent(
                    new URL(funcionario.fotoUrl).pathname.replace(/^\/v0\/b\/[^/]+\/o\//, '').replace(/\?.*$/, ''),
                  );
                  const storage = useStorage();
                  const imageRef = ref(storage, imagePath);
                  await deleteObject(imageRef);
                } catch (error) {
                  console.warn('Erro ao excluir imagem do funcionário:', error);
                }
              }

              await DeleteFuncionario(deleteId);
              const updated = await ListFuncionario();
              setData(updated);
              setDeleteOpened(false);
              setDeleteId(null);
            }
          }}
        >
          Confirmar
        </Button>
      </Modal>

      <MantineReactTable table={table} />
    </>
  );
}
