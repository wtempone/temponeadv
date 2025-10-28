export function parseTable(lines: string[]): any[] {
  debugger;
  return lines
    .filter((line) => /\d{6,}/.test(line))
    .map((line) => {
      const parts = line.split(/\s{2,}/);
      return {
        sre: parts[0],
        nome: parts[1],
        masp: parts[2],
        numeroAdm: parts[3],
        carreira: parts[4],
        nivelAtual: parts[5],
        grauAtual: parts[6],
        novoNivel: parts[7],
        novoGrau: parts[8],
        vigencia: parts[9],
      };
    });
}
