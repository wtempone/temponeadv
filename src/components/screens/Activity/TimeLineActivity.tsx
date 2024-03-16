import { Card, Group, Text, Menu, ActionIcon, Image, SimpleGrid, rem, Avatar, Center, Anchor, UnstyledButton } from '@mantine/core';
import { IconDots, IconEye, IconFileZip, IconHeart, IconPhoto, IconSettings, IconTrash } from '@tabler/icons-react';
import classes from './TimeLineActivity.module.css';
import { Link } from 'react-router-dom';
import { RiMovieLine } from "react-icons/ri";
import { FaListUl, FaPlay } from "react-icons/fa";

export default function TimeLineActivity(props: { DateActivity: any }) {
  const limitPilotos = 3;

  const pilotos = () => {
    return (
      <Center>
        <Avatar.Group>
          {props.DateActivity.pilotos.map((item: any,index:number) => (
            <Avatar key={index} size='lg' src={item.foto} />
          )).slice(0, limitPilotos)}
          {props.DateActivity.pilotos.length > limitPilotos && <Avatar size='lg'>
            +{props.DateActivity.pilotos.length - limitPilotos}
          </Avatar>}
        </Avatar.Group>
      </Center>
    )
  }

  const estatisticas = props.DateActivity.estatisticas.map((stat: any, index: number) => (
    <div key={index}>
      <Center>
        <Text size="xs" >
          {stat.titulo}
        </Text>
      </Center>
      <Center>
        <Text fw={500} size="sm" className={classes.maior}>
          {stat.maior}
        </Text>
      </Center>
      {(props.DateActivity.pilotos.length > 1) && (
        <Center>
          <Text fw={200} size="xs" className={classes.menor}>
            {stat.menor}
          </Text>
        </Center>
      )}

    </div>
  ));

  return (
    <Card withBorder shadow="sm" radius="md" mb='md'>
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
              <FaPlay/>
            </UnstyledButton>
            <UnstyledButton
              component={Link}
              variant="default"
              to={`/activity/${props.DateActivity.id}`}
              size="xl"
              aria-label="Ir para lista de voos do dia"
            >
              <FaListUl/>
            </UnstyledButton>
          </Group>
        </Group>
      </Card.Section>
      <Card.Section p="sm">
        <Center>
          <Text size='sm' >Pilotos</Text>
        </Center>
        <Center>
          {pilotos()}
        </Center>
      </Card.Section>
      {/*   
        <Card.Section inheritPadding mt="sm" pb="md">
          <SimpleGrid cols={3}>
            {images.map((image) => (
              <Image src={image} key={image} radius="sm" />
            ))}
          </SimpleGrid>
        </Card.Section> */}
      <Card.Section className={classes.footer}>{estatisticas}</Card.Section>

    </Card>
  );
}