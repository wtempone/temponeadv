import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractTextWithOCR(
  file: File,
  setProgress: (n: number) => void,
  setStatus: (msg: string) => void,
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const lines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    setStatus(`Processando página ${i} de ${pdf.numPages}...`);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;

    const imageDataUrl = canvas.toDataURL('image/png');

    const result = await Tesseract.recognize(imageDataUrl, 'por', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const base = ((i - 1) / pdf.numPages) * 100;
          const pageProgress = m.progress || 0;
          setProgress(Math.round(base + pageProgress * (100 / pdf.numPages)));
        }
      },
    });

    const pageText = result.data.text;
    lines.push(
      ...pageText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l),
    );
  }

  return lines;
}
