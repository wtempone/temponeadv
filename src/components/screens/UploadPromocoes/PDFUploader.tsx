import { useState } from 'react';
import { FileInput, Progress, Button, Text, Alert } from '@mantine/core';
import { extractStructuredLinesFromPDF } from './ExtractTextFromPDF';
import { parseTable } from './ParseTable';
import { saveToFirestorePromocaoDO } from '~/lib/repositories/promocoesDORepository';
import { extractTextWithOCR } from './ExtractTextWithOCR';
export default function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    setStatus('Iniciando OCR...');

    try {
      const lines = await extractTextWithOCR(file, setProgress, setStatus);

      setStatus('Extraindo dados...');
      const records = parseTable(lines);

      setStatus('Gravando no Firestore...');
      await saveToFirestorePromocaoDO(records, setProgress);

      setStatus('Concluído!');
    } catch (error) {
      console.error(error);
      setStatus('Erro durante o processamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isProcessing && (
        <Alert color="yellow" title="Atenção" mb="md">
          O processamento está em andamento. Não feche ou atualize esta página.
        </Alert>
      )}

      <FileInput label="Arquivo PDF" accept=".pdf" onChange={setFile} disabled={isProcessing} />

      <Button onClick={handleProcess} disabled={!file || isProcessing} mt="sm">
        Processar
      </Button>

      <Progress value={progress} mt="md" />
      <Text mt="sm">{status}</Text>
    </>
  );
}
