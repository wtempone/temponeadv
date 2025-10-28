import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractStructuredLinesFromPDF(file: File, setProgress: (n: number) => void): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const linesByPage: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as any[];

    // Agrupar por posição vertical (y)
    const lineMap: Record<number, string[]> = {};

    items.forEach((item) => {
      const y = Math.floor(item.transform[5]); // posição vertical
      if (!lineMap[y]) lineMap[y] = [];
      lineMap[y].push(item.str);
    });

    // Ordenar linhas de cima para baixo
    const sortedY = Object.keys(lineMap)
      .map(Number)
      .sort((a, b) => b - a);

    const pageLines = sortedY.map((y) => lineMap[y].join(' ').trim());
    linesByPage.push(...pageLines);

    setProgress(Math.round((i / pdf.numPages) * 50));
  }

  return linesByPage;
}
