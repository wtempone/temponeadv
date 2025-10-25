import {
  Card,
  Group,
  MantineColorScheme,
  Switch,
  Text,
  useMantineColorScheme,
  useComputedColorScheme,
  Button,
  Avatar,
  FileButton,
} from '@mantine/core';
import classes from './Profile.module.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserData } from '~/components/contexts/UserDataContext';
import ModalNewFotoAdvanceCropper from '~/components/shared/Cropper/ModalNewFotoAdvanceCropper';
import { modals } from '@mantine/modals';
import { ChangeFotoUserData, ChangeGliderSettings, GliderSettings } from '~/lib/repositories/userDataRepository';
import { notifications } from '@mantine/notifications';
export function Profile() {
  const computedColorScheme = useComputedColorScheme('light');
  const { setColorScheme } = useMantineColorScheme();
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };
  const { userData, setUserData } = useUserData();

  const changeFoto = (file: File | null) => {
    if (file) {
      modals.open({
        modalId: 'modal-crop',
        fullScreen: true,
        title: 'Selecionar foto',
        children: <ModalNewFotoAdvanceCropper image={file} onClose={closeModalCrop} onConfirm={confirmModalCrop} />,
      });
    }
  };

  const confirmModalSettings = async (gliderSettings: GliderSettings) => {
    const user = await ChangeGliderSettings(userData!.id, gliderSettings!);
    if (user) {
      setUserData(user);
    } else {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao atualizar o equipamento',
        color: 'red',
      });
    }
    closeModalSettings();
  };

  const closeModalSettings = () => {
    modals.close('modal-equipamento');
  };

  const confirmModalCrop = async (fotoCropped: any) => {
    const user = await ChangeFotoUserData(userData!.id, fotoCropped);
    if (user) {
      setUserData(user);
    } else {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao atualizar a foto',
        color: 'red',
      });
    }
    closeModalCrop();
  };

  const closeModalCrop = () => {
    modals.close('modal-crop');
  };

  return (
    <Card withBorder radius="md" p="xl" className={classes.card}>
      <Text fz="lg" className={classes.title} fw={500}>
        Editar Perfil
      </Text>
      <Text fz="xs" c="dimmed" mt={3} mb="xl">
        Personalize sua experiência no site
      </Text>
      <Group p="lg">
        <Avatar src={userData?.photoURL} size="lg" radius="xl" />
        <Text fz="lg" fw={700} inline={true}>
          {userData?.nome}
        </Text>
      </Group>

      <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
        <div>
          <Text>Alterar foto</Text>
          <Text size="xs" c="dimmed">
            Altere sua foto
          </Text>
        </div>
        <FileButton onChange={changeFoto} accept="image/*">
          {(props) => (
            <Button size="md" radius="xl" mt="xs" disabled={!userData} {...props}>
              Selecionar
            </Button>
          )}
        </FileButton>
      </Group>

      <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
        <div>
          <Text>{userData ? 'Alterar cadastro' : 'Complete seu cadastro'}</Text>
          {userData && (
            <Text size="xs" c="dimmed">
              Complete seu cadastro para ter acesso a todos os recursos do site
            </Text>
          )}
          <Text size="xs" c="dimmed">
            Altere seus dados cadastrais
          </Text>
        </div>
        <Button size="md" variant="filled" radius="xl" component={Link} to="/profileForm">
          {userData ? 'Alterar' : 'Preencher'}
        </Button>
      </Group>

      <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
        <div>
          <Text>Equipamento padrão</Text>
          <Text size="xs" c="dimmed">
            Personalize as configurações de cores padrões do seu equipamento
          </Text>
        </div>
      </Group>

      <Group justify="space-between" className={classes.item} wrap="nowrap" gap="xl">
        <div>
          <Text>Modo Escruro</Text>
          <Text size="xs" c="dimmed">
            Personalize sua experiência, alterne entre os modos de exibição
          </Text>
        </div>
        <Switch
          onLabel="Ligado"
          offLabel="Desligado"
          className={classes.switch}
          size="lg"
          checked={computedColorScheme === 'dark'}
          onChange={toggleColorScheme}
        />
      </Group>
    </Card>
  );
}
