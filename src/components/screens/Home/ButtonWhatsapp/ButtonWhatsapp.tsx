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
import classes from './ButtonWhatsapp.module.css';

export default function ButtonWhatsapp() {
  return (
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
  );
}
