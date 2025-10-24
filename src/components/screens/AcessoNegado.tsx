import { Anchor, Center, Container, Text, rem, Image, Title, Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Head } from '~/components/shared/Head';

function AccessDenied() {
  return (
    <>
      <Head title={'Acesso negado'}></Head>
      <Container mt="md">
        <Center>
          <Title py="xl" size="h3">
            Faça o login para acessar a pagina.
          </Title>
        </Center>
        <Center>
          <Button component={Link} mb="xl" variant="link" size="xl" to="/login">
            Ir para página de login
          </Button>
        </Center>
        <Center>
          <Title py="xl" size="h1">
            Acesso negado
          </Title>
        </Center>
      </Container>
    </>
  );
}

export default AccessDenied;
