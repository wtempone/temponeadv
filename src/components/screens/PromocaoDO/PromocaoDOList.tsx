import { useEffect, useState } from 'react';
import { PromocaoDO } from '~/lib/repositories/promocoesDORepository';
import { PromocaoDORepository } from '~/lib/repositories/promocoesDORepository';
import { MantineReactTable, MRT_ColumnDef, MRT_PaginationState, MRT_SortingState } from 'mantine-react-table';
import { Box, Button, Group, Stack, Title } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

export function PromocaoDOList() {
  const [data, setData] = useState<(PromocaoDO & { id: string })[]>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowCount, setRowCount] = useState(0);
  const repo = new PromocaoDORepository();

  async function load() {
    const result = await repo.listPaginated({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sortBy: sorting[0]?.id || 'vigencia',
      sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
      filter: globalFilter,
    });
    setData(result.items);
    setRowCount(result.total);
  }

  async function handleDelete(id: string) {
    await repo.delete(id);
    await load();
  }

  useEffect(() => {
    load();
  }, [pagination, sorting, globalFilter]);

  const columns: MRT_ColumnDef<PromocaoDO & { id: string }>[] = [
    { accessorKey: 'nome', header: 'Nome' },
    { accessorKey: 'masp', header: 'MASP' },
    { accessorKey: 'sre', header: 'SRE' },
    { accessorKey: 'numeroAdm', header: 'Número ADM' },
    { accessorKey: 'carreira', header: 'Carreira' },
    { accessorKey: 'nivelAtual', header: 'Nível Atual' },
    { accessorKey: 'grauAtual', header: 'Grau Atual' },
    { accessorKey: 'novoNivel', header: 'Novo Nível' },
    { accessorKey: 'novoGrau', header: 'Novo Grau' },
    {
      accessorKey: 'vigencia',
      header: 'Vigência',
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'publicacao',
      header: 'Publicação',
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'id',
      header: 'Ações',
      Cell: ({ cell }) => (
        <Button
          size="xs"
          color="red"
          onClick={() => handleDelete(cell.getValue<string>())}
          leftSection={<IconTrash size={14} />}
        >
          Excluir
        </Button>
      ),
    },
  ];

  return (
    <Stack mt="xl">
      <Title order={4}>Promoções do Diário Oficial</Title>
      <Box>
        <MantineReactTable
          columns={columns}
          data={data}
          rowCount={rowCount}
          enablePagination
          enableSorting
          enableGlobalFilter
          enableColumnFilters
          manualPagination
          manualSorting
          manualFiltering
          state={{
            pagination,
            sorting,
            globalFilter,
            showAlertBanner: true,
            showProgressBars: false,
          }}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onGlobalFilterChange={setGlobalFilter}
          mantineToolbarAlertBannerProps={{
            children: 'Dados carregados com paginação e filtros ativos.',
          }}
        />
      </Box>
    </Stack>
  );
}
