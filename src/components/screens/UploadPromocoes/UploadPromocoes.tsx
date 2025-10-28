import { Container, Title } from '@mantine/core';
import PDFUploader from './PDFUploader';

export function UploadPromocoes() {
  return (
    <Container size="sm" pt="xl">
      <Title order={2}>Importar Promoções</Title>
      <PDFUploader />
    </Container>
  );
}
