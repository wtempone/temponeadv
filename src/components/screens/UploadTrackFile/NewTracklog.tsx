import { ActionIcon, Avatar, Badge, Button, Card, Center, Container, FileButton, Group, Image, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { FaRegClock } from 'react-icons/fa';
import { HiOutlinePaperAirplane } from "react-icons/hi";
import { MdDeviceUnknown, MdOutlineDeleteForever, MdParagliding } from "react-icons/md";
import { PiAirplaneInFlightBold, PiAirplaneLandingDuotone, PiAirplaneTakeoffDuotone } from "react-icons/pi";
import { TbDeviceMobileCode } from "react-icons/tb";
import { TimeFormated, millisecondsToTime } from '~/components/shared/helpers';
import { TrackLog } from '~/lib/repositories/userTrackLogRepository';
import ModalNewFotoAdvanceCropper from '../../shared/Cropper/ModalNewFotoAdvanceCropper';
import classes from './NewTracklog.module.css';
import { RiDeleteBinLine } from "react-icons/ri";

export default function NewTracklog(props: { Tracklog: TrackLog, close: () => void, setFotos: React.Dispatch<React.SetStateAction<string[]>>, confirm: () => void }) {
  const prototipes = [
    {
      field: props.Tracklog.takeoff,
      icon: <PiAirplaneTakeoffDuotone />,
      transform: (value: any) => (`${TimeFormated(value!)} h`)
    },
    {
      field: props.Tracklog.landing,
      icon: <PiAirplaneLandingDuotone />,
      transform: (value: any) => (`${TimeFormated(value!)} h`)
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

  const selectNewFoto = (file: File | null) => {
    if (file) {
      modals.open({
        modalId: 'modal-crop',
        fullScreen: true,
        title: 'Adicionar foto',
        children: (
          <ModalNewFotoAdvanceCropper image={file} onClose={closeModalCrop} onConfirm={confirmModalCrop} />
        ),
      });
    }
  }
  const [galeria, setGaleria] = useState<string[]>([]);

  const removeFoto = (index: number) => {
    setGaleria(galeria.filter((item, i) => i !== index));
    props.setFotos(galeria.filter((item, i) => i !== index));
  }
  const confirmModalCrop = (fotoCropped: any) => {
    setGaleria([...galeria, fotoCropped]);
    props.setFotos([...galeria, fotoCropped]);
    closeModalCrop();
  }

  const closeModalCrop = () => {
    modals.close('modal-crop')
  }

  const confirm = () => {
    props.confirm();
  }
  return (
    <Container>

      <Card padding="0" radius={0} className={classes.card}>
        <Group p='xs'>
          <Avatar
            src={props.Tracklog.userData!.photoURL}
            size='sm'
            radius='xl'
          />
          <Text fz="sm" fw={500} inline={true}>
            {props.Tracklog.userData!.nome}
          </Text>
        </Group>
        <Card.Section>
        </Card.Section>
        <Card.Section m={0} p={0}
        >
          <Image src={props.Tracklog.photoCapaURL} />
        </Card.Section>

        <Card.Section m={0} p={0}
        >
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
            <Center>
              <FileButton onChange={selectNewFoto} accept='image/*' disabled={galeria.length > 8}>
                {(props) => (
                  <Button size="md" radius="xl" mt="xs" {...props}>
                    Adicionar foto
                  </Button>
                )}
              </FileButton>
            </Center>
            {galeria.length > 0 && (
              <Stack mt='md'>
                <Text fw={500}>
                  Fotos
                </Text>
                <SimpleGrid cols={3} spacing={1} verticalSpacing={1}>
                  {galeria.length > 0 && (galeria.map((item, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <Image src={item} />
                      <Badge size="md" circle
                        radius="xl"
                        variant='filled'
                        style={{ position: 'absolute', top: 5, left: 5 }}>
                        {index + 1}
                      </Badge>
                      <ActionIcon
                        style={{ position: 'absolute', top: 5, right: 5 }}
                        size="md"
                        variant='default'
                        radius="xl"
                        aria-label="Remover Foto"
                        onClick={() => removeFoto(index)}>
                        <RiDeleteBinLine />
                      </ActionIcon>
                    </div>
                  )))}
                </SimpleGrid>
              </Stack>
            )}

          </Paper>

        </Card.Section>

        <Card.Section className={classes.end_publish} m={0} p={0}>
          <Center >
            <Button size="md" radius="xl" m='sm' onClick={props.close} variant="default">Voltar</Button>
            <Button size="md" radius="xl" m='sm' onClick={confirm}>Publicar</Button>
          </Center>
        </Card.Section>
      </Card>
    </Container >
  );
}