import { Card, Group, Text, Menu, ActionIcon, Image, SimpleGrid, rem, Avatar, Center, Anchor, UnstyledButton, Paper } from '@mantine/core';
import { IconDots, IconEye, IconFileZip, IconHeart, IconPhoto, IconSettings, IconTrash } from '@tabler/icons-react';
import classes from './TimeLineActivity.module.css';
import { Link } from 'react-router-dom';
import { RiMovieLine } from "react-icons/ri";
import { FaListUl, FaPlay } from "react-icons/fa";
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

export default function TimeLineActivity(props: { DateActivity: any }) {
  const limitPilotos = 3;

  const pilotos = () => {
    return (
      <Center>
        <Avatar.Group>
          {props.DateActivity.pilotos.map((item: any, index: number) => (
            <Avatar key={index} size='lg' src={item.foto} />
          )).slice(0, limitPilotos)}
          {props.DateActivity.pilotos.length > limitPilotos && <Avatar size='lg'>
            +{props.DateActivity.pilotos.length - limitPilotos}
          </Avatar>}
        </Avatar.Group>
      </Center>
    )
  }

  const titulos = props.DateActivity.estatisticas.map((stat: any, index: number) => (
    <div key={index} className={classes.stats}>
      <Center>
        <Text ta='center'  size="xs" >
         {stat.titulo}
        </Text>
      </Center>
    </div>
  ));


  const valores = props.DateActivity.estatisticas.map((stat: any, index: number) => (
    <div key={index}>
      <Center>
        <Text fw={500} size="sm" className={classes.maior}>
          {stat.maior}
        </Text>
      </Center>
      {(props.DateActivity.pilotos.length > 1) && (
        <Center>
          <Text fw={200} size="xs" className={classes.menor}>
            {stat.menor ? stat.menor : 0}
          </Text>
        </Center>
      )}

    </div>
  ));
  const slides = props.DateActivity.photosURL.map((imagem: any, index: any) => (
    <Carousel.Slide key={index} >
      <Paper
        shadow="md"
        p="xl"
        radius="md"
        style={{ backgroundImage: `url(${imagem})` }}
        className={classes.card}
      >
      </Paper>
    </Carousel.Slide>
  ));
  const autoplay = useRef(Autoplay({ delay: 2000 }));

  return (
    <Card withBorder radius="md" mb='md'>
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Text fw={500}>{props.DateActivity.dataString}</Text>
          <Group>
            <UnstyledButton
              component={Link}
              variant="default"
              to={`/scene/ /${props.DateActivity.id}`}
              size="xl"
              aria-label="Abrir cena do dia"
            >
              <FaPlay />
            </UnstyledButton>
            <UnstyledButton
              component={Link}
              variant="default"
              to={`/activity/${props.DateActivity.id}`}
              size="xl"
              aria-label="Ir para lista de voos do dia"
            >
              <FaListUl />
            </UnstyledButton>
          </Group>
        </Group>
      </Card.Section>
      <Card.Section p="sm">

        <Paper p='sm' className={classes.pilotos}>
          <Center>
            <Text size='sm' >Pilotos </Text>
          </Center>
          <Center>
            {pilotos()}
          </Center>

        </Paper>
        
        {(props.DateActivity.photosURL.length > 0) && (

          <Carousel
            align="start"
            withIndicators
            key={props.DateActivity.id}
            plugins={[autoplay.current]}
            onMouseEnter={autoplay.current.stop}
            onMouseLeave={autoplay.current.reset}

          >
            {slides}
          </Carousel>
        )}

        {(props.DateActivity.photosURL.length == 0) && (
          <Paper

            p="xl"
            radius="md"
            className={classes.card}
          >
          </Paper>
        )}
      </Card.Section>

      <Card.Section className={classes.footer}>
        <SimpleGrid w='100%' cols={4}>
          {titulos}
          {valores}
        </SimpleGrid>
      </Card.Section>

    </Card>
  );
}