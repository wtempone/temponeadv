import { collection, getCountFromServer, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useFirestore } from '../firebase';
import { Repository } from '../repository';

export interface PromocaoDO {
  sre: string;
  nome: string;
  masp: string;
  numeroAdm: string;
  carreira: string;
  nivelAtual: string;
  grauAtual: string;
  novoNivel: string;
  novoGrau: string;
  vigencia: Date;
  publicacao: Date;
}

const collectionName = 'promocoes_diario_oficial';

class PromocaoDORepository extends Repository<any> {
  constructor() {
    super(collectionName);
  }

  async findByMasp(masp: string): Promise<PromocaoDO[]> {
    const firestore = useFirestore();
    const ref = collection(firestore, collectionName);

    // 🔽 Consulta com filtro e ordenação múltipla
    const q = query(ref, where('masp', '==', masp), orderBy('publicacao', 'asc'), orderBy('vigencia', 'asc'));

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const item = doc.data();
      return {
        sre: item.sre,
        nome: item.nome,
        masp: item.masp,
        numeroAdm: item.numero_adm,
        carreira: item.carreira,
        nivelAtual: item.situacao_atual_nivel,
        grauAtual: item.situacao_atual_grau,
        novoNivel: item.novo_nivel_grau_nivel,
        novoGrau: item.novo_nivel_grau_grau,
        vigencia: item.vigencia instanceof Timestamp ? item.vigencia.toDate() : new Date(item.vigencia),
        publicacao: item.publicacao instanceof Timestamp ? item.publicacao.toDate() : new Date(item.publicacao),
      };
    });
  }
}

export async function GetPromocaoDO(id: string): Promise<PromocaoDO | undefined> {
  const repository = new PromocaoDORepository();
  return await repository.get(id);
}

export async function ListPromocaoDO(): Promise<Array<PromocaoDO>> {
  const repository = new PromocaoDORepository();
  return await repository.list('masp');
}

export async function AddPromocaoDO(area: PromocaoDO): Promise<PromocaoDO> {
  const repository = new PromocaoDORepository();
  return await repository.add(area);
}

export async function UpdatePromocaoDO(id: string, area: PromocaoDO): Promise<PromocaoDO> {
  const repository = new PromocaoDORepository();
  return await repository.update(id, area);
}

export async function DeletePromocaoDO(id: string): Promise<void> {
  const repository = new PromocaoDORepository();
  return await repository.delete(id);
}

export async function saveToFirestorePromocaoDO(records: PromocaoDO[], setProgress: (n: number) => void) {
  const repository = new PromocaoDORepository();
  for (let i = 0; i < records.length; i++) {
    await repository.add(records[i]);
    setProgress(50 + Math.round((i / records.length) * 50));
  }
}

export async function SearchPromocaoDOByMasp(masp: string): Promise<PromocaoDO[]> {
  const repository = new PromocaoDORepository();
  return await repository.findByMasp(masp);
}

export async function CountPromocaoDO(): Promise<number> {
  const firestore = useFirestore();
  const ref = collection(firestore, collectionName);
  const snapshot = await getCountFromServer(ref);
  return snapshot.data().count;
}
