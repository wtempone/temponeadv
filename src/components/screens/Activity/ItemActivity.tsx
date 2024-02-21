import { ActionIcon, Avatar, Box, Card, Center, Grid, Group, Stack, Text, UnstyledButton, rem } from '@mantine/core';
import { MdParagliding } from "react-icons/md";
import { RiMovieLine } from 'react-icons/ri';
import { TimeFormated, millisecondsToTime, tsFBToDate } from '~/components/shared/helpers';
import classes from './ItemActivity.module.css';
import { IconAt, IconPhoneCall } from '@tabler/icons-react';
import { GiPathDistance } from "react-icons/gi";
import { PiAirplaneTakeoffDuotone } from "react-icons/pi";
import { PiAirplaneLandingDuotone } from "react-icons/pi";
import { TbScoreboard } from "react-icons/tb";
import { PiAirplaneInFlightBold } from "react-icons/pi";
import { HiOutlinePaperAirplane } from "react-icons/hi";
import { MdDeviceUnknown } from "react-icons/md";
import { TbDeviceMobileCode } from "react-icons/tb";
import { GiDuration } from "react-icons/gi";
import { Link } from 'react-router-dom';

export default function ItemtActivity(props: { Tracklog: any }) {
  const prototipes = [
    {
      field: props.Tracklog.takeoff,
      icon: <PiAirplaneTakeoffDuotone size="1rem" className={classes.icon} />,
      transform: (value: any) => (`${TimeFormated(tsFBToDate(value)!)} h`)
    },
    {
      field: props.Tracklog.landing,
      icon: <PiAirplaneLandingDuotone size="1rem" className={classes.icon} />,
      transform: (value: any) => (`${TimeFormated(tsFBToDate(value)!)} h`)
    },
    {
      field: props.Tracklog.score,
      icon: <TbScoreboard size="1rem" className={classes.icon} />,
      transform: (value: any) => (`${value} pts`)
    },
    {
      field: props.Tracklog.maxGain,
      icon: <PiAirplaneInFlightBold size="1rem" className={classes.icon} />,
      transform: (value: any) => (`${value} m`)
    },
    {
      field: props.Tracklog.competitionClass,
      icon: <HiOutlinePaperAirplane size="1rem" className={classes.icon} />,
      transform: (value: any) => (`${value}`)
    },
    {
      field: props.Tracklog.gliderType,
      icon: <MdParagliding size="1rem" className={classes.icon} />,
      transform: (value: any) => (`${value}`)
    },
    {
      field: props.Tracklog.hardwareVersion,
      icon: <MdDeviceUnknown size="1rem" className={classes.icon} />,
      transform: (value: any) => (`${value}`)
    },
    {
      field: props.Tracklog.loggerManufacturer,
      icon: <TbDeviceMobileCode size="1rem" className={classes.icon} />,
      transform: (value: any) => (`${value}`)
    },
  ]
  const data = prototipes.map((item, index) => (
    <div key={index}>
      {item.transform(item.field) && (
        <Grid.Col p={0} m={2}>
          <Group wrap="nowrap" gap={5} m={0} className={classes.item_stat}>
            {item.icon}
            <Text fz={10} >
              {item.transform(item.field)}
            </Text>
          </Group>
        </Grid.Col>
      )
      }
    </div>
  ));

  return (
    <Card withBorder shadow="sm" radius="md" mb='md'>
      <Group wrap="nowrap">
        <Avatar
          src={props.Tracklog.userData.photoURL}
          size={52}
          style={{ borderRadius: '50%'}}
          top='0'
          radius="md"
        />
        <div>
          <Stack gap={0}>
            <Text fz="md" fw={500} className={classes.name}>
              {props.Tracklog.userData.nome}
            </Text>
            <Group justify='flex-start' wrap='nowrap'>
              <Text fz="sm" fw={500}>
                <GiDuration size="0.8rem" />
                {` ${millisecondsToTime(props.Tracklog.duration)}`}
              </Text>
              <Text fz="sm" fw={500}>
                <GiPathDistance size="0.8rem" />
                {` ${props.Tracklog.distance} km`}
              </Text>
            </Group>
          </Stack>

          <Grid className={classes.main_grid}>
            {data}
          </Grid>
        </div>
        <UnstyledButton
          variant="default"
          size="lg"
          aria-label="Abrir cena do dia"
          component={Link}
          to={`/scene/${props.Tracklog.id}`}
          >
          <RiMovieLine style={{ width: rem(20) }} />
        </UnstyledButton>
      </Group>
    </Card>
  );
}