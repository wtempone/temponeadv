import { useEffect, useMemo, useState } from 'react';
import { MantineReactTable, useMantineReactTable, MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
import { MRT_Localization_PT_BR } from 'mantine-react-table/locales/pt-BR/index.cjs';
import {
  AddPerguntasFrequentes,
  DeletePerguntasFrequentes,
  ListPerguntasFrequentes,
  UpdatePerguntasFrequentes,
  PerguntasFrequentes,
} from '~/lib/repositories/perguntasRepository';
import { Button, Modal, Flex, Tooltip, ActionIcon } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { FormPerguntasFrequentes } from '../Edit/FormPerguntasFrequentes';
import { notifications } from '@mantine/notifications';

export function ListaPerguntasFrequentes() {
  const [data, setData] = useState<PerguntasFrequentes[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingRow, setEditingRow] = useState<PerguntasFrequentes | null>(null);
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns = useMemo<MRT_ColumnDef<PerguntasFrequentes>[]>(
    () => [
      { accessorKey: 'ordem', header: 'Ordem' },
      { accessorKey: 'question', header: 'Pergunta' },
      { accessorKey: 'response', header: 'Resposta' },
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
      const result = await ListPerguntasFrequentes();
      setData(result);
    }
    load();
  }, []);

  const handleEdit = (row: MRT_Row<PerguntasFrequentes>) => {
    setEditingRow(row.original);
    setModalOpened(true);
  };

  const handleCreate = async (values: PerguntasFrequentes) => {
    await AddPerguntasFrequentes(values);
    notifications.show({
      title: 'Sucesso',
      message: 'Pergunta criada com sucesso!',
      color: 'green',
    });
    const updated = await ListPerguntasFrequentes();
    setData(updated);
    setEditingRow(null);
    setModalOpened(false);
  };

  const handleUpdate = async (values: PerguntasFrequentes) => {
    if (editingRow?.id) {
      const updatedItem: PerguntasFrequentes = {
        ordem: values.ordem,
        question: values.question,
        response: values.response,
      };
      await UpdatePerguntasFrequentes(editingRow.id, updatedItem);
      notifications.show({
        title: 'Sucesso',
        message: 'Pergunta atualizada com sucesso!',
        color: 'green',
      });
      const updated = await ListPerguntasFrequentes();
      setData(updated);
      setEditingRow(null);
      setModalOpened(false);
    }
  };

  const handleDelete = (row: MRT_Row<PerguntasFrequentes>) => {
    setDeleteId(row.original.id ?? null);
    setDeleteOpened(true);
  };

  return (
    <>
      <Button onClick={() => setModalOpened(true)} mb="md">
        Nova Pergunta Frequente
      </Button>

      <FormPerguntasFrequentes
        key={editingRow?.id ?? 'new'}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingRow(null);
        }}
        onSubmit={editingRow ? handleUpdate : handleCreate}
        initialValues={editingRow ?? { ordem: 0, question: '', response: '' }}
        existingData={data}
      />

      <Modal opened={deleteOpened} onClose={() => setDeleteOpened(false)} title="Confirmar exclusão">
        <p>Tem certeza que deseja excluir esta pergunta?</p>
        <Button
          color="red"
          onClick={async () => {
            if (deleteId) {
              await DeletePerguntasFrequentes(deleteId);
              const updated = await ListPerguntasFrequentes();
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
