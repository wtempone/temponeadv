import { Paper, Avatar, Button, Card, Group, Text, rem, Image } from '@mantine/core';
import { HiOutlinePaperAirplane } from "react-icons/hi";
import { MdDeviceUnknown, MdParagliding } from "react-icons/md";
import { PiAirplaneInFlightBold, PiAirplaneLandingDuotone, PiAirplaneTakeoffDuotone } from "react-icons/pi";
import { TbDeviceMobileCode, TbScoreboard } from "react-icons/tb";
import { TimeFormated, tsFBToDate } from '~/components/shared/helpers';
import classes from './ItemActivity.module.css';
import { RiMovieLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

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
      field: props.Tracklog.score,
      icon: <TbScoreboard />,
      transform: (value: any) => (`${value} pts`)
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
        <Group>
          <Text ta="center" fz="lg" fw={500}>
            {item.icon}
          </Text>
          <Text ta="center" fz="sm" c="dimmed" lh={1}>
            {item.transform(item.field)}
          </Text>
        </Group>
      )
      }
    </div>
  ));

  return (
    <Card withBorder padding="0" radius="md" className={classes.card}>
      <Card.Section m={0} p={0}
      >
        <Image src={props.Tracklog.photoURL} alt={props.Tracklog.description} />
      </Card.Section>
      <Avatar
        src={props.Tracklog.userData.photoURL}
        size={80}
        radius={80}
        mx="auto"
        mt={-30}
        className={classes.avatar}
      />
      <Paper p='lg' pt={0}>
        <Text ta="center" fz="lg" fw={500} mt="sm">
          {props.Tracklog.userData.nome}
        </Text>
        <Text ta="center" fz="sm" c="dimmed">
          {props.Tracklog.description}
        </Text>
        <Text ta="center" fz="xs" c="dimmed">
          {props.Tracklog.place}
        </Text>
        <Group mt="md" justify="center">
          {data}
        </Group>
        <Button fullWidth radius="md" mt="xl" size="md" variant="default" component={Link} to={`/scene/${props.Tracklog.id}`}      >
          <RiMovieLine style={{ width: rem(20) }} />
          Ver
        </Button>
      </Paper>
    </Card>
  );
}