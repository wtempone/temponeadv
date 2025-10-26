import { Repository } from '../repository';
export interface Funcionario {
  id?: string | null;
  name: string;
  description: string;
  fotoUrl: string;
}
const collectionName = 'funcionarios';
class FuncionariosRepository extends Repository<Funcionario> {
  constructor() {
    super(collectionName);
  }
}

export async function GetFuncionario(id: string): Promise<Funcionario | undefined> {
  const repository = new FuncionariosRepository();
  return await repository.get(id);
}
export async function ListFuncionario(): Promise<Array<Funcionario>> {
  const repository = new FuncionariosRepository();
  return await repository.list('name');
}
export async function AddFuncionario(funcionario: Funcionario): Promise<Funcionario> {
  const repository = new FuncionariosRepository();
  return await repository.add(funcionario);
}
export async function UpdateFuncionario(id: string, funcionario: Funcionario): Promise<Funcionario> {
  const repository = new FuncionariosRepository();
  return await repository.update(id, funcionario);
}
export async function DeleteFuncionario(id: string): Promise<void> {
  const repository = new FuncionariosRepository();
  return await repository.delete(id);
}
