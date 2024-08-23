import { ActionIcon, Avatar, Card, Center, Container, Group, LoadingOverlay, Paper, SimpleGrid, Stack, Text, Title, UnstyledButton, rem } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from '~/components/contexts/UserContext';
import { useUserData } from '~/components/contexts/UserDataContext';
import { fullNamedDateString, stringToDate, tsFBToDate } from '~/components/shared/helpers';
import { EstatisticasPiloto, GenerateStatisticsPilot, ListTrackLogUserData, ListTrackLogsByUser } from '~/lib/repositories/userTrackLogRepository';
import ItemtActivity from './ItemActivity';
import { RiMovieLine } from 'react-icons/ri';
import { FaArrowLeft, FaListUl, FaPlay } from 'react-icons/fa';
import { MdNavigateBefore } from 'react-icons/md';
import { useDisclosure } from '@mantine/hooks';
import { LoadingMain } from '~/components/shared/Loading';
import { GetUserData, UserData } from '~/lib/repositories/userDataRepository';
import classes from './ActivityUser.module.css';
export default function ActivityUser() {
  const params = useParams();
  if (!params || !params.id) {
    throw new Error('PilotoNçao informado');
  }
  const [user, setUser] = useState<UserData>();
  const [items, setItems] = useState<Array<any>>();
  const [count, setCount] = useState<number>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initiliazed, setInitiliazed] = useState<boolean>(false);
  const [visible, { close, open }] = useDisclosure(true);
  const { userData } = useUserData();

  useEffect(() => {
    if (!initiliazed) {
      refresh();
      setInitiliazed(true);
    }
  }, []);

  async function refresh() {
    const resp = await GetUserData(params.id!);
    setUser(resp);
    open()

    ListTrackLogsByUser(params.id!).then((resp) => {
      setItems(resp!);
      setHasMore(false);
      close();
    });
  }

  return (
    <>
      <LoadingOverlay visible={visible} overlayProps={{ blur: 10 }} loaderProps={{ children: <LoadingMain /> }} />
      <Container>
        {user && (
          <Stack p='xs'>
            <Title size='h2'> {!!userData && user!.id == userData!.id ? 'Meus Voos' : 'Página do Piloto'}</Title>
            <Center>
              <Avatar
                src={user!.photoURL}
                size='xl'
                radius='xl'
              />
            </Center>
            <Center>
              <Text fz="sm" fw={700} inline={true}>
                {user!.nome}
              </Text>
            </Center>
          </Stack>
        )}

        {!items || items!.length == 0 && (
          <Title size='h3' mt='sm'> Nenum voo registrado</Title>
        )}
        {items && items!.length > 0 && (
          <>
            <Title size='h3' mt='sm'> Estatísticas</Title>
            <Paper withBorder p="sm" radius="md" className={classes.root_stats}>
              <SimpleGrid cols={{ base: 2, sm: 4 }} >
                {
                  GenerateStatisticsPilot(items).map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <Paper withBorder p="xs" radius="md" key={stat.title}>
                        <Group justify="space-between" wrap='nowrap'>
                          <Text size="xs" c="dimmed">
                            {stat.title}
                          </Text>
                          <Icon size="1.4rem" className={classes.icon} />
                        </Group>
                        <Group align="flex-end" >
                          <Text fw={700}>{stat.value}</Text>
                        </Group>

                      </Paper>
                    );
                  })}
              </SimpleGrid>
            </Paper>
            <Title size='h3' mt='sm'> Voos</Title>
            <Group justify="center">
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                {items && items.map((item, index) =>
                  <Card p={0} key={index}>
                    <Card.Section>
                      <Title size='h5' pt={20} ta='end' pr='xl'>
                        {fullNamedDateString(tsFBToDate(item.data!)!)}
                      </Title>
                    </Card.Section>
                    <ItemtActivity key={index} Tracklog={item} parentRefresh={refresh} />
                  </Card>
                )}
              </SimpleGrid>
            </Group>
          </>
        )}

      </Container>
    </>
  );
}
