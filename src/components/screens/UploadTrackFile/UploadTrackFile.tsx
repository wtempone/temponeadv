import {
  Button,
  Center,
  Container,
  FileButton,
  Loader,
  Modal,
  Paper,
  PaperProps,
  Stack,
  Text,
  Title,
  rem
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconCloudUpload, IconFile } from '@tabler/icons-react';
import { parse as igcParser } from 'igc-parser';
import { Solution, solver as igcSolver, scoringRules } from 'igc-xc-score';
import { useEffect, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { useUserData } from '~/components/contexts/UserDataContext';
import { useStorage } from '~/lib/firebase';
import { AddTrackLog, GetTrackLog } from '~/lib/repositories/userTrackLogRepository';
import Customize from '../Scene/Customize/Customize';
export default function UploadTrackFile(props: PaperProps) {
  const { state } = useAuthState();
  const { userData, setUserData } = useUserData();
  const [file, setFile] = useState<File | null>(null);
  const [loadForm, setLoadForm] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [progressUpload, setProgressUpload] = useState(0);
  const storage = useStorage();

  const form = useForm();

  useEffect(() => {
    if (isUploading) return;
    if (loadForm) {
      setLoadForm(false);
    }
    if (file) {
      setFile(file);
    }
  }, [file, isUploading, progressUpload]);

  const [opened, { open, close }] = useDisclosure(false);

  function paseFile(file: File): Promise<Solution | undefined> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const fileResult = fileReader.result as string;
        const igcFile = igcParser(fileResult, { lenient: true });
        const score = igcSolver(igcFile, scoringRules['FAI']).next().value;
        resolve(score);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
      fileReader.readAsText(file, 'UTF-8');
    });
  }

  async function checkValidFile(data: Solution): Promise<boolean> {
    if (data.opt.flight.fixes[0].timestamp) {
      const id = data.opt.flight.fixes[0].timestamp.toString();
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
      const valid = await checkValidFile(dataFligth);
      if (!valid) {
        return;
      }
    }
    open();
    // setFile(null);
    // setIsUploading(true);
    // updateFirestore(userData?.id!, dataFligth!).then(() => {
    //   setIsUploading(false);
    // });
  };
  const updateFirestore = async (userId: string, dataFligth: Solution) => {
    return AddTrackLog(userId, dataFligth).then(() => {
      open();
    });
  };

  return (
    <>
      <Modal
        fullScreen={true}
        opened={opened}
        onClose={close}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        centered
      >
        <Customize/>
      </Modal>
      <Container>
        <Center>
          <Text size="lg" fw={500} pb={30}>
            Faça upload do seu arquivo de tracklog.
          </Text>
        </Center>
        <form
          onSubmit={form.onSubmit((user) => {
            handleSubmit();
          })}
        >
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
              <FileButton onChange={setFile} accept='igc/igc'>
                {(props) => (
                  <Button variant='default' size="md" radius="xl" mt="xs" {...props}>
                    Selecionar arquivo
                  </Button>
                )}
              </FileButton>
            </Center>
          </Stack>
          <Center mt="xl">
            <Button  size="md" radius="xl" mt="xs" disabled={!file} type="submit">
              Avançar
            </Button>
          </Center>
        </form>
      </Container>
    </>
  );
}
