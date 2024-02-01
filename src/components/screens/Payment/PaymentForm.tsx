import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

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
  Avatar,
  Center,
  RingProgress,
  PasswordInput,
} from '@mantine/core';
import InputMask from 'react-input-mask';
import { useEffect, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { useUserData } from '~/components/contexts/UserDataContext';
import { UserData, DefineUserData, GetUserData } from '~/lib/repositories/userDataRepository';
import { useFunctions, useStorage } from '~/lib/firebase';
import { httpsCallable } from 'firebase/functions';

export default function PaymentForm(props: PaperProps) {

  interface FormData {
    id: string;
    nome: string;
    cpf: string;
    photoURL: string | null;
    password: string
  }
  const { state } = useAuthState();
  const { userData, setUserData } = useUserData();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false)
  const [progressUpload, setProgressUpload] = useState(0)

  const functions = useFunctions();

  const form = useForm<FormData>({
    initialValues: {
      id: '',
      nome: '',
      cpf: '',
      photoURL: null,
      password: ''
    },

    validate: {
      nome: (val) => (val.length <= 6 ? 'Nome deve ter pelo menos 6 caracteres' : null),
      password: (val) => (val.length <= 6 ? 'Nome deve ter pelo menos 6 caracteres' : null),
    },
  });

  useEffect(() => {
    if (isUploading) return
    if (userData === undefined) {
      if (state.state === 'SIGNED_IN') {
        form.setFieldValue('id', state.currentUser.uid!)
        form.setFieldValue('nome', state.currentUser.displayName! || '')
        form.setFieldValue('photoURL', state.currentUser.photoURL || '')
      }
    } else {
      form.setFieldValue('id', userData.id);
      form.setFieldValue('nome', userData.nome);
      form.setFieldValue('cpf', userData.cpf);
      form.setFieldValue('photoURL', userData.photoURL);
    }
  }, [userData]);

  const [opened, { open, close }] = useDisclosure(false);

  const chama = () => {
    handleSubmit();
  }
  const handleSubmit = async () => {
    
    const pixPayment = httpsCallable(functions, "pixPayment");
    pixPayment(
      { 
        user: "03405480612", 
        password: "1978wil8"
     }).then((resp)=>{
      console.log(resp.data);
     }).catch((err: Error)=>{
      notifications.show({
        color: 'red',
        title: 'Erro na validação do usuário',
        message: `Ocorreu um erro na validação do usuário (${err.message})`,
      });
     })
  }

  const updateFirestore = async (user: FormData) => {

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
            Infrome seus dados para sincronização
          </Text>
          <form onSubmit={form.onSubmit((user) => {

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
                <Text fw={500} size="sm" lh={1} mr={3} >
                  {form.values.nome}
                </Text>
              </Center>
              <Grid columns={6}>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Input.Wrapper id='cpf' label="CPF" required>
                    {/* 
                      // @ts-ignore */}
                    <Input component={InputMask}
                      id='cpf'
                      required
                      mask="999.999.999-99"
                      placeholder="000.000.000-00"
                      value={form.values.cpf}
                      onChange={(event: { currentTarget: { value: string; }; }) => form.setFieldValue('cpf', event.currentTarget.value)}
                      error={form.errors.cpf && 'CPF inválido'}
                      radius="md" />
                  </Input.Wrapper>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <PasswordInput
                    required
                    label="Senha"
                    placeholder="Sua Senha"
                    value={form.values.password}
                    onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                    error={form.errors.password && 'A senha deve ter no mínimo 6 caracteres'}
                    radius="md"
                  />
                </Grid.Col>

              </Grid>

              <Anchor size='sm' onClick={open}>* Visualisar termo de responsabilidade</Anchor>
            </Stack>

            <Group justify="space-between" mt="xl">
              <Button onClick={chama} radius="xl">
                Enviar
              </Button>
            </Group>
          </form>
        </Paper>
      </Container >
    </>
  );
}