// ~/lib/repositories/tabelaSalarialRepository.ts
import { collection, doc, getDocs, addDoc, deleteDoc, Timestamp, setDoc } from 'firebase/firestore';
import { useFirestore } from '../firebase';

export interface Vigencia {
  id?: string;
  descricao: string;
  dataInicial: Date;
  dataFinal: Date;
}

export interface Carreira {
  id?: string;
  nome: string;
  sigla: string;
}

export interface CargaHoraria {
  id?: string;
  descricao: string;
  horasPorSemana: number;
}

export interface Nivel {
  id?: string;
  nivel: number;
  descricao: string;
}

export interface Grau {
  id?: string;
  grau: string;
  salario: number;
}

export class TabelaSalarialRepository {
  private db = useFirestore();

  // 🔹 VIGÊNCIA
  async getVigencias(): Promise<Vigencia[]> {
    const ref = collection(this.db, 'tabelasSalariais');
    const snapshot = await getDocs(ref);
    const vigencias = snapshot.docs.map((d) => ({
      id: d.id,
      descricao: d.data().descricao,
      dataInicial: d.data().dataInicial.toDate(),
      dataFinal: d.data().dataFinal.toDate(),
    })) as Vigencia[];

    // ordenar por dataInicial asc
    vigencias.sort((a, b) => a.dataInicial.getTime() - b.dataInicial.getTime());

    return vigencias;
  }

  async addVigencia(vigencia: Vigencia) {
    const ref = collection(this.db, 'tabelasSalariais');
    await addDoc(ref, {
      descricao: vigencia.descricao,
      dataInicial: Timestamp.fromDate(vigencia.dataInicial),
      dataFinal: Timestamp.fromDate(vigencia.dataFinal),
    });
  }

  async updateVigencia(id: string, vigencia: Vigencia) {
    const ref = doc(this.db, 'tabelasSalariais', id);
    await setDoc(ref, {
      descricao: vigencia.descricao,
      dataInicial: Timestamp.fromDate(vigencia.dataInicial),
      dataFinal: Timestamp.fromDate(vigencia.dataFinal),
    });
  }

  async deleteVigencia(id: string) {
    const ref = doc(this.db, 'tabelasSalariais', id);
    await deleteDoc(ref);
  }

  // 🔹 CARREIRA (diretamente sob vigência)
  async getCarreiras(vigenciaId: string): Promise<Carreira[]> {
    const ref = collection(this.db, `tabelasSalariais/${vigenciaId}/carreira`);
    const snapshot = await getDocs(ref);
    const carreiras = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Carreira);

    // ordenar por sigla asc (se sigla igual, por nome asc)
    carreiras.sort((a, b) => {
      const sa = String(a.sigla || '').toUpperCase();
      const sb = String(b.sigla || '').toUpperCase();
      if (sa < sb) return -1;
      if (sa > sb) return 1;
      return String(a.nome || '').localeCompare(String(b.nome || ''));
    });

    return carreiras;
  }

  async addCarreira(vigenciaId: string, carreira: Carreira) {
    const ref = collection(this.db, `tabelasSalariais/${vigenciaId}/carreira`);
    await addDoc(ref, carreira);
  }

  async updateCarreira(vigenciaId: string, carreiraId: string, carreira: Carreira) {
    const ref = doc(this.db, `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}`);
    await setDoc(ref, carreira);
  }

  async deleteCarreira(vigenciaId: string, carreiraId: string) {
    const ref = doc(this.db, `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}`);
    await deleteDoc(ref);
  }

  // 🔹 CARGA HORÁRIA (sob carreira)
  async getCargas(vigenciaId: string, carreiraId: string): Promise<CargaHoraria[]> {
    const ref = collection(this.db, `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal`);
    const snapshot = await getDocs(ref);
    const cargas = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as CargaHoraria);

    // ordenar por horasPorSemana asc (se igual, por descricao asc)
    cargas.sort((a, b) => {
      const ha = Number(a.horasPorSemana ?? 0);
      const hb = Number(b.horasPorSemana ?? 0);
      if (ha !== hb) return ha - hb;
      return String(a.descricao || '').localeCompare(String(b.descricao || ''));
    });

    return cargas;
  }

  async addCarga(vigenciaId: string, carreiraId: string, carga: CargaHoraria) {
    const ref = collection(this.db, `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal`);
    await addDoc(ref, carga);
  }

  async updateCarga(vigenciaId: string, carreiraId: string, cargaId: string, carga: CargaHoraria) {
    const ref = doc(this.db, `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}`);
    await setDoc(ref, carga);
  }

  async deleteCarga(vigenciaId: string, carreiraId: string, cargaId: string) {
    const ref = doc(this.db, `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}`);
    await deleteDoc(ref);
  }

  // 🔹 NÍVEL (sob carga)
  async getNiveis(vigenciaId: string, carreiraId: string, cargaId: string): Promise<Nivel[]> {
    const ref = collection(
      this.db,
      `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}/niveis`,
    );
    const snapshot = await getDocs(ref);
    const niveis = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Nivel);

    // ordenar por nivel (number) asc (se igual, por descricao asc)
    niveis.sort((a, b) => {
      const na = Number(a.nivel ?? 0);
      const nb = Number(b.nivel ?? 0);
      if (na !== nb) return na - nb;
      return String(a.descricao || '').localeCompare(String(b.descricao || ''));
    });

    return niveis;
  }

  async addNivel(vigenciaId: string, carreiraId: string, cargaId: string, nivel: Nivel) {
    const ref = collection(
      this.db,
      `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}/niveis`,
    );
    await addDoc(ref, nivel);
  }

  async updateNivel(vigenciaId: string, carreiraId: string, cargaId: string, nivelId: string, nivel: Nivel) {
    const ref = doc(
      this.db,
      `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}/niveis/${nivelId}`,
    );
    await setDoc(ref, nivel);
  }

  async deleteNivel(vigenciaId: string, carreiraId: string, cargaId: string, nivelId: string) {
    const ref = doc(
      this.db,
      `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}/niveis/${nivelId}`,
    );
    await deleteDoc(ref);
  }

  // 🔹 GRAU (sob nível)
  async getGraus(vigenciaId: string, carreiraId: string, cargaId: string, nivelId: string): Promise<Grau[]> {
    const ref = collection(
      this.db,
      `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}/niveis/${nivelId}/graus`,
    );
    const snapshot = await getDocs(ref);
    const graus = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Grau);

    // ordenar por grau asc (alfabético). caso grau contenha letra seguida de número, localeCompare mantém ordem legível.
    graus.sort((a, b) => String(a.grau || '').localeCompare(String(b.grau || '')));

    return graus;
  }

  async addGrau(vigenciaId: string, carreiraId: string, cargaId: string, nivelId: string, grau: Grau) {
    const ref = collection(
      this.db,
      `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}/niveis/${nivelId}/graus`,
    );
    await addDoc(ref, grau);
  }

  async updateGrau(
    vigenciaId: string,
    carreiraId: string,
    cargaId: string,
    nivelId: string,
    grauId: string,
    grau: Grau,
  ) {
    const ref = doc(
      this.db,
      `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}/niveis/${nivelId}/graus/${grauId}`,
    );
    await setDoc(ref, grau);
  }

  async deleteGrau(vigenciaId: string, carreiraId: string, cargaId: string, nivelId: string, grauId: string) {
    const ref = doc(
      this.db,
      `tabelasSalariais/${vigenciaId}/carreira/${carreiraId}/cargaHorariaSemanal/${cargaId}/niveis/${nivelId}/graus/${grauId}`,
    );
    await deleteDoc(ref);
  }
}

