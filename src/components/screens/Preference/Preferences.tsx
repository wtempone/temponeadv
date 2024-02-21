import { Card, Group, MantineColorScheme, Switch, Text, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import classes from './Preferences.module.css';
import { useEffect, useState } from 'react';
export function Preferences() {

  const computedColorScheme = useComputedColorScheme('light');
  const {setColorScheme} = useMantineColorScheme();
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };
  return (
    <Card withBorder radius="md" p="xl" className={classes.card}>
      <Text fz="lg" className={classes.title} fw={500}>
        Preferências do usuário
      </Text>
      <Text fz="xs" c="dimmed" mt={3} mb="xl">
        Personalize sua experiência no site
      </Text>
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