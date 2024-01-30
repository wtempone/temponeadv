import { Anchor, Center, Container, Text, rem, Image, Title, Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { Head } from "~/components/shared/Head";
import image from "../../assets/images/avatar/inconstruction.png";

function UnderConstruction() {
  return (
    <>
      <Head title={'Acesso negado'}></Head>
      <Container mt='md'>
        <Center>
          <Title py="xl" size="h3">
            Estamos trabalhando nisso.
          </Title>
        </Center>
        <Center>
          <Button
            component={Link}
            mb="xl"
            variant='link'
            size="xl"
            to='/'>
            Voltar para página inicial
          </Button>
        </Center>
        <Center>
          <Image src={image} h={300} alt="Página não encontrada" />
        </Center>
        <Center>
          <Title py="xl" size="h2">
            Página em construção
          </Title>
        </Center>
      </Container>
    </>
  )
}

export default UnderConstruction