// -----------------------------------------------------------------------------
// Utilitários locais que usam o repositório, alinhados à nova hierarquia:
// -----------------------------------------------------------------------------

export async function encontrarVigenciaPorData(data: Date): Promise<Vigencia | null> {
  const repo = new TabelaSalarialRepository();
  const vigencias = await repo.getVigencias();
  return vigencias.find((v) => data >= v.dataInicial && data <= v.dataFinal) ?? null;
}

/**
 * lista cargas para uso em Select — requer vigênciaId e carreiraId
 */
export async function listarCargasParaSelect(
  vigenciaId: string,
  carreiraId: string,
): Promise<{ value: string; label: string }[]> {
  const repo = new TabelaSalarialRepository();
  const cargas = await repo.getCargas(vigenciaId, carreiraId);

  // garantir ordenação por horasPorSemana asc, já aplicada em getCargas; ordenar por label como redundância
  const items = cargas
    .map((carga) => ({
      value: carga.id!,
      label: `${carga.descricao} (${carga.horasPorSemana}h/semana)`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return items;
}

/**
 * Consulta salário seguindo a hierarquia:
 * vigência -> carreira -> carga -> nível -> grau
 *
 * Retorna número ou { erro: string } com indicação onde parou.
 */
export async function consultarSalario(
  data: Date,
  siglaCarreira: string,
  cargaHorasPorSemana: number,
  nivel: number,
  grau: string,
): Promise<number | { erro: string }> {
  const repo = new TabelaSalarialRepository();

  // 1. Vigência (vigencias já ordenadas por dataInicial asc)
  const vigencias = await repo.getVigencias();
  const vigencia = vigencias.find((v) => data >= v.dataInicial && data <= v.dataFinal);
  if (!vigencia) return { erro: 'Vigência não encontrada para a data informada.' };

  // 2. Carreira dentro da vigência (carreiras já ordenadas por sigla asc)
  const carreiras = await repo.getCarreiras(vigencia.id!);
  const carreira = carreiras.find((c) => String(c.sigla) === String(siglaCarreira));
  if (!carreira) return { erro: 'Carreira não encontrada na vigência.' };

  // 3. Carga dentro da carreira (cargas já ordenadas por horasPorSemana asc)
  const cargas = await repo.getCargas(vigencia.id!, carreira.id!);
  const carga = cargas.find((c) => Number(c.horasPorSemana) === Number(cargaHorasPorSemana));
  if (!carga) return { erro: 'Carga horária não encontrada para a carreira na vigência.' };

  // 4. Nível dentro da carga (niveis já ordenados por nivel asc)
  const niveis = await repo.getNiveis(vigencia.id!, carreira.id!, carga.id!);
  const nivelObj = niveis.find((n) => Number(n.nivel) === Number(nivel));
  if (!nivelObj) return { erro: 'Nível não encontrado na carga da carreira.' };

  // 5. Grau dentro do nível (graus já ordenados por grau asc)
  const graus = await repo.getGraus(vigencia.id!, carreira.id!, carga.id!, nivelObj.id!);
  const grauObj = graus.find((g) => String(g.grau) === String(grau));
  if (!grauObj) return { erro: 'Grau não encontrado no nível.' };

  return grauObj.salario;
}
