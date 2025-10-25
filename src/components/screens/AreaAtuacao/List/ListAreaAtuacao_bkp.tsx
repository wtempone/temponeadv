import { Anchor, Button, Group, Progress, Table, Text, Title, UnstyledButton } from '@mantine/core';
import classes from './ListAreaAtuacao.module.css';
import { useEffect, useState } from 'react';
import { useFirestore } from '~/lib/firebase';
import { AreaAtuacao, DeleteAreaAtuacao, ListAreaAtuacao } from '~/lib/repositories/areasAtuacaoRepository';
import { Link, useNavigate } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

export function ListaAreaAtuacao() {
  const [areaAtuacao, setAreaAtuacao] = useState<Array<AreaAtuacao>>([]);
  const firestore = useFirestore();
  useEffect(() => {
    async function homeConfig() {
      await ListAreaAtuacao().then((areas) => {
        setAreaAtuacao(areas);
      });
    }
    homeConfig();
  }, []);

  const rows = areaAtuacao.map((row) => {
    return (
      <Table.Tr key={row.title}>
        <Table.Td>{row.ordem}</Table.Td>
        <Table.Td>
          <UnstyledButton component={Link} to={`/areas_atuacao/edit/${row.id}`} aria-label="Ver perfil">
            {row.title}
          </UnstyledButton>
        </Table.Td>
        <Table.Td>{row.description}</Table.Td>
        <Table.Td>
          <Button variant="danger" onClick={() => openModalDelete(row.id!, row.title)}>
            Excluir
          </Button>
        </Table.Td>
      </Table.Tr>
    );
  });

  const openModalDelete = (id: string, title: string) =>
    modals.openConfirmModal({
      title: `Confirma a exclusão da área de atuação "${title}"?`,
      children: (
        <Text size="sm">Esta ação não pode ser desfeita. Esta área de atuação será removida permanentemente.</Text>
      ),
      labels: { confirm: 'Confirmar', cancel: 'Cancelar' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => handleDelete(id),
    });
  const handleDelete = async (id: string) => {
    DeleteAreaAtuacao(id).then(() => {
      setAreaAtuacao((prevAreas) => prevAreas.filter((area) => area.id !== id));
      notifications.show({
        title: 'Sucesso',
        message: 'Área de atuação excluída com sucesso!',
        color: 'green',
      });
    });
  };

  return (
    <>
      <Title className={classes.title} ta="center" mt="xs">
        Áreas de Atuação
      </Title>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ordem</Table.Th>
              <Table.Th>Título</Table.Th>
              <Table.Th>Descrição</Table.Th>
              <Table.Th>
                <Button component={Link} to={`/areas_atuacao/new`}>
                  Novo registro
                </Button>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
