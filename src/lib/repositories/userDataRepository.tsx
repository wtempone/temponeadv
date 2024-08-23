import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '../firebase';
import { uploadBase64 } from '~/components/shared/UtilsStorage';

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
  gliderModel: number;
}

export interface SceneOptions {
  apelido: string;
  corFundoLegenda: string;
  corTextoLegenda: string;
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
  gliderModel: number;
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

export const ChangeFotoUserData = async (id: string, foto: string): Promise<UserData | undefined> => {
  const user = await GetUserData(id);
  if (!user) {
    return undefined;
  }
  const urlFoto = await uploadBase64(`user_images/${user.id}`, foto);
  if (urlFoto) {
    user.photoURL = urlFoto;
    await DefineUserData(id, user);
    return user;
  }
  return undefined;
};


export const ChangeGliderSettings = async (id: string, gliderSetings: GliderSettings): Promise<UserData | undefined> => {
  const user = await GetUserData(id);
  if (!user) {
    return undefined;
  }
  if (gliderSetings) {
    user.gliderSettings = gliderSetings;
    await DefineUserData(id, user);
    return user;
  }
  return undefined;
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
