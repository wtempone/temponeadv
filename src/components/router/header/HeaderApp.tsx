import {
  Avatar,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Divider,
  Drawer,
  Group,
  HoverCard,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
  rem,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBook, IconChevronDown, IconCoin, IconExternalLink } from '@tabler/icons-react';
import { BiNews, BiTransfer } from 'react-icons/bi';
import companyLogo from '../../../assets/images/Capa-Tempone2-1024x243.png';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from '~/components/contexts/UserContext';
import { useUserData } from '~/components/contexts/UserDataContext';
import { LogOut } from '~/lib/authServices';
import classes from './HeaderApp.module.css';
import { useErrorBoundary } from 'react-error-boundary';
import { FaRegPaperPlane } from 'react-icons/fa';

export function HeaderApp() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const navigate = useNavigate();
  const { state } = useAuthState();
  const { userData } = useUserData();

  const theme = useMantineTheme();

  function logoff() {
    LogOut().then(() => {
      closeDrawer();
      navigate('/');
    });
  }
  const [foto, setFoto] = useState<string | null>(null);
  const [nome, setNome] = useState<string | null>(null);
  const [isAuthenticated, setAutenticate] = useState<Boolean>(false);

  const areaLogada = [
    {
      icon: IconExternalLink,
      title: 'Envie seu documento',
      description: 'Upload de arquivos para análise',
      link: '/uploadTrackFile',
    },
    {
      icon: IconBook,
      title: 'Editar Perfil',
      description: 'Atualize os dados do seu perfil',
      link: '/profile',
    },
    {
      icon: IconBook,
      title: 'Areas de Atuação',
      description: 'Atualize as áreas de atuação',
      link: '/areas_atuacao',
    },
    {
      icon: IconBook,
      title: 'Equipe de Funcionários',
      description: 'Gerencie os funcionários do escritório',
      link: '/funcionarios',
    },
    {
      icon: IconBook,
      title: 'Perguntas Frequentes',
      description: 'Gerencie as perguntas frequentes',
      link: '/perguntas_frequentes',
    },

    // {
    //   icon: IconCoin,
    //   title: 'Pagamento',
    //   description: 'Verifique seus pagamentos de anuidades e inscrições',
    //   link: '/payment'
    // },
    // {
    //   icon: BiTransfer,
    //   title: 'Sincronização',
    //   description: 'Configure seus dados de sincronização com outros parceiros',
    //   link: '/sincronize'
    // },
    // {
    //   icon: BiNews,
    //   title: 'Noticias',
    //   description: 'Cadastre novas notícias',
    //   link: '/news'
    // }
  ];

  const links = areaLogada.map((item) => (
    <UnstyledButton
      className={classes.subLink}
      key={item.title}
      component={Link}
      variant="link"
      to={item.link}
      onClick={closeDrawer}
    >
      <Group align="flex-start" p="xs">
        <Group wrap="nowrap" justify="initial">
          <ThemeIcon size={34} variant="default" radius="md">
            <item.icon style={{ width: rem(22), height: rem(22) }} color={theme.colors.orange[6]} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="sm" fw={500}>
              {item.title}
            </Text>
            <Text size="xs" c="dimmed">
              {item.description}
            </Text>
          </Stack>
        </Group>
      </Group>
    </UnstyledButton>
  ));

  function useScrollDirection() {
    const [scrollDirection, setScrollDirection] = useState('');

    useEffect(() => {
      let lastScrollY = window.scrollY;

      const updateScrollDirection = () => {
        const scrollY = window.scrollY;
        const direction = scrollY > lastScrollY ? 'down' : 'up';
        if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
          setScrollDirection(direction);
        }
        lastScrollY = scrollY > 0 ? scrollY : 0;
      };
      window.addEventListener('scroll', updateScrollDirection); // add event listener
      return () => {
        window.removeEventListener('scroll', updateScrollDirection); // clean up
      };
    }, [scrollDirection]);

    return scrollDirection;
  }
  const scrollDirection = useScrollDirection();

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
  }, [state, userData, scrollDirection]);

  return (
    <Box className={[classes.box_hide, scrollDirection === 'down' && classes.down].join(' ')}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <img src={companyLogo} id="companyLogo" style={{ width: rem(252), height: rem(60) }} alt="company logo" />
          <Group h="100%" visibleFrom="sm ">
            <Text className={classes.link} component={Link} variant="link" to="/">
              Quem Somos
            </Text>
            <Text className={classes.link} component={Link} variant="link" to="/news">
              Notícias
            </Text>
            {isAuthenticated && (
              <HoverCard position="bottom" radius="md" shadow="md" withinPortal>
                <HoverCard.Target>
                  <a href="#" className={classes.link}>
                    <Center inline>
                      <Box component="span" mr={5}>
                        Área Logada
                      </Box>
                      <IconChevronDown style={{ width: rem(16), height: rem(16) }} color={theme.colors.orange[6]} />
                    </Center>
                  </a>
                </HoverCard.Target>

                <HoverCard.Dropdown>
                  <SimpleGrid cols={1} spacing={0} py="xs" mb="md">
                    {links}
                  </SimpleGrid>

                  <div className={classes.dropdownFooter}>
                    <Group justify="end">
                      <Button variant="outline" onClick={logoff}>
                        Sair
                      </Button>
                    </Group>
                  </div>
                </HoverCard.Dropdown>
              </HoverCard>
            )}
          </Group>

          <Group visibleFrom="sm">
            {!isAuthenticated && (
              <Button component={Link} variant="link" to="/login">
                Entrar
              </Button>
            )}
            {isAuthenticated && (
              <Stack>
                <Center>
                  <Avatar src={foto} radius="xl" size="md" />
                </Center>
                <Center>
                  <Text fw={500} size="sm" lh={1} mr={3} className={classes.avatar_text}>
                    {nome}
                  </Text>
                </Center>
              </Stack>
            )}
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer opened={drawerOpened} onClose={closeDrawer} size="100%" padding="md" hiddenFrom="sm" zIndex={1000000}>
        {!isAuthenticated && (
          <Button fullWidth={true} component={Link} variant="link" to="/login" onClick={toggleDrawer}>
            Entrar
          </Button>
        )}
        {isAuthenticated && (
          <Stack>
            <Center>
              <Avatar src={foto} radius={80} size={80} />
            </Center>
            <Center>
              <Text fw={500} size="sm" lh={1} mr={3}>
                {nome}
              </Text>
            </Center>
          </Stack>
        )}
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Divider my="sm" />

          <Text className={classes.link} onClick={closeDrawer} component={Link} variant="link" to="/">
            Quem Somos
          </Text>
          <Text className={classes.link} onClick={closeDrawer} component={Link} variant="link" to="/news">
            Notícias
          </Text>
          {isAuthenticated && (
            <>
              <UnstyledButton className={classes.link} onClick={toggleLinks}>
                <Center inline>
                  <Box component="span" mr={5}>
                    Área Logada
                  </Box>
                  <IconChevronDown style={{ width: rem(16), height: rem(16) }} color={theme.colors.orange[6]} />
                </Center>
              </UnstyledButton>
              <Collapse in={linksOpened} ml="md" mt="md">
                {links}
              </Collapse>
            </>
          )}

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            {isAuthenticated && (
              <Button variant="outline" fullWidth={true} onClick={logoff}>
                Sair
              </Button>
            )}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
