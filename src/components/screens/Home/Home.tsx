import { Carousel } from '@mantine/carousel';
import { Container, Paper, Title, Text, Button, Image, List, LoadingOverlay } from '@mantine/core';
import classes from './Home.module.css';
import { useAuthState } from '~/components/contexts/UserContext';
import { useEffect, useRef, useState } from 'react';
import { useFirestore } from '~/lib/firebase';
import { LinksInicio, ListLinksInicio } from '~/lib/repositories/linksInicioRepository';
import { Link, useNavigate } from 'react-router-dom';
import { ListSectionsInicio, SectionsInicio } from '~/lib/repositories/sectionsInicioRepository';
import Autoplay from 'embla-carousel-autoplay';
import { useDisclosure } from '@mantine/hooks';
import { LoadingMain } from '~/components/shared/Loading';
import { FooterApp } from '~/components/router/footer/FooterApp';
import { useUserData } from '~/components/contexts/UserDataContext';

function Card({ imagem }: LinksInicio) {
  return (
    <Paper
      shadow="md"
      p="xl"
      radius="md"
      style={{ backgroundImage: `url(${imagem})` }}
      className={classes.card}
    >
    </Paper>
  );
}


export default function Home() {

  const { userData } = useUserData();
  const [linksInicio, setLinksInicio] = useState<Array<LinksInicio>>([]);
  useEffect(() => {
    async function homeConfig() {
      await ListLinksInicio().then((links) => {
        toggle();
        setLinksInicio(links);
      })
    }
    homeConfig();
  }, [])


  const slides = linksInicio.map((item, index) => (
    <Carousel.Slide key={item.id} >
      <Card {...item} />
    </Carousel.Slide>
  ));

  const autoplay = useRef(Autoplay({ delay: 2000 }));
  const [visible, { toggle }] = useDisclosure(true);

  return (
    <>
      <LoadingOverlay visible={visible} overlayProps={{ radius: 'xl', blur: 5 }} loaderProps={{ children: <LoadingMain /> }} />
      <div className={classes.hero}>
        <Container className={classes.container} size="md">
          <Title className={classes.main_title}>
            Bem-vindo à AVLVA - Associação de Voo Livre Amador </Title>
          <Text className={classes.description} size="xl" mt="xl">
            Explore o céu como nunca antes com a AVLVA! Se você é um entusiasta do voo livre amador ou apenas curioso para experimentar a sensação de liberdade que só o voo pode proporcionar, você está no lugar certo.          </Text>
          {!userData && (
            <Button variant="gradient" size="xl" radius="xl" className={classes.control}
              component={Link}
              to='/login'>
              Entrar
            </Button>
          )}
        </Container>
      </div>
      <Carousel
        align="start"
        withIndicators
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
      >
        {slides}
      </Carousel>

      <Paper>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Quem Somos
            </Title>
            <Text fz="md" c="dimmed">
              Na AVLVA, temos uma paixão compartilhada pelo voo livre e estamos comprometidos em oferecer uma comunidade acolhedora e recursos abrangentes para todos os interessados nesse emocionante esporte.            </Text>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Por que escolher a AVLVA?

            </Title>
            <List fz="md" c="dimmed">
              <List.Item>
                Comunidade Apaixonada: Junte-se a uma comunidade de voo livre entusiasta e compartilhe suas experiências com outros amantes do voo.
              </List.Item>
              <List.Item>
                Segurança em Primeiro Lugar: Priorizamos a segurança em todas as nossas atividades e fornecemos recursos e orientações para garantir que todos os nossos membros voem com responsabilidade.
              </List.Item>
              <List.Item>
                Eventos e Encontros: Participe de eventos emocionantes e encontros sociais para conhecer outros pilotos e compartilhar suas aventuras no céu.
              </List.Item>
              <List.Item>
                Elaboração e realização de projetos para profissionais e amadores nas áreas de esportes, cultura e turismo.
              </List.Item>
              <List.Item>
                Você pode fazer upload de suas fotos e arquivos de tracklog de voo, permitindo que você compartilhe suas rotas e experiências com outros membros da comunidade. Interaja, troque informações e inspire-se com outros pilotos amadores.
              </List.Item>
            </List>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Participe da Mudança
            </Title>
            <Text fz="md" c="dimmed">
              Seja parte ativa da AVLVA! Torne-se um associado e contribua para o fortalecimento do esporte.
            </Text>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Junte-se a nós! AVLVA
            </Title>
          </div>
        </div>
      </Paper>
      <FooterApp />

    </>

  );
}