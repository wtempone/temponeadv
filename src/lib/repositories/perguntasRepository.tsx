import { Repository } from '../repository';
export interface PerguntasFrequentes {
  id?: string | null;
  ordem: number;
  question: string;
  response: string;
}
const collectionName = 'perguntas_frequentes';
class AreasAtuacaoRepository extends Repository<PerguntasFrequentes> {
  constructor() {
    super(collectionName);
  }
}

export async function GetPerguntasFrequentes(id: string): Promise<PerguntasFrequentes | undefined> {
  const repository = new AreasAtuacaoRepository();
  return await repository.get(id);
}
export async function ListPerguntasFrequentes(): Promise<Array<PerguntasFrequentes>> {
  const repository = new AreasAtuacaoRepository();
  return await repository.list('ordem');
}
export async function AddPerguntasFrequentes(area: PerguntasFrequentes): Promise<PerguntasFrequentes> {
  const repository = new AreasAtuacaoRepository();
  return await repository.add(area);
}
export async function UpdatePerguntasFrequentes(id: string, area: PerguntasFrequentes): Promise<PerguntasFrequentes> {
  const repository = new AreasAtuacaoRepository();
  return await repository.update(id, area);
}
export async function DeletePerguntasFrequentes(id: string): Promise<void> {
  const repository = new AreasAtuacaoRepository();
  return await repository.delete(id);
}
