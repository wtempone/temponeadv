import { Carousel } from '@mantine/carousel';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Image,
  List,
  LoadingOverlay,
  Grid,
  Card,
  useMantineTheme,
  Group,
  Badge,
  SimpleGrid,
} from '@mantine/core';
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
import { AreaAtuacao, ListAreaAtuacao } from '~/lib/repositories/areasAtuacaoRepository';
import { AreaAtuacaoSection } from './AreaAtuacao/AreaAtuacao';

export default function Home() {
  const { state } = useAuthState();
  const [linksInicio, setLinksInicio] = useState<Array<LinksInicio>>([]);
  const [sectionsInicio, setSectionsInicio] = useState<Array<SectionsInicio>>([]);
  const firestore = useFirestore();
  const navigate = useNavigate();
  useEffect(() => {
    async function homeConfig() {
      await ListLinksInicio().then((links) => {
        toggle();
        setLinksInicio(links);
      });
    }
    homeConfig();
  }, []);

  function CardLink({ imagem }: LinksInicio) {
    return (
      <Paper
        shadow="md"
        p="xl"
        radius="md"
        style={{ backgroundImage: `url(${imagem})` }}
        className={classes.card}
      ></Paper>
    );
  }

  const slides = linksInicio.map((item, index) => (
    <Carousel.Slide key={item.id}>
      <CardLink {...item} />
    </Carousel.Slide>
  ));
  const theme = useMantineTheme();

  const autoplay = useRef(Autoplay({ delay: 2000 }));
  const [visible, { toggle }] = useDisclosure(true);

  return (
    <>
      <LoadingOverlay
        visible={visible}
        overlayProps={{ radius: 'xl', blur: 5 }}
        loaderProps={{ children: <LoadingMain /> }}
      />
      <div className={classes.hero}>
        <Container className={classes.container} size="md">
          <Title className={classes.main_title}>Advocacia Especializada para Servidor Público</Title>
          <Text className={classes.description} size="xl" mt="xl">
            Qualidade no atendimento, de forma ágil e humanizada.
          </Text>

          <Button
            variant="gradient"
            size="xl"
            radius="xl"
            className={classes.control}
            component="a"
            href="https://api.whatsapp.com/send?phone=5531980210828&amp;text=Ol%C3%A1,%20como%20vai?%20Vim%20do%20seu%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20seus%20servi%C3%A7os%20de%20advocacia"
          >
            Clique aqui e fale com um advogado especializado
          </Button>
          <br />
          <Text className={classes.description} size="xl" mt="xl">
            Atendimento 100% online no WhatsApp, em todo Brasil.
          </Text>
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
      <AreaAtuacaoSection />
      <FooterApp />
    </>
  );
}
