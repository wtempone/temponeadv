import { Card, Stack, Text, Title, Group, Divider, ThemeIcon, SimpleGrid, Badge, Button } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { FaSearchDollar, FaCheck } from 'react-icons/fa';
import { IoAlert } from 'react-icons/io5';
import { MdContentPasteSearch } from 'react-icons/md';
import { toSafeDate } from '~/lib/utils/toSafeDate';

type RecursoItem = {
  vigencia: string;
  publicacao: string;
  alteracao: string;
  valor: string;
  direfencaMensal: string;
  qtdMeses: number;
};

type Props = {
  recursos: RecursoItem[];
  valorTotal: string;
  nomeServidor?: string;
};

export function CardResumoInformativo({ recursos, valorTotal, nomeServidor }: Props) {
  return (
    <Card withBorder shadow="sm" radius="md" mt="xl" padding="lg">
      <Group align="center" mb="xs">
        <ThemeIcon color="green.9" size="lg" radius="md">
          <FaSearchDollar size={20} />
        </ThemeIcon>
        <Title order={4} c="green.9">
          Oportunidades identificadas — reveja seu direito agora
        </Title>
      </Group>

      {nomeServidor && (
        <Text size="sm" fw={600} c="gray.7" mb="xs" mt="md">
          Olá, {nomeServidor}! <br /> Encontramos possíveis valores retroativos que podem ser devidos a promoções não
          aplicadas.
        </Text>
      )}

      <Text size="sm" c="gray.7" mb="md">
        Nossa análise rápida e gratuita aponta oportunidades reais de recuperação de valores. Conte com uma equipe
        especializada e fluxos automatizados que aceleram e garantem a excelência no ajuizamento das ações.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 2 }} mb="md">
        {recursos.map((r, idx) => (
          <Card withBorder padding="lg" radius="md" key={idx}>
            <Title order={5} mb="sm" c="dimmed">
              Promoção {recursos.length > 1 && `${idx + 1}`}
            </Title>
            <Text fz="md" fw={600} c="green.9" mb="xs">
              {r.alteracao}
            </Text>

            <Group justify="space-between">
              <Stack gap={2} align="flex-start">
                <Text c="dimmed" fz="md" m={0}>
                  Intervalo
                </Text>
                <Badge color="green.0" bg="green.9" size="xl">
                  {r.qtdMeses} mês{r.qtdMeses !== 1 ? 'es' : ''}
                </Badge>
                <Badge color="green.9" variant="light" size="md">
                  {r.vigencia} → {r.publicacao}
                </Badge>
              </Stack>
            </Group>

            <Group justify="space-between" mt="md">
              <Text c="dimmed" fz="md">
                Valor acumulado:
              </Text>
              <Text ta="right" span fw={700} c="green.9">
                {r.valor}
              </Text>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {recursos.length > 1 && (
        <>
          <Group align="center" mb={4}>
            <ThemeIcon color="green.9" size="sm" radius="xl">
              <IconChartBar size={16} />
            </ThemeIcon>
            <Text size="sm" fw={700} c="green.9">
              Total estimado a recuperar
            </Text>
          </Group>

          <Text size="lg" ta="right" fw={800} c="green.9" ml="lg" mb="md">
            {valorTotal}
          </Text>
        </>
      )}
      <Divider mb="sm" />
      <Group align="center" mb={4}>
        <ThemeIcon color="green.9" size="sm" radius="xl">
          <MdContentPasteSearch size={16} />
        </ThemeIcon>
        <Text size="sm" fw={700} c="green.9">
          O que foi verificado
        </Text>
      </Group>

      <Stack mb="md" ml="lg">
        <Text size="sm" c="gray.7">
          • Períodos de vigência e publicação das promoções
        </Text>
        <Text size="sm" c="gray.7">
          • Alterações de nível e grau previstas no seu histórico
        </Text>
        <Text size="sm" c="gray.7">
          • Comparação do salário recebido mês a mês versus o devido
        </Text>
        <Text size="sm" c="gray.7">
          • Diferenças acumuladas passíveis de cobrança
        </Text>
      </Stack>
      <Divider mb="sm" />

      <Group align="center" mb={4}>
        <ThemeIcon color="green.9" size="sm" radius="xl">
          <FaCheck size={16} />
        </ThemeIcon>
        <Text size="sm" fw={700} c="green.9">
          Por que escolher nossa assessoria
        </Text>
      </Group>

      <Stack mb="md" ml="lg">
        <Text size="sm" c="gray.7">
          • Equipe especializada em Direito Administrativo e Previdenciário, com histórico comprovado de resultados
        </Text>
        <Text size="sm" c="gray.7">
          • Processos com fluxos automatizados que reduzem prazos e custos operacionais
        </Text>
        <Text size="sm" c="gray.7">
          • Atendimento dedicado e acompanhamento transparente em todas as etapas
        </Text>
        <Text size="sm" c="gray.7">
          • Estratégia orientada à máxima recuperação com rapidez e segurança jurídica
        </Text>
      </Stack>

      <Divider mb="sm" />

      <Group align="center" mb={4}>
        <ThemeIcon color="green.9" size="sm" radius="xl">
          <IoAlert size={16} />
        </ThemeIcon>
        <Text size="sm" fw={700} c="green.9">
          Próximo passo
        </Text>
      </Group>

      <Text size="sm" c="gray.7" ml="lg" mb="md">
        Este demonstrativo é informativo. Se deseja transformar esta oportunidade em ação concreta, nossa equipe está
        pronta para assumir: fazemos a análise detalhada, produzimos toda a documentação e ajuizamos com agilidade,
        garantindo excelência técnica e transparência. Contrate nossa assessoria e acelere a recuperação dos seus
        valores.
      </Text>

      <Group justify="right" mt="sm">
        <Button radius="md" variant="filled" size="sm">
          Solicitar análise detalhada
        </Button>
      </Group>
    </Card>
  );
}
