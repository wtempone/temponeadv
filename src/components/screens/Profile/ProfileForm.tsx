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
    cpf: string;
    rg: string;
    dataNascimento: Date | null;
    idade: number;
    estadoCivil: string;
    nacionalidade: string;
    sexo: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    telefoneResidencial: string;
    celular: string;
    telefoneEmergencia: string;
    email: string;
    tipoSanguineo: string;
    modalidade: string;
    inicioEsporte: Date | null;
    nivel: string;
    escola: string;
    instrutor: string;
    termoResponsabilidade: boolean;
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
      cpf: '',
      rg: '',
      dataNascimento: null,
      idade: 0,
      estadoCivil: '',
      nacionalidade: '',
      sexo: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      telefoneResidencial: '',
      celular: '',
      telefoneEmergencia: '',
      email: '',
      tipoSanguineo: '',
      modalidade: '',
      inicioEsporte: null,
      nivel: '',
      escola: '',
      instrutor: '',
      termoResponsabilidade: false,
      photoURL: null
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      nome: (val) => (val.length <= 6 ? 'Nome deve ter pelo menos 6 caracteres' : null),
    },
  });

  const setEndereco = (data: any) => {
    if (data) {
      form.setFieldValue('logradouro', data.logradouro)
      form.setFieldValue('complemento', data.complemento)
      form.setFieldValue('bairro', data.bairro)
      form.setFieldValue('cidade', data.localidade)
      form.setFieldValue('uf', data.uf)
    } else {
      form.setFieldValue('logradouro', '')
      form.setFieldValue('complemento', '')
      form.setFieldValue('bairro', '')
      form.setFieldValue('cidade', '')
      form.setFieldValue('uf', '')
    }
  }

  const buscarEnderecoPorCep = async (cep: number) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      const data = response.data;
      if (data.erro) {
        notifications.show({
          color: 'red',
          title: 'Erro ao buscar endereço',
          message: 'Não foi possível obter informações do CEP! ',
        });
        setEndereco(null)
      } else {
        setEndereco(data)
      }
    } catch (error) {
      notifications.show({
        color: 'red',
        title: 'Erro ao buscar endereço',
        message: 'Não foi possível obter informações do CEP! ',
      });
    }
  };

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

    const cepArr: Array<number> = form.getInputProps('cep').value.match(/\d+/g)
    if (cepArr) {
      const cep = cepArr.join('')
      if (cep.length === 8) {
        buscarEnderecoPorCep(+cep);
      }
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
      form.setFieldValue('cpf', userData.cpf);
      form.setFieldValue('rg', userData.rg);
      form.setFieldValue('dataNascimento', dayjs(((userData.dataNascimento as Object) as Timestamp).toDate()).toDate());
      form.setFieldValue('idade', userData.idade);
      form.setFieldValue('estadoCivil', userData.estadoCivil);
      form.setFieldValue('nacionalidade', userData.nacionalidade);
      form.setFieldValue('sexo', userData.sexo);
      form.setFieldValue('cep', userData.cep);
      form.setFieldValue('logradouro', userData.logradouro);
      form.setFieldValue('numero', userData.numero);
      form.setFieldValue('complemento', userData.complemento);
      form.setFieldValue('bairro', userData.bairro);
      form.setFieldValue('cidade', userData.cidade);
      form.setFieldValue('uf', userData.uf);
      form.setFieldValue('telefoneResidencial', userData.telefoneResidencial);
      form.setFieldValue('celular', userData.celular);
      form.setFieldValue('telefoneEmergencia', userData.telefoneEmergencia);
      form.setFieldValue('email', userData.email);
      form.setFieldValue('tipoSanguineo', userData.tipoSanguineo);
      form.setFieldValue('modalidade', userData.modalidade);
      form.setFieldValue('inicioEsporte', dayjs(((userData.inicioEsporte as Object) as Timestamp).toDate()).toDate());
      form.setFieldValue('nivel', userData.nivel);
      form.setFieldValue('escola', userData.escola);
      form.setFieldValue('instrutor', userData.instrutor);
      form.setFieldValue('termoResponsabilidade', userData.termoResponsabilidade);
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
      const name = user.id;
      const storageRef = ref(storage, `user_images/${name}`)
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
                    placeholder="hello@mantine.dev"
                    value={form.values.email}
                    onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                    error={form.errors.email && 'E-mail inválido'}
                    radius="md"
                  />
                </Grid.Col>
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
                  <Input.Wrapper id='rg' label="RG" required>
                    {/* 
                      // @ts-ignore */}                    
                    <Input component={InputMask}
                      id='rg'
                      required
                      mask="aa 99.999.999"
                      placeholder="AA 00.000.000"
                      value={form.values.rg}
                      onChange={(event: { currentTarget: { value: string; }; }) => form.setFieldValue('rg', event.currentTarget.value)}
                      error={form.errors.rg && 'RG inválido'}
                      radius="md" />
                  </Input.Wrapper>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <DateInput component={InputMask}
                    id='dataNascimento'
                    required
                    label="Data de Nascimento"
                    maxDate={dayjs(new Date()).toDate()}
                    placeholder="DD/MM/YYYY"
                    valueFormat="DD/MM/YYYY"
                    value={form.values.dataNascimento}
                    onChange={(event) => form.setFieldValue('dataNascimento', dayjs(event).toDate())}
                    error={form.errors.dataNascimento && 'Data inválida'}
                    radius="md" />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 1 }}>
                  <Select
                    required
                    label="Estado Civil"
                    data={['Solteiro', 'Casado', 'Separado', 'Divorciado', 'Viúvo']}
                    value={form.values.estadoCivil}
                    onChange={(event) => form.setFieldValue('estadoCivil', event!.toString())}
                    error={form.errors.estadoCivil && 'Estado Civil inválido'}
                    defaultValue={'Solteiro'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 1 }}>
                  <Select
                    label="Sexo"
                    required
                    data={['Masculino', 'Feminino', 'Outro']}
                    value={form.values.sexo}
                    onChange={(event) => form.setFieldValue('sexo', event!.toString())}
                    error={form.errors.sexo && 'Sexo  inválido'}
                    defaultValue={'Masculino'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 4 }} >
                  <TextInput
                    required
                    label="Nacionalidade"
                    placeholder="Nacionalidade"
                    value={form.values.nacionalidade}
                    onChange={(event) => form.setFieldValue('nacionalidade', event.currentTarget.value)}
                    error={form.errors.nacionalidade && 'Nacionalidade inválida'}
                    radius="md"
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 6, sm: 1 }}>
                  <Input.Wrapper id='cep' label="CEP" required>
                    {/* 
                      // @ts-ignore */}                    
                    <Input component={InputMask}
                      id='cep'
                      required
                      mask="99.999-999"
                      placeholder="00.000-000"
                      value={form.values.cep}
                      onChange={(event: { currentTarget: { value: string; }; }) => form.setFieldValue('cep', event.currentTarget.value)}
                      error={form.errors.cep && 'CEP inválido'}
                      radius="md" />
                  </Input.Wrapper>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 5 }} >
                  <TextInput
                    required
                    label="Logradouro"
                    placeholder="Rua/Avenida"
                    value={form.values.logradouro}
                    onChange={(event) => form.setFieldValue('logradouro', event.currentTarget.value)}
                    error={form.errors.logradouro && 'Logradouro inválido'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 1 }} >
                  <TextInput
                    label="Número"
                    placeholder="Número"
                    value={form.values.numero}
                    onChange={(event) => form.setFieldValue('numero', event.currentTarget.value)}
                    error={form.errors.numero && 'Número inválido'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }} >
                  <TextInput
                    label="Complemento"
                    placeholder="Complemento"
                    value={form.values.complemento}
                    onChange={(event) => form.setFieldValue('complemento', event.currentTarget.value)}
                    error={form.errors.complemento && 'Complemento inválido'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }} >
                  <TextInput
                    required
                    label="Bairro"
                    placeholder="Bairro"
                    value={form.values.bairro}
                    onChange={(event) => form.setFieldValue('bairro', event.currentTarget.value)}
                    error={form.errors.bairro && 'Bairro inválido'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }} >
                  <TextInput
                    required
                    label="Cidade"
                    placeholder="Cidade"
                    value={form.values.cidade}
                    onChange={(event) => form.setFieldValue('cidade', event.currentTarget.value)}
                    error={form.errors.cidade && 'Cidade inválida'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 1 }} >
                  <Select
                    label="UF"
                    data={['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']}
                    value={form.values.uf}
                    onChange={(event) => form.setFieldValue('uf', event!.toString())}
                    error={form.errors.uf && 'UF inválida'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Input.Wrapper id='telefoneResidencial' label="Telefone Residencial">
                    {/* 
                      // @ts-ignore */}                    
                    <Input component={InputMask}
                      id='telefoneResidencial'
                      mask="(99) 9999-9999"
                      placeholder="(00) 0000-0000"
                      value={form.values.telefoneResidencial}
                      onChange={(event: { currentTarget: { value: string; }; }) => form.setFieldValue('telefoneResidencial', event.currentTarget.value)}
                      error={form.errors.telefoneResidencial && 'Telefone Residencial inválido'}
                      radius="md" />
                  </Input.Wrapper>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Input.Wrapper id='celular' label="Celular">
                    {/* 
                      // @ts-ignore */}                    
                    <Input component={InputMask}
                      id='celular'
                      mask="(99) 99999-9999"
                      placeholder="(00) 00000-0000"
                      value={form.values.celular}
                      onChange={(event: { currentTarget: { value: string; }; }) => form.setFieldValue('celular', event.currentTarget.value)}
                      error={form.errors.celular && 'Celular inválido'}
                      radius="md" />
                  </Input.Wrapper>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Input.Wrapper id='telefoneEmergencia' label="Telefone de Emergência">
                    {/* 
                      // @ts-ignore */}                    
                    <Input component={InputMask}
                      id='telefoneEmergencia'
                      mask="(99) 99999-9999"
                      placeholder="(00) 00000-0000"
                      value={form.values.telefoneEmergencia}
                      onChange={(event: { currentTarget: { value: string; }; }) => form.setFieldValue('telefoneEmergencia', event.currentTarget.value)}
                      error={form.errors.telefoneEmergencia && 'Telefone de Emergência inválido'}
                      radius="md" />
                  </Input.Wrapper>
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Select
                    label="Tipo Sanguíneo"
                    data={['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-']}
                    value={form.values.tipoSanguineo}
                    onChange={(event) => form.setFieldValue('tipoSanguineo', event!.toString())}
                    error={form.errors.tipoSanguineo && 'Tipo Sanguíneo  inválido'}
                    radius="md"
                  />

                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Select
                    label="Modalidade"
                    required
                    data={['Parapente', 'Asa Delta', 'Paramotor']}
                    value={form.values.modalidade}
                    onChange={(event) => form.setFieldValue('modalidade', event!.toString())}
                    error={form.errors.modalidade && 'Modalidade inválida'}
                    radius="md" />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <DateInput component={InputMask}
                    id='inicioEsporte'
                    required
                    label="Início no Esporte"
                    maxDate={dayjs(new Date()).toDate()}
                    placeholder="DD/MM/YYYY"
                    valueFormat="DD/MM/YYYY"
                    value={form.values.inicioEsporte}
                    onChange={(event) => form.setFieldValue('inicioEsporte', dayjs(event).toDate())}
                    error={form.errors.inicioEsporte && 'Data inválida'}
                    radius="md" />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 2 }}>
                  <Select
                    label="Nível"
                    required
                    data={['Aluno em instrução', 'Nível 1', 'Nível 2', 'Nível 3', 'Nível 4', 'Nível 5']}
                    value={form.values.nivel}
                    onChange={(event) => form.setFieldValue('nivel', event!.toString())}
                    error={form.errors.nivel && 'Nível inválido'}
                    radius="md" />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }} >
                  <TextInput
                    required
                    label="Escola"
                    placeholder="Escola"
                    value={form.values.escola}
                    onChange={(event) => form.setFieldValue('escola', event.currentTarget.value)}
                    error={form.errors.escola && 'Escola inválida'}
                    radius="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }} >
                  <TextInput
                    required
                    label="Instrutor"
                    placeholder="Instrutor"
                    value={form.values.instrutor}
                    onChange={(event) => form.setFieldValue('instrutor', event.currentTarget.value)}
                    error={form.errors.instrutor && 'Instrutor inválido'}
                    radius="md"
                  />
                </Grid.Col>
              </Grid>
              <Checkbox
                label="Eu aceito os Termo de Responsabilidade"
                checked={form.values.termoResponsabilidade}
                onChange={(event) => form.setFieldValue('termoResponsabilidade', event.currentTarget.checked)}
              />
              <Anchor size='sm' onClick={open}>* Visualisar termo de responsabilidade</Anchor>
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