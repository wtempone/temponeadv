import { useToggle } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Checkbox,
  Anchor,
  Stack,
  Container,
  Center,
  Title,
} from '@mantine/core';
import { GoogleButton } from './GoogleButton';
import { CreateUser, TranslateAuthError, signInWithEmailPassword } from '~/lib/authServices';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useUserData } from '~/components/contexts/UserDataContext';
import { FooterApp } from '~/components/router/footer/FooterApp';

export function AuthenticationForm(props: PaperProps) {
  const [type, toggle] = useToggle(['login', 'register']);
  const { userData } = useUserData();
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'E-mail inválido'),
      password: (val) => (val.length <= 6 ? 'A senha deve ter no mínimo 6 caractéres' : null),
    },
  });
  const navigate = useNavigate();

  const openModal = (email: string, password: string) =>
    modals.open({
      fullScreen: true,
      children: (
        <Container mt="md">
          <Center>
            <Title py="xl" size="h3">
              Bem vindo!
            </Title>
          </Center>
          <Center>
            <Button
              mb="xl"
              variant="link"
              size="xl"
              onClick={() => {
                modals.closeAll();
                navigate('/profile');
              }}
              mt="md"
            >
              Continuar
            </Button>
          </Center>
        </Container>
      ),
    });

  const register = (email: string, password: string) => {
    CreateUser(email, password)
      .then(() => {
        openModal(email, password);
      })
      .catch((err) => {
        notifications.show({
          color: 'red',
          title: 'Erro na criação de usuário',
          message: TranslateAuthError(err.code),
        });
      });
  };
  const login = (email: string, password: string) => {
    signInWithEmailPassword(email, password)
      .then(() => {
        if (userData) {
          navigate('/');
        } else {
          navigate('/profile');
        }
      })
      .catch((err) => {
        notifications.show({
          color: 'red',
          title: 'Erro no login do usuário',
          message: TranslateAuthError(err.code),
        });
      });
  };

  return (
    <>
      <Container>
        <Paper radius="md" p="xl" withBorder {...props}>
          <Center>
            <Text size="md" fw={500}>
              {type == 'register' ? 'Registre-se' : 'Faça seu login'} com
            </Text>
          </Center>
          <Group grow mb="md" mt="md">
            <GoogleButton fullWidth radius="xl">
              Google
            </GoogleButton>
          </Group>
          <Center>
            <Text size="md" fw={500} mb="md">
              ou continue com seu e-mail
            </Text>
          </Center>
          <form
            onSubmit={form.onSubmit((user) => {
              if (type === 'register') {
                register(user.email, user.password);
              } else {
                login(user.email, user.password);
              }
            })}
          >
            <Stack>
              <TextInput
                required
                label="Email"
                placeholder="piloto@voolivre.com"
                value={form.values.email}
                onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                error={form.errors.email && 'Invalid email'}
                radius="md"
              />

              <PasswordInput
                required
                label="Senha"
                placeholder="Sua Senha"
                value={form.values.password}
                onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                error={form.errors.password && 'A senha deve ter no mínimo 6 caracteres'}
                radius="md"
              />

              {type === 'register' && (
                <Checkbox
                  label="Eu aceito os termos e condições do site"
                  checked={form.values.terms}
                  onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
                />
              )}
            </Stack>

            <Group justify="space-between" mt="xl">
              <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
                {type === 'register'
                  ? 'Já possui uma conta? Faça seu login'
                  : 'Ainda não tem uma conta? Registe-se no nosso site'}
              </Anchor>
              <Button type="submit" radius="xl">
                {type === 'register' ? 'Cadastrar' : 'Logar'}
              </Button>
            </Group>
          </form>
        </Paper>
      </Container>
      <FooterApp />
    </>
  );
}
