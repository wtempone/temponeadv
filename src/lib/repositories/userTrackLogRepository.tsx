import { addDoc, collection, doc, getDoc, setDoc, query, getDocs, Timestamp, where } from 'firebase/firestore';
import { useFirestore } from '../firebase';
import { Solution } from 'igc-xc-score';
import { GetUserData, UserData } from './userDataRepository';
import IGCParser from 'igc-parser';
import dayjs from 'dayjs';
import { DateCompact, fullNamedDateString, millisecondsToTime, tsFBToDate, getDayDates } from '~/components/shared/helpers';

export interface TrackLog {
  id: string;
  userId: string;
  data: Date | null;
  competitionClass: string | null;
  gliderType: string | null;
  hardwareVersion: string | null;
  pilot: string | null;
  landing: Date | null;
  takeoff: Date | null;
  loggerManufacturer: string | null;
  distance: number | null;
  score: number | null;
  duration: number | null;
  maxGain: number | null;
  trackLogData: TrackLogData | null;
  userData: UserData | null;
}

export interface TrackLogData {
  id: string;
  userId: string;
  filtered: Array<IGCParser.BRecord>;
}
const collectionTracklog = 'tracklog';
const collectionTracklogData = 'tracklogData';
// adiciona tracklog e tracklogData (coordenadas) - registro completo do tracklog
export const AddTrackLog = async (userId: string, item: Solution): Promise<void> => {
  const altitudes = item.opt.flight.filtered.map((fix) => fix.gpsAltitude!);
  const maxGain = Math.max(...altitudes) - altitudes[0];
  const startDate = new Date(item.opt.flight.filtered[0].timestamp);
  const endDate = new Date(item.opt.flight.filtered[item.opt.flight.filtered.length - 1].timestamp);
  const duration = endDate.getTime() - startDate.getTime();
  const tracklog: TrackLog = {
    id: item.opt.flight.filtered[0].timestamp.toString(),
    userId: userId,
    data: new Date(item.opt.flight.filtered[0].timestamp),
    competitionClass: item.opt.flight.competitionClass,
    gliderType: item.opt.flight.gliderType,
    hardwareVersion: item.opt.flight.hardwareVersion,
    pilot: item.opt.flight.pilot,
    takeoff: new Date(item.opt.flight.filtered[0].timestamp),
    landing: new Date(item.opt.flight.filtered[item.opt.flight.filtered.length - 1].timestamp),
    loggerManufacturer: item.opt.flight.loggerManufacturer,
    distance: item.scoreInfo?.distance!,
    score: item.scoreInfo?.score!,
    duration:
      item.opt.flight.filtered[item.opt.flight.filtered.length - 1].timestamp - item.opt.flight.filtered[0].timestamp,
    maxGain: maxGain,
    trackLogData: null,
    userData: null,
  };

  const firestore = useFirestore();
  const docRef = doc(firestore, collectionTracklog, tracklog.id);
  const task = setDoc(docRef, { ...tracklog });
  const tracklogData: TrackLogData = {
    id: item.opt.flight.fixes[0].timestamp.toString(),
    userId: userId,
    filtered: item.opt.flight.filtered,
  };
  const docDataRef = doc(firestore, collectionTracklogData, tracklog.id);
  const taskData = setDoc(docDataRef, { ...tracklogData });
  return task;
};
// obtem  somente os dados do tracklog
export const GetTrackLog = async (id: string): Promise<TrackLog | undefined> => {
  const firestore = useFirestore();
  const docRef = doc(firestore, collectionTracklog, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as TrackLog;
  }
  return undefined;
};
// obtem  somente os dados do tracklogData - coordenadas
export const GetTrackLogData = async (id: string): Promise<TrackLogData | undefined> => {
  const firestore = useFirestore();
  const docRef = doc(firestore, collectionTracklogData, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as TrackLogData;
  }
  return undefined;
};
// obtem um registro com  dados do track log, userdata e tracklogData com coordenadas - para abrir mapa com um unico tracklog
export const GetCompleteTrackLog = async (id: string): Promise<Array<any> | undefined> => {
  const firestore = useFirestore();
  const docRef = doc(firestore, collectionTracklog, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const tracklog = docSnap.data();
    const userData = await GetUserData(tracklog.userId);
    const trackLogData = await GetTrackLogData(tracklog.id);
    tracklog.userData = userData;
    tracklog.trackLogData = trackLogData;

    return [tracklog];
  }
  throw new Error(`Ocorreu um erro ao ober o registro de tracklog com o Id: ${id}`);
};
// obtem todos os registros de tracklog e userdata, agrupado por data, com estatistiacas - sem coordenadas - resultado minimo para listagem
interface returnGetTrackLogData {
  records: any;
  hasMore: boolean;
}
export const ListAllTrackLogDataUser = async (pageSize: number): Promise<returnGetTrackLogData | undefined> => {
  const firestore = useFirestore();
  const colectionRef = collection(firestore, collectionTracklog);
  try {
    const qall = query(colectionRef);
    const snapall = await getDocs(qall);

    const registrosPromises = snapall.docs.map(async (doc: any) => {
      const tracklog = doc.data() as TrackLog;
      const userData = await GetUserData(tracklog.userId);
      const registroComUserData = {
        ...tracklog,
        userData,
      };
      return registroComUserData;
    });
    const registrosComUserData = await Promise.all(registrosPromises);

    var maxEstatisticas = registrosComUserData.reduce((acc: any, registro: any) => {
      const data = DateCompact(tsFBToDate(registro.data)!);
      if (!acc[data]) {
        acc[data] = {
          date: tsFBToDate(registro.data),
          estatisticas: [
            { titulo: 'Distância', maximo: 0 },
            { titulo: 'Ganho de Altitude', maximo: 0 },
            { titulo: 'Duração', maximo: 0 },
            { titulo: 'Pontos', maximo: 0 },
          ],
        };
      }
      acc[data].estatisticas[0].maximo = Math.max(acc[data].estatisticas[0].maximo, registro.distance);
      acc[data].estatisticas[1].maximo = Math.max(acc[data].estatisticas[1].maximo, registro.maxGain);
      acc[data].estatisticas[2].maximo = Math.max(acc[data].estatisticas[2].maximo, registro.duration);
      acc[data].estatisticas[3].maximo = Math.max(acc[data].estatisticas[3].maximo, registro.score);
      return acc;
    }, []);

    var registrosPorData = registrosComUserData.reduce((acc: any, registro: any) => {
      const data = DateCompact(tsFBToDate(registro.data)!);
      if (!acc[data]) {
        acc[data] = {
          id: data,
          dataString: fullNamedDateString(tsFBToDate(registro.data)!),
          pilotos: [],
          estatisticas: [
            { titulo: 'Distância', maior: 0, menor: 0 },
            { titulo: 'Ganho de Altitude', maior: 0, menor: 0 },
            { titulo: 'Duração', maior: 0, menor: 0 },
            { titulo: 'Pontos', maior: 0, menor: 0 },
          ],
        };
      }
      acc[data].estatisticas[0].maior = maxEstatisticas[data].estatisticas[0].maximo;
      acc[data].estatisticas[0].menor = Math.min(maxEstatisticas[data].estatisticas[0].maximo, registro.distance);

      acc[data].estatisticas[1].maior = maxEstatisticas[data].estatisticas[1].maximo;
      acc[data].estatisticas[1].menor = Math.min(maxEstatisticas[data].estatisticas[1].maximo, registro.maxGain);

      acc[data].estatisticas[2].maior = maxEstatisticas[data].estatisticas[2].maximo;
      acc[data].estatisticas[2].menor = Math.min(maxEstatisticas[data].estatisticas[2].maximo, registro.duration);

      acc[data].estatisticas[3].maior = maxEstatisticas[data].estatisticas[3].maximo;
      acc[data].estatisticas[3].menor = Math.min(maxEstatisticas[data].estatisticas[3].maximo, registro.score);

      acc[data].pilotos.push({
        id: registro.userId,
        nome: registro.userData.nome,
        foto: registro.userData.photoURL,
      });

      return acc;
    }, []);

    registrosPorData.forEach((item: any) => {
      item.estatisticas[0].maior = `${item.estatisticas[0].maior} km`;
      item.estatisticas[0].menor = `${item.estatisticas[0].menor} km`;
      item.estatisticas[1].maior = `${item.estatisticas[1].maior} m`;
      item.estatisticas[1].menor = `${item.estatisticas[1].menor} m`;
      item.estatisticas[2].maior = millisecondsToTime(item.estatisticas[2].maior);
      item.estatisticas[2].menor = millisecondsToTime(item.estatisticas[2].menor);
    });

    return { records: registrosPorData, hasMore: registrosPorData.length === pageSize - 1 };
  } catch (error) {
    console.error('Erro ao obter registros:', error);
  }
};
// obtem todos os dados do tracklog, dados do usuario por data - para listagem individual sem estatisticas
export const ListTrackLogUserData = async (data: Date) => {
  const firestore = useFirestore();
  const { startDate, endDate } = getDayDates(data);
  const colectionRef = collection(firestore, collectionTracklog);
  try {
    const qall = query(colectionRef, where('data', '>=', startDate), where('data', '<=', endDate));
    const snapall = await getDocs(qall);

    const registrosPromises = snapall.docs.map(async (doc: any) => {

      const tracklogData = doc.data() as TrackLog;

      const userData = await GetUserData(tracklogData.userId);
      const registroComUserData = {
        ...tracklogData,
        userData,
      };
      return registroComUserData;
    });
    const registrosComUserData = await Promise.all(registrosPromises);
    if (registrosComUserData.length > 0) return registrosComUserData;
    else
      throw new Error(`Ocorreu um erro ao ober os registros de tracklog para a 
        data: parametro ${data} - data de inicio: ${startDate} - data de fim: ${endDate}`);
  } catch (error) {
    throw new Error(`Nenhum registro foi obtido d tracklos para data já filtrada: parametro ${data} - data de inicio: ${startDate} - data de fim: ${endDate}`);
  }
};
// obtem todos os dados do tracklog, dados do usuario e tracklogData com coordenadas para abrir mapa do dia
export const ListTrackLogDataUserData = async (data: Date) => {
  const firestore = useFirestore();
  const { startDate, endDate } = getDayDates(data);

  const colectionRef = collection(firestore, collectionTracklog);
  try {
    const qall = query(colectionRef, where('data', '>=', startDate), where('data', '<=', endDate));
    const snapall = await getDocs(qall);

    const registrosPromises = snapall.docs.map(async (doc: any) => {
      const tracklogData = doc.data() as TrackLog;
      const userData = await GetUserData(tracklogData.userId);
      const trackLogData = await GetTrackLogData(tracklogData.id);
      const registroComUserData = {
        ...tracklogData,
        userData,
        trackLogData,
      };

      return registroComUserData;
    });
    const registrosComUserData = await Promise.all(registrosPromises);

    return registrosComUserData;
  } catch (error) {
    console.error('Erro ao obter registros:', error);
  }
};


