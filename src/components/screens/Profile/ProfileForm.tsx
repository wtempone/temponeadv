import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Timestamp } from "firebase/firestore";

import {
  TextInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Checkbox,
  Anchor,
  Stack,
  Container,
  Grid,
  Input,
  Select,
  Modal,
  FileButton,
  Avatar,
  Center,
  RingProgress,
} from '@mantine/core';
import InputMask from 'react-input-mask';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthState } from '~/components/contexts/UserContext';
import { useUserData } from '~/components/contexts/UserDataContext';
import { UserData, DefineUserData, GetUserData } from '~/lib/repositories/userDataRepository';
import { modals } from '@mantine/modals';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useStorage } from '~/lib/firebase';

export default function ProfileForm(props: PaperProps) {

  interface FormData {
    id: string;
    nome: string;
    email: string;
    // termoResponsabilidade: boolean;
    photoURL: string | null;
  }
  const { state } = useAuthState();
  const { userData, setUserData } = useUserData();
  const [file, setFile] = useState<File | null>(null);
  const [loadForm, setLoadForm] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [progressUpload, setProgressUpload] = useState(0)
  const storage = useStorage();

  const form = useForm<FormData>({
    initialValues: {
      id:'',
      nome: '',
      email: '',
      // termoResponsabilidade: false,
      photoURL: null
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      nome: (val) => (val.length <= 6 ? 'Nome deve ter pelo menos 6 caracteres' : null),
    },
  });


  useEffect(() => {
    if (isUploading) return
    if (loadForm) {
      setFields();
      setLoadForm(false)
    }

    if (file) {
      setFile(file)
      form.setFieldValue('photoURL', URL.createObjectURL(file))
    }


  }, [form.getInputProps('cep').value, file, userData, isUploading, progressUpload]);

  const setFields = () => {
    if (userData === undefined) {
      if (state.state === 'SIGNED_IN') {
        form.setFieldValue('id', state.currentUser.uid!)
        form.setFieldValue('nome', state.currentUser.displayName! || '')
        form.setFieldValue('email', state.currentUser.email! || '')
        form.setFieldValue('photoURL', state.currentUser.photoURL || '')
      }
    } else {
      form.setFieldValue('id', userData.id);
      form.setFieldValue('nome', userData.nome);
      form.setFieldValue('tipoSanguineo', userData.tipoSanguineo);
      // form.setFieldValue('termoResponsabilidade', userData.termoResponsabilidade);
      form.setFieldValue('photoURL', userData.photoURL);
    }

  }
  const [opened, { open, close }] = useDisclosure(false);

  const handleSubmit = async (user: FormData) => {

    if (!file) {
      updateFirestore(user);
      open()
    }
    else {
      open()
      const fileName = user.id;
      const storageRef = ref(storage, `user_images/${fileName}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          setIsUploading(true)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100

          setProgressUpload(progress)

          switch (snapshot.state) {
            case 'paused':
              break
            case 'running':
              break
          }
        },
        (error) => {
          notifications.show({
            color: 'red',
            title: 'Erro no upload',
            message: 'Não foi possível fazer o upload do arquivo' + error.message,
          });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            user.photoURL = url;
            setFile(null);
            updateFirestore(user).then(() => {
              setIsUploading(false)
            });
          })
        },
      )
    }
  }

  const updateFirestore = async (user: FormData) => {
    const data: UserData = user as UserData;
    return DefineUserData(data.id, data).then(() => {
      return GetUserData(data.id).then((updated) => {
        setUserData(updated as UserData)
      })
      open();
    })
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        centered>
        <Stack>
          {isUploading && (
            <>
              <Center>
                <Text size="sm">
                  Salvando imagem 
                </Text>
              </Center>
              <Center>
                <RingProgress
                  sections={[{ value: progressUpload, color: 'blue' }]}
                  label={
                    <Text c="blue" fw={700} ta="center" size="xl">
                      {Math.round(progressUpload)} %
                    </Text>
                  }
                />
              </Center>
            </>
          )}
          {(!file && !isUploading) && (
            <>
              <Center>
                <Text size="sm">
                  Seu cadastro foi atualizado com sucesso!
                </Text>
              </Center>
              <Center>
                <Button onClick={() => {
                  close()
                }} size="lg"
                radius="lg"
                >
                  Ok
                </Button>
              </Center>
            </>
          )}
        </Stack>
      </Modal>
      <Container>
        <Paper radius="md" p={{ base: "sm", sm: "xl" }} withBorder {...props}>
          <Text size="lg" fw={500} pb={30}>
            Complete seu cadastro
          </Text>
          <form onSubmit={form.onSubmit((user) => {
            handleSubmit(user as FormData);
          })}>
            <Stack>
              <Center>
                <Avatar
                  variant="filled"
                  radius={100}
                  size={100}
                  src={form.values.photoURL} />
              </Center>
              <Center>
                <FileButton
                  onChange={setFile}
                  accept="image/png,image/jpeg">
                  {(props) =>
                    <Button {...props}>Trocar imagem</Button>}
                </FileButton>
              </Center>
              <Grid columns={6}>
                <Grid.Col span={{ base: 6, sm: 3 }} >
                  <TextInput
                    required
                    label="Nome"
                    placeholder="Nome"
                    value={form.values.nome}
                    onChange={(event) => form.setFieldValue('nome', event.currentTarget.value)}
                    error={form.errors.nome && 'Nome inválido'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  <TextInput
                    required
                    label="Email"
                    placeholder="piloto@avlva-app.dev"
                    value={form.values.email}
                    onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                    error={form.errors.email && 'E-mail inválido'}
                    radius="md"
                  />
                </Grid.Col>

              </Grid>
              {/* <Checkbox
                label="Eu aceito os Termo de Responsabilidade"
                checked={form.values.termoResponsabilidade}
                onChange={(event) => form.setFieldValue('termoResponsabilidade', event.currentTarget.checked)}
              />
              <Anchor size='sm' onClick={open}>* Visualisar termo de responsabilidade</Anchor> */}
            </Stack>

            <Group justify="space-between" mt="xl">
              <Button type="submit" radius="xl">
                Enviar
              </Button>
            </Group>
          </form>
        </Paper>
      </Container >
    </>
  );
}