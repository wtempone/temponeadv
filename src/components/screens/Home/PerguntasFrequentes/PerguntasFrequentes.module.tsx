import { IconCookie, IconGauge, IconUser } from '@tabler/icons-react';
import {
  Accordion,
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core';
import classes from './PerguntasFrequentes.module.css';
import { useEffect, useState } from 'react';
import { GiInjustice } from 'react-icons/gi';
import { ListPerguntasFrequentes, PerguntasFrequentes } from '~/lib/repositories/perguntasRepository';
import { IconPlus } from '@tabler/icons-react';
export function PerguntasFrequentesSection() {
  const [perguntasFrequentes, setPerguntasFrequentes] = useState<Array<PerguntasFrequentes>>([]);
  useEffect(() => {
    async function homeConfig() {
      await ListPerguntasFrequentes().then((perguntas) => {
        setPerguntasFrequentes(perguntas);
      });
    }
    homeConfig();
  }, []);

  const perguntas = perguntasFrequentes.map((pergunta) => (
    <Accordion.Item className={classes.item} value={pergunta.ordem.toString()} key={pergunta.ordem}>
      <Accordion.Control>{pergunta.question}</Accordion.Control>
      <Accordion.Panel>{pergunta.response}</Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <>
      <div className={classes.wrapper}>
        <Container size="sm">
          <Title ta="center" className={classes.title}>
            Perguntas frequentes
          </Title>

          <Accordion
            chevronPosition="right"
            defaultValue="reset-password"
            chevronSize={26}
            variant="separated"
            disableChevronRotation
            styles={{ label: { color: 'var(--mantine-color-black)' }, item: { border: 0 } }}
            chevron={
              <ThemeIcon radius="xl" className={classes.gradient} size={26}>
                <IconPlus size={18} stroke={1.5} />
              </ThemeIcon>
            }
          >
            {perguntas}
          </Accordion>
        </Container>
      </div>
    </>
  );
}
