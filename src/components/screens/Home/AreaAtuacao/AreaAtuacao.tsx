import { IconCookie, IconGauge, IconUser } from '@tabler/icons-react';
import { Badge, Card, Container, Group, SimpleGrid, Text, Title, useMantineTheme } from '@mantine/core';
import classes from './AreaAtuacao.module.css';
import { useEffect, useState } from 'react';
import { AreaAtuacao, ListAreaAtuacao } from '~/lib/repositories/areasAtuacaoRepository';
import { GiInjustice } from 'react-icons/gi';

export function AreaAtuacaoSection() {
  const [areaAtuacao, setAreaAtuacao] = useState<Array<AreaAtuacao>>([]);
  useEffect(() => {
    async function homeConfig() {
      await ListAreaAtuacao().then((areas) => {
        setAreaAtuacao(areas);
      });
    }
    homeConfig();
  }, []);

  const areas = areaAtuacao.map((area) => (
    <Card key={area.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <GiInjustice size={50} className={classes.icon} />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {area.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {area.description}
      </Text>
    </Card>
  ));

  return (
    <>
      <Title order={2} className={classes.title} ta="center" mt="sm">
        Áreas de Atuação
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Conheça as principais áreas em que atuamos para oferecer soluções jurídicas.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mt={50}>
        {areas}
      </SimpleGrid>
    </>
  );
}
