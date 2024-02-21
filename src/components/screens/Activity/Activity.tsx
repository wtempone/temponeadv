import { ActionIcon, Button, Center, Container, Group, LoadingOverlay, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconExternalLink } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from '~/components/contexts/UserContext';
import { useUserData } from '~/components/contexts/UserDataContext';
import { useFunctions } from '~/lib/firebase';
import { ListAllTrackLogDataUser } from '~/lib/repositories/userTrackLogRepository';
import TimeLineActivity from './TimeLineActivity';
import { useDisclosure } from '@mantine/hooks';
import { LoadingMain } from '~/components/shared/Loading';
import classes from './Activity.module.css';
export default function Activity() {
  const functions = useFunctions();

  const [items, setItems] = useState<Object>();
  const [count, setCount] = useState<number>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initiliazed, setInitiliazed] = useState<boolean>(false);
  const { state } = useAuthState();
  const { userData } = useUserData();
  const navigate = useNavigate();
  const [visible, { toggle }] = useDisclosure(true);
  useEffect(() => {
    if (!initiliazed) {
      refresh();
      setInitiliazed(true);
    }
  }, []);

  function fetchMoreData() {
  }
  function refresh() {
    ListAllTrackLogDataUser(10).then((resp) => {
      setItems(resp!.records);
      setHasMore(resp!.hasMore);
      toggle();
    });
  }
  function openModalSendFile() {
    if (state.state !== 'SIGNED_IN') {
      modals.open({
        centered: true,
        children: (
          <>
            <Center>
              <Text >Faça o login para acessar essa funcionalidade</Text>
            </Center>
            <Center>
              <Group justify="space-between">
                <Button onClick={() => modals.closeAll()} mt="md">
                  Cancelar
                </Button>
                <Button  onClick={() => modals.closeAll()} component={Link} to="/login" mt="md">
                  Ir para login
                </Button>
              </Group>
            </Center>
          </>
        ),
      });
    } else {
      if (!userData) {
        modals.open({
          centered: true,
          children: (
            <>
              <Center>
                <Text size="lg">Complete seu cadastro para acessar essa funcionalidade</Text>
              </Center>
              <Group justify="space-between">
                <Button variant="default" onClick={() => modals.closeAll()} mt="md">
                  Cancelar
                </Button>
                <Button  onClick={() => modals.closeAll()} component={Link} to="/profile" mt="md">
                  Ir para cadastro
                </Button>
              </Group>
            </>
          ),
        });
      } else {
        navigate('/uploadTrackFile');
      }
    } 
  }
  return (
    <>
      <LoadingOverlay visible={visible} overlayProps={{ blur: 5 }} loaderProps={{ children: <LoadingMain /> }} />
      <Container>
        <ActionIcon
          component="a"
          size="xl"
          className={classes.send_file}
          aria-label="Envie seu arquivo"
          style={{ position: 'fixed', bottom: 20, right: 20, borderRadius: 50 }}
          onClick={() => openModalSendFile()}
        >
          <IconExternalLink />
        </ActionIcon>
        {items && (
          <InfiniteScroll
            dataLength={Object.values(items).length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
              <Center>
                <h4>Carregando...</h4>
              </Center>
            }
            endMessage={
              <p style={{ textAlign: 'center' }}>
                {Object.values(items).length && Object.values(items).length > 0 ? (
                  <b>Pronto! Isso é tudo</b>
                ) : (
                  <b>Nenhum registro encontrado</b>
                )}
              </p>
            }
            refreshFunction={refresh}
            pullDownToRefresh
            pullDownToRefreshThreshold={10}
            pullDownToRefreshContent={<h3 style={{ textAlign: 'center' }}>&#8595; Puxe para recarregar</h3>}
            releaseToRefreshContent={<h3 style={{ textAlign: 'center' }}>&#8593; Solter para recarregar</h3>}
          >
            {Object.values(items).map((item, index) => (
              <TimeLineActivity key={index} DateActivity={item} />
            ))}
          </InfiniteScroll>
        )}
      </Container>
    </>
  );
}
