import { IconChevronRight } from '@tabler/icons-react';
import { Avatar, Button, Group, Text, UnstyledButton } from '@mantine/core';
import classes from './UserButton.module.css';
import { useEffect, useState } from 'react';
import { useAuthState } from '~/components/contexts/UserContext';
import { useUserData } from '~/components/contexts/UserDataContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from '~/lib/authServices';

export function UserButton() {
  const { state } = useAuthState();
  const { userData } = useUserData();
  const [foto, setFoto] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [isAuthenticated, setAutenticate] = useState<Boolean>(false);

  useEffect(() => {
    setAutenticate(false);
    setFoto(null);
    setNome(null);
    if (state.state === 'SIGNED_IN') {
      setAutenticate(true);
      setFoto(state.currentUser.photoURL!);
      setNome(state.currentUser.displayName!);
    }
    if (userData) {
      setFoto(userData.photoURL!);
      setNome(userData.nome);
    }
  }, [state, userData]);
  const navigator = useNavigate();
  function logoff() {
    LogOut().then(() => {
      navigator('/');
    });
  }
  return (
    <>
      <UnstyledButton className={classes.user} component={Link} variant="link" to={'/profile'}>
        <Group>
          <Avatar
            src={foto ? foto : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
            radius="xl"
          />

          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {nome ? nome : 'Usuário'}
            </Text>

            <Text c="dimmed" size="xs">
              Editar Perfil
            </Text>
          </div>

          <IconChevronRight size={14} stroke={1.5} />
        </Group>
      </UnstyledButton>
      <Group justify="center" mt="md">
        <Button onClick={() => logoff()}>Sair</Button>
      </Group>
    </>
  );
}
