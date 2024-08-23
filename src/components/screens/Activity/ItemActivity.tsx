import { Paper, Avatar, Button, Card, Group, Text, rem, Image, Center, UnstyledButton } from '@mantine/core';
import { HiOutlinePaperAirplane } from "react-icons/hi";
import { MdDeviceUnknown, MdParagliding, MdZoomOutMap } from "react-icons/md";
import { PiAirplaneInFlightBold, PiAirplaneLandingDuotone, PiAirplaneTakeoffDuotone } from "react-icons/pi";
import { TbDeviceMobileCode, TbScoreboard } from "react-icons/tb";
import { TimeFormated, millisecondsToTime, tsFBToDate } from '~/components/shared/helpers';
import classes from './ItemActivity.module.css';
import { RiMovieLine, RiPinDistanceFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { FaPlay, FaRegClock, FaRegPaperPlane } from 'react-icons/fa';
import { Carousel } from '@mantine/carousel';
import { modals } from '@mantine/modals';
import { IoCloudDownloadOutline, IoTrashOutline } from 'react-icons/io5';
import { useUserData } from '~/components/contexts/UserDataContext';
import { GiPathDistance } from 'react-icons/gi';
import { DeleteTracklog, TrackLog } from '~/lib/repositories/userTrackLogRepository';
import ModalPhotos from '~/components/shared/modals/modalPhotos';

export default function ItemtActivity(props: { Tracklog: TrackLog, parentRefresh: any }) {
  const { userData } = useUserData();

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
      transform: (value: any) => (`${value.toLocaleString('pt-br')} m`)
    }, ,
    {
      field: props.Tracklog.distance,
      icon: < RiPinDistanceFill />,
      transform: (value: any) => (`${value.toLocaleString('pt-br')} m`)
    }, ,
    {
      field: props.Tracklog.accumulatedDistance,
      icon: <GiPathDistance />,
      transform: (value: any) => (`${value.toLocaleString('pt-br')} m`)
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
      {item!.transform(item!.field) && (
        <Group gap={0}>
          <Text fz="sm" c="dimmed" fw={500}>
            {item!.icon}
          </Text>
          <Text fz="xs" c="dimmed" lh={1} px={10}>
            {item!.transform(item!.field)}
          </Text>
        </Group>
      )
      }
    </div>
  ));
  const confirmDeleteTracklog = (id: string) => {
    modals.open({
      centered: true,
      children: (
        <>
          <Center>
            <Text >Deseja excluir o voo e seus arquivos?</Text>
          </Center>
          <Center>
            <Group justify="space-between">
              <Button onClick={() => modals.closeAll()} mt="md">
                Cancelar
              </Button>
              <Button onClick={
                async () => {
                  await deleteTracklog(id);
                  modals.closeAll()
                }
              } mt="md">
                Confirmar
              </Button>
            </Group>
          </Center>
        </>
      ),
    });
  }

  const deleteTracklog = async (id: string) => {
    await DeleteTracklog(id);
    props.parentRefresh();
  }

  return (
    <Card withBorder m={0} p={0} radius={0} className={classes.card}>
      {props.Tracklog.userData && (
        <Group p='xs' justify='space-between'>
          <Group>
            <Avatar
              src={props.Tracklog.userData!.photoURL}
              size='sm'
              radius='xl'
            />
            <Text fz="sm" fw={700} inline={true}>
              {props.Tracklog.userData!.nome}
            </Text>
          </Group>
          <UnstyledButton
            component={Link}
            to={`/userActivity/${props.Tracklog.userData!.id}`}
            aria-label="Ver perfil"
            ml='xs'>
            <FaRegPaperPlane />
          </UnstyledButton>
        </Group>
      )}

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
      {props.Tracklog.photosURL && props.Tracklog.photosURL.length > 0 && (
        <Card.Section m={0} px={0}>
          <ModalPhotos Tracklog={props.Tracklog} />
        </Card.Section>
      )}


      <Card.Section m={0} p='xs'>
        <Group justify='end'>
          {userData && props.Tracklog.userId == userData.id && (
            <Button
              radius="md"
              size="md"
              variant="danger"
              rightSection={<IoTrashOutline />}
              onClick={() => confirmDeleteTracklog(props.Tracklog.id)}
            >
              Excluir
            </Button>
          )}
          {userData && props.Tracklog.userId == userData.id && (
            <Button
              radius="md"
              size="md"
              variant="limk"

              rightSection={<IoCloudDownloadOutline />}
            >
              Download IGC
            </Button>
          )}


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