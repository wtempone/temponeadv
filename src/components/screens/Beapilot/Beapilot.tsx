import { List, Paper, Text, Title } from '@mantine/core';
import { LinksInicio } from '~/lib/repositories/linksInicioRepository';
import classes from './Beapilot.module.css';
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


export default function Beapilot() {

  return (
    <>
      <Paper>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h1' mb="lg">
              Seja um piloto
            </Title>
            <Text fz="md" c="dimmed">
              Busque por uma escola credenciada pela CBVL - Confederação Brasileira de Voo Livre. A AVLVA conta com  instrutores credenciados para lhe atender.
              A homologação CBVL é muito importante por garantir que o instrutor tenha cumprido requisitos fundamentais incluídos na norma da CBVL, como tempo mínimo de 5 anos de prática de voo livre, aprovação em prova teórica de Instrutor e cumprimento do código de conduta e ética da CBVL, além de outras exigências.
            </Text>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Quais as vantagens de se associar a AVLVA?
            </Title>
            <Text fz="md" c="dimmed" mt='md'>
              Com a AVLVA você estará linhado com os procedimentos fundamentais no aporendizado do voo livcre.
              A AVLVA se alinha com a metodologia de ensino da CBVL, que está aparada pelas normas de outros países do mundo onde o voo livre também é forte.
              Com a assistência de confederações que são sólidas por promoverem a segurança e o desenvolvimento do esporte, como a DHV na Alemanha, FFVL na França e USHPA nos EUA.
              E todas são associadas a uma estrutura internacional confederativa: a FAI (Federação Aeronáutica Internacional), que é a principal entidade mundial do esporte.
            </Text>
            <Text fz="md" c="dimmed" mt='md'>
              Como associado, o piloto tem muitas vantagens:
            </Text>
            <List fz="md" c="dimmed" mt='md'>
              <List.Item>
                Participa do sistema de nivelamento, percorrendo os marcos necessários para melhorar sua performance no voo livre com segurança;
              </List.Item>
              <List.Item>
                Tem a possibilidade de participar em competições regionais, nacionais e internacionais, podendo representar o Brasil no cenário mundial;
              </List.Item>
              <List.Item>
                Pode participar dos encontros nacionais de pilotos (ENPI), evento importante para o crescimento no esporte.               </List.Item>
              <List.Item>
                E, no âmbito profissional, pode buscar a homologação para ser tornar instrutor credenciado, uma garantia de qualidade para seus alunos.
              </List.Item>
              <List.Item>
                Pode voar em qualquer rampa do Brasil que esteja homologada pela CBVL
              </List.Item>
              <List.Item>
                Tem acesso as funcionalidades exclusivas do site da AVLVA como: cadastro de voos, ranking de pilotos, camera ao vivo para companhar a atividade na rampa, notícias, eventos, entre outros.
              </List.Item>
            </List>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Se voçê ainda não é um piloto, venha fazer parte da nossa comunidade
            </Title>
            <List fz="md" c="dimmed">
              <List.Item>
                Faça o cadastro no nosso site
              </List.Item>
              <List.Item>
                Efetue o pagamento da anuidade regular
              </List.Item>
              <List.Item>
                Solicite sua inscrição de aluno no curso de pilotagem de parapente
              </List.Item>
              <List.Item>
                Participe das aulas teóricas e práticas
              </List.Item>
              <List.Item>
                Ralize a prova para ingressar no nível 1
              </List.Item>
            </List>
          </div>
        </div>
        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Se voçê já é um piloto, passe por nossa reciclagem
            </Title>
            <Text fz="md" c="dimmed">
              Participe da nossa reciclagem para avaliação de suas habilidades no controle de seu equipamento e conhecimento das normas de segurança.
            </Text>
            <List fz="md" c="dimmed">
              <List.Item>
                Faça o cadastro no nosso site
              </List.Item>
              <List.Item>
                Efetue o pagamento das aulas de reciclagem
              </List.Item>
              <List.Item>
                Efetue o pagamento da anuidade regular
              </List.Item>
              <List.Item>
                Solicite sua inscrição nas aulas de reciclagem
              </List.Item>
              <List.Item>
                Participe das aulas teóricas e práticas
              </List.Item>
              <List.Item>
                Ralize a prova para ingressar no nível 1
              </List.Item>
            </List>
          </div>
        </div>

        <div className={classes.section_wrapper}>
          <div className={classes.section_body}>
            <Title size='h2' mb="lg">
              Junte-se a nós! Transformando Vidas Através do Esporte, Turismo e Cultura
            </Title>
          </div>
        </div>
      </Paper>
      <FooterApp />

    </>

  );
}