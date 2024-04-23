import {
  Button,
  Center,
  Container,
  FileButton,
  LoadingOverlay,
  Modal,
  Paper,
  PaperProps,
  Stack,
  Text,
  rem
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconCloudUpload, IconFile } from '@tabler/icons-react';
import IGCParser, { IGCFile, parse as igcParser, parse } from 'igc-parser';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { LoadingMain } from '~/components/shared/Loading';
import { GetUserData, GliderSettings } from '~/lib/repositories/userDataRepository';
import { AddTrackLog, GetTrackLog, TrackLog } from '~/lib/repositories/userTrackLogRepository';
import NewScene from '../Scene/NewScene';
import Customize from '../../shared/Customize/Customize';
import NewTracklog from './NewTracklog';
import { useUserData } from '~/components/contexts/UserDataContext';

export default function UploadTrackFile(props: PaperProps) {
  const [file, setFile] = useState<File | null>(null);
  const [openedCusomize, { open: openCustomize, close: closeCustomize }] = useDisclosure(false);
  const [openedScene, { open: openNewScene, close: closeNewScene }] = useDisclosure(false);
  const [openedTracklog, { open: openTracklog, close: closeTracklog }] = useDisclosure(false);
  const [flight, setFlight] = useState<IGCFile | null>(null);
  const [definirPadrao, setDefinirPadrao] = useState<boolean>(true);
  const [coresPadrao, setCoresPadrao] = useState<boolean>(true);
  const [gliderSetings, setGliderSetings] = useState<GliderSettings | null>(null);
  const [tracklog, setTracklog] = useState<TrackLog | null>(null);
  const [imagemCapa, setImagemCapa] = useState<Blob | null>(null);
  const [fotos, setFotos] = useState<string[]>([]);

  const [model, setModel] = useState<Blob | null>(null);
  const [datainicio, setDataInicio] = useState<Date | null>(null);
  const navigate = useNavigate();

  function paseFile(file: File): Promise<IGCParser.IGCFile | undefined> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const fileResult = fileReader.result as string;
        try {
          const igcFile = igcParser(fileResult, { lenient: true });
          resolve(igcFile);
        } catch (error) {
          reject(error);
        }

      };
      fileReader.onerror = (error) => {
        reject(error);
      };
      fileReader.readAsText(file, 'UTF-8');
    });
  }

  async function changeFile(file : File |null) {
    setFile(file);
   const icgFile = await paseFile(file!);
   setDataInicio(new Date(icgFile!.fixes[0].timestamp));  
  }
  function modalError(title: string, message: string) {
    modals.open({
      title: title,
      centered: true,
      children: (
        <>
          <Center>
            <Text size="lg">{message}</Text>
          </Center>
          <Button fullWidth onClick={() => modals.closeAll()} mt="md">
            Ok
          </Button>
        </>
      ),
    });
  }

  async function checkValidFile(data: IGCParser.IGCFile): Promise<boolean> {
    if (data.fixes[0].timestamp) {
      const id = data.fixes[0].timestamp.toString();
      const tracklog = await GetTrackLog(id);
      if (tracklog) {
        modalError('Arquivo inválido', 'Arquivo de tracklog já importado');
        return false;
      }
      return true;
    } else {
      modalError('Arquivo inválido', 'Arquivo de tracklog inválido');
      return false;
    }
  }

  const handleSubmit = async () => {
    if (!file) return;
    let dataFligth: IGCParser.IGCFile | undefined;
    try {
      dataFligth = await paseFile(file);
    } catch (error) {
      modalError('Erro ao ler arquivo', 'Erro ao ler o arquivo de tracklog');
      return;
    }

    if (dataFligth) {
      const valid = await checkValidFile(dataFligth);
      if (!valid) {
        return;
      }
    }
    setFlight(dataFligth!)
    openCustomize();
  };

  function publicarTracklog() {
    toggle();
    AddTrackLog(
      tracklog!,
      file!,
      model!,
      definirPadrao,
      imagemCapa!,
      gliderSetings!,
      fotos
    ).then(async () => {
      if (definirPadrao) {
        if (userData) {
          const user = await GetUserData(userData!.id);
          setUserData(user);
        }
      }
      toggle();
      navigate('/activity');
    });

  }

  const handleCustomizeConfirm = async (gliderSetings: GliderSettings, model?: Blob, definirPadrao?: boolean) =>  {
    setGliderSetings(gliderSetings);
    setModel(model!);
    setDefinirPadrao(definirPadrao!);
    closeCustomize();
    openNewScene();
  }

  const handleNewSceneConfirm = () => {
    closeNewScene();
    openTracklog();
  }
  const [visible, { toggle }] = useDisclosure(false);

  const { userData, setUserData } = useUserData();

  const refreshUserData = async () => {
    const user = await GetUserData(userData!.id);
    if (user) {
      setUserData(user);
    }
  }
  
  useEffect(() => {
    if (userData){
      refreshUserData();
    }
  }, []);
  
  return (
    <>
      <LoadingOverlay visible={visible} overlayProps={{ blur: 5 }} loaderProps={{ children: <LoadingMain /> }} />
      <Modal
        fullScreen={true}
        opened={openedCusomize}
        onClose={closeCustomize}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
      >
        <Customize
          gliderSettings={userData!.gliderSettings!}
          close={closeCustomize}
          confirm={handleCustomizeConfirm}
          editPerfil={false}
        />
      </Modal>

      <Modal
        fullScreen={true}
        opened={openedScene}
        onClose={closeNewScene}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
      >
        <NewScene
          gliderSettings={gliderSetings}
          model={model}
          flight={flight}
          setTracklog={setTracklog}
          setImagemCapa={setImagemCapa}
          confirm={handleNewSceneConfirm}
          close={closeNewScene}
        />
      </Modal>
      {tracklog && (
        <Modal
          fullScreen={true}
          opened={openedTracklog}
          onClose={closeTracklog}
          withCloseButton={false}
          closeOnClickOutside={false}
          closeOnEscape={false}
          centered
        >
          <NewTracklog
            Tracklog={tracklog!}
            close={closeTracklog}
            setFotos={setFotos}
            confirm={publicarTracklog}
          />
        </Modal>
      )}


      <Container>
        <Center>
          <Text size="lg" fw={500} pb={30}>
            Faça upload do seu arquivo de tracklog.
          </Text>
        </Center>
        <Stack>
          <Center>
            <IconCloudUpload style={{ width: rem(50), height: rem(50) }} stroke={1.5} />
          </Center>
          <Center>
            <Paper radius="md" p={{ base: 'sm', sm: 'xl' }} withBorder {...props}>
              {!file && (
                <Text ta="center" fz="sm" mt="xs" c="dimmed">
                  Selecione o arquivo para importação. Nós aceitamos apennas arquivos <i>.igc</i> com um tamanho de
                  até 30mb.
                </Text>
              )}
              {file && (
                <Stack>
                  <Center>
                    <IconFile style={{ width: rem(50), height: rem(50) }} stroke={1.5} />
                  </Center>
                  <Center>
                    <Text ta="center" fz="sm" mt="xs" c="dimmed">
                      {file?.name}
                    </Text>
                  </Center>
                  <Center>
                    <Text ta="center" fz="sm" mt="xs" c="dimmed">
                      {`${(file?.size / 1024 ** 2).toFixed(2)} MB`}
                    </Text>
                  </Center>
                  <Center>
                    <Text ta="center" fz="sm" mt="xs" c="dimmed">
                      {file?.type}
                    </Text>
                  </Center>
                </Stack>
              )}
            </Paper>
          </Center>
          <Center>
            <FileButton onChange={changeFile} accept='*/*'>
              {(props) => (
                <Button variant='default' size="md" radius="xl" mt="xs" {...props}>
                  Selecionar arquivo
                </Button>
              )}
            </FileButton>
          </Center>
          <Center>
            <Text size="sm" c="dimmed"> {datainicio?.toString()} </Text>
          </Center>
        </Stack>
        <Center mt="xl">
          <Button size="md" radius="xl" mt="xs" disabled={!file} onClick={handleSubmit}>
            Avançar
          </Button>
        </Center>
      </Container>
    </>
  );
}
