import {
  Button,
  Center,
  Container,
  FileButton,
  Modal,
  Paper,
  PaperProps,
  Stack,
  Text,
  rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconCloudUpload, IconFile } from '@tabler/icons-react';
import IGCParser, { IGCFile, parse as igcParser } from 'igc-parser';
import { useState } from 'react';
import { GliderSettings } from '~/lib/repositories/userDataRepository';
import { GetTrackLog } from '~/lib/repositories/userTrackLogRepository';
import Customize from '../Scene/Customize/Customize';
import NewScene from '../Scene/NewScene';
import { DateInput, DateTimePicker } from '@mantine/dates';

export default function UploadTrackFile(props: PaperProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loadForm, setLoadForm] = useState(true);
  const [openedCusomize, { open: openCustomize, close: closeCustomize }] = useDisclosure(false);
  const [openedScene, { open: openNewScene, close: closeNewScene }] = useDisclosure(false);

  const [flight, setFlight] = useState<IGCFile | null>(null);
  const [definirPadrao, setDefinirPadrao] = useState<boolean>(true);
  const [coresPadrao, setCoresPadrao] = useState<boolean>(true);
  const [gliderSetings, setGliderSetings] = useState<GliderSettings | null>(null);
  const [model, setModel] = useState<Blob | null>(null);
  const [datainicio, setDataInicio] = useState<Date | null>(null);
  function paseFile(file: File): Promise<IGCParser.IGCFile | undefined> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const fileResult = fileReader.result as string;
        const igcFile = igcParser(fileResult, { lenient: true });
        // const score = igcSolver(igcFile, scoringRules['FAI']).next().value;
        resolve(igcFile);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
      fileReader.readAsText(file, 'UTF-8');
    });
  }

  async function checkValidFile(data: IGCParser.IGCFile): Promise<boolean> {
    if (data.fixes[0].timestamp) {
      const id = data.fixes[0].timestamp.toString();
      const tracklog = await GetTrackLog(id);
      if (tracklog) {
        modals.open({
          title: 'Arquivo inválido',
          centered: true,
          children: (
            <>
              <Center>
                <Text size="lg">Arquivo de tracklog já importado</Text>
              </Center>
              <Button fullWidth onClick={() => modals.closeAll()} mt="md">
                Ok
              </Button>
            </>
          ),
        });

        return false;
      }
      return true;
    } else {
      modals.open({
        title: 'Arquivo inválido',
        centered: true,
        children: (
          <>
            <Center>
              <Text>Arquivo de tracklog inválido</Text>
            </Center>
            <Button fullWidth onClick={() => modals.closeAll()} mt="md">
              Ok
            </Button>
          </>
        ),
      });
      return false;
    }
  }
  const handleSubmit = async () => {
    if (!file) return;
    const dataFligth = await paseFile(file);

    if (dataFligth) {
      
      if (datainicio) {
        const data = new Date(dataFligth.fixes[0].timestamp);
        const resultArray: number[] = [];
        let incio = datainicio.getTime();
        const primeiraData = dataFligth.fixes[0].timestamp;
        const fixes = dataFligth.fixes.map((fix) => ( { ...fix, timestamp: incio + (fix.timestamp - primeiraData) }));
        dataFligth.fixes = fixes;
      }


      const valid = await checkValidFile(dataFligth);
      if (!valid) {
        return;
      }
    }
    setFlight(dataFligth!)
    openCustomize();
  };

  const handleCustomizeConfirm = () => {
    closeCustomize();
    openNewScene();
  }
  return (
    <>
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
          setGliderSetings={setGliderSetings}
          setModel={setModel}
          setDefinirPadrao={setDefinirPadrao}
          definirPadrao={definirPadrao}
          coresPadrao={coresPadrao}
          setCoresPadrao={setCoresPadrao}
          close={closeCustomize}
          confirm={handleCustomizeConfirm}
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
          usarPadrao={coresPadrao}
          definirPadrao={definirPadrao}
        />
      </Modal>
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
            <FileButton onChange={setFile} accept='*/*'>
              {(props) => (
                <Button variant='default' size="md" radius="xl" mt="xs" {...props}>
                  Selecionar arquivo
                </Button>
              )}
            </FileButton>
          </Center>
          <Center>
            <DateTimePicker 
              value={datainicio}
              onChange={setDataInicio}
              label="Data de início"
              placeholder="Selecione a data de início"
            />
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
