import { Paper, Avatar, Button, Card, Group, Text, rem, Image, Center, UnstyledButton } from '@mantine/core';
import { HiOutlinePaperAirplane } from "react-icons/hi";
import { MdDeviceUnknown, MdParagliding, MdZoomOutMap } from "react-icons/md";
import { PiAirplaneInFlightBold, PiAirplaneLandingDuotone, PiAirplaneTakeoffDuotone } from "react-icons/pi";
import { TbDeviceMobileCode, TbScoreboard } from "react-icons/tb";
import { TimeFormated, millisecondsToTime, tsFBToDate } from '~/components/shared/helpers';
import classes from './ItemActivity.module.css';
import { RiMovieLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { FaPlay, FaRegClock } from 'react-icons/fa';
import { Carousel } from '@mantine/carousel';
import { modals } from '@mantine/modals';

export default function ItemtActivity(props: { Tracklog: any }) {
  const prototipes = [
    {
      field: props.Tracklog.takeoff,
      icon: <PiAirplaneTakeoffDuotone />,
      transform: (value: any) => (`${TimeFormated(tsFBToDate(value)!)} h`)
    },
    {
      field: props.Tracklog.landing,
      icon: <PiAirplaneLandingDuotone />,
      transform: (value: any) => (`${TimeFormated(tsFBToDate(value)!)} h`)
    },
    {
      field: props.Tracklog.duration,
      icon: <FaRegClock />,
      transform: (value: any) => (`${millisecondsToTime(value!)}`)
    },
    {
      field: props.Tracklog.maxGain,
      icon: <PiAirplaneInFlightBold />,
      transform: (value: any) => (`${value} m`)
    },
    {
      field: props.Tracklog.competitionClass,
      icon: <HiOutlinePaperAirplane />,
      transform: (value: any) => (`${value}`)
    },
    {
      field: props.Tracklog.gliderType,
      icon: <MdParagliding />,
      transform: (value: any) => (`${value}`)
    },
    {
      field: props.Tracklog.hardwareVersion,
      icon: <MdDeviceUnknown />,
      transform: (value: any) => (`${value}`)
    },
    {
      field: props.Tracklog.loggerManufacturer,
      icon: <TbDeviceMobileCode />,
      transform: (value: any) => (`${value}`)
    },
  ]
  const data = prototipes.map((item, index) => (
    <div key={index}>
      {item.transform(item.field) && (
        <Group gap={0}>
          <Text fz="sm" c="dimmed" fw={500}>
            {item.icon}
          </Text>
          <Text fz="xs" c="dimmed" lh={1} px={10}>
            {item.transform(item.field)}
          </Text>
        </Group>
      )
      }
    </div>
  ));
  const zoomFotos = () => {
    modals.open({
      title: 'Fotos',
      withCloseButton: true,
      children: (
        <Carousel
          loop
          slideGap="xs"
          controlsOffset="xs"
          align="start"
          withIndicators>
          {props.Tracklog.photosURL.map((image: string, index: number) => (
            <Carousel.Slide key={index} >
              <Image src={image} />
            </Carousel.Slide>
          ))}
        </Carousel>
      ),
    });
  }
  return (
    <Card withBorder m={0} p={0} radius={0} className={classes.card}>
      <Group p='xs'>
        <Avatar
          src={props.Tracklog.userData!.photoURL}
          size='sm'
          radius='xl'
        />
        <Text fz="sm" fw={700} inline={true}>
          {props.Tracklog.userData!.nome}
        </Text>
      </Group>
      <Card.Section>
      </Card.Section>
      <Card.Section m={0} p={0} >
        <Image src={props.Tracklog.photoCapaURL} />
      </Card.Section>

      <Card.Section m={0} p={0}   >
        <Text ta='end' fz="xs" c="dimmed">
          {props.Tracklog.place}
        </Text>
        <Paper p='sm'>
          <Text fz="md">
            {props.Tracklog.description}
          </Text>
          <Group gap={0} mt="md">
            {data}
          </Group>
        </Paper>
      </Card.Section>
      {props.Tracklog.photosURL.length > 0 && (
        <Card.Section m={0} px={0}>
          <Group justify='space-between'>
            <Text fz="md" m='xs' fw={700} >
              Fotos
            </Text>
            <UnstyledButton
              onClick={zoomFotos}
              variant="default"
              size="xl"
              aria-label="Ver fotos"
              mr='xs'
            >
              <MdZoomOutMap  size={20}/>
            </UnstyledButton>
          </Group>
          <Carousel
            p={0}
            m={0}
            loop
            slideSize="100"
            height={100}
            slideGap="xs"
            controlsOffset="xs"
            align="start"
            withIndicators>

            {props.Tracklog.photosURL.map((image: string, index: number) => (
              <Carousel.Slide key={index} >
                <Image src={image} />
              </Carousel.Slide>
            ))}
          </Carousel>
        </Card.Section>
      )}


      <Card.Section m={0} p='xs'>
        <Group justify='end'>
          <Button
            radius="md"
            size="md"
            variant="filled"
            component={Link}
            to={`/scene/${props.Tracklog.id}`}
            rightSection={<FaPlay />}
          >
            Ver
          </Button>
        </Group>
      </Card.Section>

    </Card>
  );
}