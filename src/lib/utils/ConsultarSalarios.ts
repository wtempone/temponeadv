import { TabelaSalarialRepository } from '~/lib/repositories/tabelaSalarialRepository';

export async function consultarSalario(
  data: Date,
  carga: number,
  siglaCarreira: string,
  nivel: number,
  grau: string,
): Promise<number | { erro: string }> {
  const repo = new TabelaSalarialRepository();

  const vigencias = await repo.getVigencias();
  const vigencia = vigencias.find((v) => data >= v.dataInicial && data <= v.dataFinal);
  if (!vigencia) return { erro: 'Vigência não encontrada para a data informada.' };

  const cargas = await repo.getCargas(vigencia.id!, siglaCarreira);
  const cargaHoraria = cargas.find((c) => c.horasPorSemana === carga);
  if (!cargaHoraria) return { erro: 'Carga horária não encontrada na vigência.' };

  const carreiras = await repo.getCarreiras(vigencia.id!);
  const carreira = carreiras.find((c) => c.sigla === siglaCarreira);
  if (!carreira) return { erro: 'Carreira não encontrada na carga horária.' };

  const niveis = await repo.getNiveis(vigencia.id!, cargaHoraria.id!, carreira.id!);
  const nivelObj = niveis.find((n) => n.nivel === nivel);
  if (!nivelObj) return { erro: 'Nível não encontrado na carreira.' };

  const graus = await repo.getGraus(vigencia.id!, cargaHoraria.id!, carreira.id!, nivelObj.id!);
  const grauObj = graus.find((g) => g.grau === grau);
  if (!grauObj) return { erro: 'Grau não encontrado no nível.' };

  return grauObj.salario;
}
