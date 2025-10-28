import { IconCookie, IconGauge, IconUser } from '@tabler/icons-react';
import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Text,
  Title,
  useMantineTheme,
  Image,
  Paper,
  Stack,
  Center,
} from '@mantine/core';
import classes from './OwnerCard.module.css';
import { useEffect, useState } from 'react';
import { AreaAtuacao, ListAreaAtuacao } from '~/lib/repositories/areasAtuacaoRepository';
import { useFirestore } from '~/lib/firebase';
import { GiInjustice } from 'react-icons/gi';
import ButtonWhatsapp from '../ButtonWhatsapp/ButtonWhatsapp';

export function OwnerCard() {
  return (
    <Paper className={classes.base} mt="lg" p="xl" radius="md">
      <Title order={2} className={classes.title} ta="center" mt="sm">
        Quem irá trabalhar ao seu favor
      </Title>

      <Card key="card1" shadow="md" radius="md" className={classes.card} padding="xl">
        <Group grow wrap="nowrap">
          <Image
            className={classes.image_owner}
            src="https://firebasestorage.googleapis.com/v0/b/temponeadv.firebasestorage.app/o/initial_links%2FCapa-Tempone5.png?alt=media&token=3c5589ea-e088-4b09-a51f-f92f3eb8038b"
            alt="Advogado Online"
          />
          <Stack className={classes.content_owner}>
            <Title order={2} className={classes.title_owner} ta="center" m="md">
              Dr. Bernardo Tempone Gomes Paizante
            </Title>
            <Text fz="xl" c="dimmed" m="md" ta="justify">
              Sou advogado pela Universidade Federal de Juiz de Fora. Antes de advogar, trabalhei por três anos no
              Tribunal de Justiça de Minas Gerais junto de juízes, assessores e servidores públicos da justiça. Durante
              esse tempo, tive a oportunidade de conhecer por dentro a justiça, como pensa os juízes e qual a melhor
              estratégia a ser tomada em cada caso. Sou filho de uma professora de português da rede estadual, e muito
              por conta dela pude perceber que muitos direitos dos servidores são negligenciados. Assim, advogo para os
              servidores com a certeza de que defendo os meus.
            </Text>
            <Center px="xl">
              <ButtonWhatsapp />
            </Center>
          </Stack>
        </Group>
      </Card>
    </Paper>
  );
}
