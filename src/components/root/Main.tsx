import { GoogleMaps, Ion } from 'cesium';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSignIn, useSignOut } from '~/components/contexts/UserContext';
import { Router } from '~/components/router/Router';
import { setupFirebase } from '~/lib/firebase';
import classes from './Main.module.css';
import { Button, Container, SimpleGrid, Title,Image , Text, Code} from '@mantine/core';
import image from '../../assets/images/avatar/page_not_found.png';

function Main() {
  const { signIn } = useSignIn();
  const { signOut } = useSignOut();

  useEffect(() => {
    setupFirebase();
    Ion.defaultAccessToken = import.meta.env.VITE_ION_ACCESS_TOKEN;
    GoogleMaps.defaultApiKey = import.meta.env.VITE_GOOGLEMAPS_APIKEY;

    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        signIn(user);
      } else {
        signOut();
      }
    });
  }, []);

  function fallbackRender(props: { error: Error, resetErrorBoundary: () => void }) {
    return (
      <Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
        <Image src={image} className={classes.mobileImage} />
        <div>
          <Title className={classes.title}>Alguma coisa deu errado...</Title>
          <Text c="dimmed" size="lg" mb='xl'>
            Ocorreu um erro inesperado ao carregar a página. Procure nosso suporte para mais informações.
            Informe a mensagem abaixo para auxiliar na resolução do problema.
          </Text>
          <Code className={classes.error_message } block>{props.error.message}</Code>;
          <Button variant="outline" size="md" mt="xl" className={classes.control} onClick={props.resetErrorBoundary}>
            Volte para a home page
          </Button>
        </div>
        <Image src={image} className={classes.desktopImage} />
      </SimpleGrid>
    </Container>
    );
  }

  return (
    <ErrorBoundary fallbackRender={fallbackRender}  onReset={() => { location.href = '/'}}>
        <Router />
    </ErrorBoundary>
  );
}

export default Main;
