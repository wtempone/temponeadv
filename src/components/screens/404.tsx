import { Anchor, Center, Container, Text, rem, Image, Title, Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import { Head } from '~/components/shared/Head';

function Page404() {
  return (
    <>
      <Head title={'Pagina não encontrada'}></Head>
      <Container mt="md">
        <Center>
          <Button component={Link} mb="xl" variant="link" size="xl" to="/">
            Voltar para página inicial
          </Button>
        </Center>
        <Center>
          <Title py="xl" size="h1">
            Pagina não encontrada
          </Title>
        </Center>
      </Container>
    </>
  );
}

export default Page404;
