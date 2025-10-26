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
  Avatar,
  Button,
} from '@mantine/core';
import classes from './EquipeCard.module.css';
import { useEffect, useRef, useState } from 'react';
import { useFirestore } from '~/lib/firebase';
import { GiInjustice } from 'react-icons/gi';
import ButtonWhatsapp from '../ButtonWhatsapp/ButtonWhatsapp';
import { Carousel } from '@mantine/carousel';
import { Funcionario, ListFuncionario } from '~/lib/repositories/funcionariosRepository';
import Autoplay from 'embla-carousel-autoplay';

export function EquipeCard() {
  const theme = useMantineTheme();
  const [funcionarios, setFuncionario] = useState<Array<Funcionario>>([]);
  const firestore = useFirestore();
  useEffect(() => {
    async function homeConfig() {
      await ListFuncionario().then((func) => {
        setFuncionario(func);
      });
    }
    homeConfig();
  }, []);

  function CardLink(membro: Funcionario) {
    return (
      <Card key={membro.id} shadow="md" radius="md" p="xl" m={0}>
        <Avatar src={membro.fotoUrl} size={120} radius={120} mx="auto" />
        <Text ta="center" fz="lg" fw={500} mt="md" c="primary">
          {membro.name}
        </Text>
        <Text ta="center" c="dimmed" fz="sm">
          {membro.description}
        </Text>

        <Button variant="primary" fullWidth mt="md">
          Envie uma mensagem
        </Button>
      </Card>
    );
  }

  const slides = funcionarios.map((item, index) => (
    <Carousel.Slide key={item.id}>
      <CardLink {...item} />
    </Carousel.Slide>
  ));

  const autoplay = useRef(Autoplay({ delay: 2000 }));

  return (
    <Paper mt="lg" p="xl" radius="md">
      <Title order={2} className={classes.title} ta="center" mt="sm">
        Nossa equipe
      </Title>
      <Carousel withIndicators slideSize="33.333333%" slideGap="md" align="start" slidesToScroll={1} loop>
        {slides}
      </Carousel>
    </Paper>
  );
}
