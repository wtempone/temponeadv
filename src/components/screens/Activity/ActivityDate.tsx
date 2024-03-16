import { ActionIcon, Center, Container, Group, LoadingOverlay, SimpleGrid, Text, Title, UnstyledButton, rem } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from '~/components/contexts/UserContext';
import { useUserData } from '~/components/contexts/UserDataContext';
import { fullNamedDateString, stringToDate } from '~/components/shared/helpers';
import { ListTrackLogUserData } from '~/lib/repositories/userTrackLogRepository';
import ItemtActivity from './ItemActivity';
import { RiMovieLine } from 'react-icons/ri';
import { FaArrowLeft, FaListUl, FaPlay } from 'react-icons/fa';
import { MdNavigateBefore } from 'react-icons/md';
import { useDisclosure } from '@mantine/hooks';
import { LoadingMain } from '~/components/shared/Loading';

export default function ActivityDate() {
  const params = useParams();
  if (!params || !params.id) {
    throw new Error('Data não informada');
  }
  const dataparam = stringToDate(params.id!);
  const [items, setItems] = useState<Array<any>>();
  const [count, setCount] = useState<number>();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [initiliazed, setInitiliazed] = useState<boolean>(false);
  const [visible, { toggle }] = useDisclosure(true);

  useEffect(() => {
    if (!initiliazed) {
      refresh();
      setInitiliazed(true);
    }
  }, []);

  function refresh() {
    ListTrackLogUserData(dataparam!).then((resp) => {
      setItems(resp!);
      setHasMore(false);
      toggle();
    });
  }

  return (
    <>
      <LoadingOverlay visible={visible} overlayProps={{ blur: 10 }} loaderProps={{ children: <LoadingMain /> }} />
      <Container>
        <Group justify="space-between">
          <Title size="h5" mb="md">
            {fullNamedDateString(dataparam!)}
          </Title>

          <Group>
            <UnstyledButton 
            variant="default" size="xl" 
            aria-label="Abrir cena do dia"
            component={Link}
            to={`/scene/ /${params.id!}`}

            >
              <FaPlay/>
            </UnstyledButton>
            <UnstyledButton
              component={Link}
              to="/activity"
              variant="default"
              size="xl"
              aria-label="Ir para lista de voos do dia"
            >
              <FaArrowLeft  />
            </UnstyledButton>
          </Group>
        </Group>
        <Group justify="center">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {items && items.map((item, index) => <ItemtActivity key={index} Tracklog={item} />)}
          </SimpleGrid>
        </Group>
      </Container>
    </>
  );
}
