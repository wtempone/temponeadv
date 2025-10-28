import { useEffect, useMemo, useState } from 'react';
import { MantineReactTable, useMantineReactTable, MRT_ColumnDef, MRT_Row } from 'mantine-react-table';
import { MRT_Localization_PT_BR } from 'mantine-react-table/locales/pt-BR/index.cjs';
import {
  AddAreaAtuacao,
  DeleteAreaAtuacao,
  ListAreaAtuacao,
  UpdateAreaAtuacao,
  AreaAtuacao,
} from '~/lib/repositories/areasAtuacaoRepository';
import { Button, Modal, Flex, Tooltip, ActionIcon } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { FormAreaAtuacao } from '../Edit/FormAreaAtuacao';
import { notifications } from '@mantine/notifications';
export function ListaAreaAtuacao() {
  const [data, setData] = useState<AreaAtuacao[]>([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingRow, setEditingRow] = useState<AreaAtuacao | null>(null);
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns = useMemo<MRT_ColumnDef<AreaAtuacao>[]>(
    () => [
      { accessorKey: 'ordem', header: 'Ordem' },
      { accessorKey: 'title', header: 'Título' },
      { accessorKey: 'description', header: 'Descrição' },
      {
        accessorKey: 'link',
        header: 'Link',
        Cell: ({ row }) => {
          const url = row.original.link;
          const label = row.original.titleLink || url;
          return url ? (
            <a href={url} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          ) : (
            '-'
          );
        },
      },
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
      const result = await ListAreaAtuacao();
      setData(result);
    }
    load();
  }, []);

  const handleEdit = (row: MRT_Row<AreaAtuacao>) => {
    setEditingRow(row.original);
    setModalOpened(true);
  };

  const handleCreate = async (values: AreaAtuacao) => {
    await AddAreaAtuacao(values);
    notifications.show({
      title: 'Sucesso',
      message: 'Área criada com sucesso!',
      color: 'green',
    });
    const updated = await ListAreaAtuacao();
    setData(updated);
    setEditingRow(null);
    setModalOpened(false);
  };

  const handleUpdate = async (values: AreaAtuacao) => {
    if (editingRow?.id) {
      const updatedArea: AreaAtuacao = {
        ordem: values.ordem,
        title: values.title,
        description: values.description,
        link: values.link,
        titleLink: values.titleLink,
      };

      await UpdateAreaAtuacao(editingRow.id, updatedArea);
      notifications.show({
        title: 'Sucesso',
        message: 'Área de atuação atualizada com sucesso!',
        color: 'green',
      });
      const updated = await ListAreaAtuacao();
      setData(updated);
      setEditingRow(null);
      setModalOpened(false);
    }
  };

  const handleDelete = (row: MRT_Row<AreaAtuacao>) => {
    setDeleteId(row.original.id ?? null);
    setDeleteOpened(true);
  };

  return (
    <>
      <Button onClick={() => setModalOpened(true)} mb="md">
        Nova Área de Atuação
      </Button>

      <FormAreaAtuacao
        key={editingRow?.id ?? 'new'}
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingRow(null);
        }}
        onSubmit={editingRow ? handleUpdate : handleCreate}
        initialValues={editingRow ?? { ordem: 0, title: '', description: '', link: '', titleLink: '' }}
        existingData={data}
      />

      <Modal opened={deleteOpened} onClose={() => setDeleteOpened(false)} title="Confirmar exclusão">
        <p>Tem certeza que deseja excluir esta área de atuação?</p>
        <Button
          color="red"
          onClick={async () => {
            if (deleteId) {
              await DeleteAreaAtuacao(deleteId);
              const updated = await ListAreaAtuacao();
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
