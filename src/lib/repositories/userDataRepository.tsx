import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '../firebase';

export interface GliderSettings {
  corPrimaria: string;
  corLinhas: string;
  corSelete: string;
  corRoupa: string;
  corCapacete: string;
  corViseira: string;
  corLuvas: string;
  corDetalhe1: string;
  corDetalhe2: string;
  corDetalhe3: string;
  corRastro: string;
  tipoRastro: string;
  gliderModel: string;
}

export interface UserData {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: Date | null;
  idade: number;
  estadoCivil: string;
  nacionalidade: string;
  sexo: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  telefoneResidencial: string;
  celular: string;
  telefoneEmergencia: string;
  email: string;
  tipoSanguineo: string;
  modalidade: string;
  inicioEsporte: Date | null;
  nivel: string;
  escola: string;
  instrutor: string;
  termoResponsabilidade: boolean;
  photoURL: string | null;
  photoBase64: string | null;
  gliderURL: string | null;
  gliderSettings: GliderSettings | null;
}

const collectionName = 'user_data';

export const DefineUserData = async (id: string, item: UserData): Promise<void> => {
  const firestore = useFirestore();
  const docRef = doc(firestore, collectionName, id);
  const task = setDoc(docRef, { ...item });
  return task;
};

export const GetUserData = async (id: string): Promise<UserData | undefined> => {
  const firestore = useFirestore();
  const docRef = doc(firestore, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  }
  return undefined;
};
