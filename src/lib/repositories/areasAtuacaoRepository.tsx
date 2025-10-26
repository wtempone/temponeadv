import { Repository } from '../repository';
export interface AreaAtuacao {
  id?: string | null;
  ordem: number;
  title: string;
  description: string;
}
const collectionName = 'areas_atuacao';
class AreasAtuacaoRepository extends Repository<AreaAtuacao> {
  constructor() {
    super(collectionName);
  }
}

export async function GetAreaAtuacao(id: string): Promise<AreaAtuacao | undefined> {
  const repository = new AreasAtuacaoRepository();
  return await repository.get(id);
}
export async function ListAreaAtuacao(): Promise<Array<AreaAtuacao>> {
  const repository = new AreasAtuacaoRepository();
  return await repository.list('ordem');
}
export async function AddAreaAtuacao(area: AreaAtuacao): Promise<AreaAtuacao> {
  const repository = new AreasAtuacaoRepository();
  return await repository.add(area);
}
export async function UpdateAreaAtuacao(id: string, area: AreaAtuacao): Promise<AreaAtuacao> {
  const repository = new AreasAtuacaoRepository();
  return await repository.update(id, area);
}
export async function DeleteAreaAtuacao(id: string): Promise<void> {
  const repository = new AreasAtuacaoRepository();
  return await repository.delete(id);
}
