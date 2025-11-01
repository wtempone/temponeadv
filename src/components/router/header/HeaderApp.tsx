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
import {
  IconBook,
  IconChevronDown,
  IconCoin,
  IconExternalLink,
  IconHelpCircle,
  IconMapPin,
  IconSettings,
  IconUpload,
  IconUserCog,
  IconUsersGroup,
} from '@tabler/icons-react';
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
import { MenuLogado } from '../MenuLogado/MenuLogado';

export function HeaderApp() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const navigate = useNavigate();
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

  const theme = useMantineTheme();

  function logoff() {
    LogOut().then(() => {
      closeDrawer();
      navigate('/');
    });
  }

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

  return (
    <Box className={[classes.box_hide, scrollDirection === 'down' && classes.down].join(' ')}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <img src={companyLogo} id="companyLogo" style={{ width: rem(252), height: rem(60) }} alt="company logo" />
          <Group h="100%" visibleFrom="sm ">
            <Text className={classes.link} component={Link} variant="link" to="/">
              Quem Somos
            </Text>
            <Text className={classes.link} component={Link} variant="link" to="/consulta_propmocao">
              Consulta promoções
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
                  <MenuLogado />
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
          <Text className={classes.link} onClick={closeDrawer} component={Link} variant="link" to="/consulta_propmocao">
            Consulta promoções
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
                <MenuLogado />
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
