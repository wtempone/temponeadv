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

  const { state } = useAuthState();
  const [linksInicio, setLinksInicio] = useState<Array<LinksInicio>>([]);
  const [sectionsInicio, setSectionsInicio] = useState<Array<SectionsInicio>>([]);
  const firestore = useFirestore();
  const navigate = useNavigate();
  useEffect(() => {
    async function homeConfig() {
      await ListLinksInicio().then((links)=>{
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
      <LoadingOverlay visible={visible}  overlayProps={{ radius: 'xl', blur: 5 }} loaderProps={{ children: <LoadingMain/> }} />
      <div className={classes.hero}>
        <Container className={classes.container} size="md">
          <Title className={classes.main_title}>
            Seja Bem-Vindo à AVLVA
            Transformando Vidas, Celebrando Culturas!</Title>
          <Text className={classes.description} size="xl" mt="xl">
            Faça parte da maior comunidade de esportes de aventura do Vale do Aço
          </Text>

          <Button variant="gradient" size="xl" radius="xl" className={classes.control}
            component={Link}
            to='/login'>
            Entrar
          </Button>
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
              A AVLVA, Associação de Voo Livre do Vale do Aço, é uma entidade comprometida com o desenvolvimento integral da região. Fundada em 2007, tem como propósito incentivar, promover e refletir sobre todas as modalidades esportivas da região, fortalecer o turismo em suas diversas vertentes e valorizar, divulgar e fortalecer a rica cultura do Vale do Aço.
            </Text>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Nossos Principais Objetivos
            </Title>
            <List fz="md" c="dimmed">
              <List.Item>
                Organização de eventos esportivos, turísticos, culturais e projetos de inclusão social.
              </List.Item>
              <List.Item>
                Realização de pesquisas sobre esportes e cultura.
              </List.Item>
              <List.Item>
                Experimentação e aprofundamento das questões relacionadas à prática de esportes radicais, preservação do meio ambiente e patrimônio cultural da região.
              </List.Item>
              <List.Item>
                Realização de oficinas, cursos livres e outras atividades relacionadas a esportes, cultura e turismo.
              </List.Item>
              <List.Item>
                Elaboração e realização de projetos para profissionais e amadores nas áreas de esportes, cultura e turismo.
              </List.Item>
              <List.Item>
                Promoção da integração artística social dos diferentes públicos e necessidades regionais.
              </List.Item>
              <List.Item>
                Realização de projetos audiovisuais e cinema, pesquisa histórica, cultural, étnica e discussão de gêneros.
              </List.Item>
            </List>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Nossa Estrutura
            </Title>
            <Text fz="md" c="dimmed">
              A AVLVA é composta pela Assembleia Geral, Diretoria, Conselho Fiscal e Associados. A Assembleia Geral, órgão soberano, se reúne regularmente para discutir assuntos de interesse geral, incluindo eleições da Diretoria, aprovação de contas e relatórios de atividades.            </Text>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Participe da Mudança
            </Title>
            <Text fz="md" c="dimmed">
              Seja parte ativa da AVLVA! Torne-se um associado, participe das assembleias e contribua para o fortalecimento do esporte, turismo e cultura em nossa região.            
              </Text>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Junte-se a nós! AVLVA - Transformando Vidas Através do Esporte, Turismo e Cultura
            </Title>
          </div>
        </div>
      </Paper>
      <FooterApp />

    </>

  );
}