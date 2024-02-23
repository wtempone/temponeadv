import { addDoc, collection, doc, getDoc, setDoc, query, getDocs, Timestamp, where } from 'firebase/firestore';
import { useFirestore } from '../firebase';
import { Solution } from 'igc-xc-score';
import { GetUserData, UserData, GliderSettings, DefineUserData } from './userDataRepository';
import IGCParser from 'igc-parser';
import dayjs from 'dayjs';
import { DateCompact, fullNamedDateString, millisecondsToTime, tsFBToDate, getDayDates } from '~/components/shared/helpers';
import { Cartesian3, JulianDate, SampledPositionProperty, VelocityVectorProperty } from 'cesium';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useStorage } from '~/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

export interface Propertie {
  interval: string;
  number: number;
}
export interface FlightPoints {
  gpsAltitude: number;
  latitude: number;
  longitude: number
  pressureAltitude: number;
  timestamp: number;
}
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
  photoURL: string | null;
  trackLogData: TrackLogData | null;
  userData: UserData | null;
  description: string | null;
  place: string | null;
}

export interface TrackLogData {
  id: string;
  userId: string;
  flightPoints: Array<FlightPoints>;
  velocityProperties: Array<Propertie>;
  gliderURL: string | null;
  ascProperties: Array<Propertie>;
}
function reduzQuantidadedePontos(pontos: IGCParser.BRecord[], quantidade: number) {
  const pontosFiltrados = pontos.filter((ponto, index, array) => {
    return index % quantidade === 0;
  });
  return pontosFiltrados;
}

function calculaVelocidades(pontos: IGCParser.BRecord[]) {
  const position = new SampledPositionProperty();

  const velocityVectorProperty = new VelocityVectorProperty(
    position,
    false
  );

  for (let i = 0; i < pontos.length; i++) {
    const ponto = pontos[i];
    const time = JulianDate.fromDate(new Date(ponto.timestamp!));
    const location = Cartesian3.fromDegrees(ponto.longitude, ponto.latitude, ponto.gpsAltitude!);
    position.addSample(time, location);
  }

  const velocityProperties: Array<Propertie> = [];

  for (let i = 0; i < pontos.length; i++) {
    const ponto = pontos[i];
    const velocityVector = new Cartesian3();
    const time = JulianDate.fromDate(new Date(ponto.timestamp!));
    velocityVectorProperty.getValue(time, velocityVector);
    const metersPerSecond = Cartesian3.magnitude(velocityVector);
    const kmPerHour = Math.round(metersPerSecond * 3.6);
    const propertie: Propertie = { interval: time.toString(), number: Number(kmPerHour.toFixed(2)) };
    velocityProperties.push(propertie);
  }
  const positionAsc = new SampledPositionProperty();

  const ascVectorProperty = new VelocityVectorProperty(
    positionAsc,
    false
  );

  for (let i = 0; i < pontos.length; i++) {
    const ponto = pontos[i];
    const time = JulianDate.fromDate(new Date(ponto.timestamp!));
    const location = Cartesian3.fromDegrees(0, 0, ponto.gpsAltitude!);
    positionAsc.addSample(time, location);
  }

  const ascProperties: Array<Propertie> = [];;

  for (let i = 0; i < pontos.length; i++) {
    const ponto = pontos[i];
    const velocityVector = new Cartesian3();
    const time = JulianDate.fromDate(new Date(ponto.timestamp!));
    ascVectorProperty.getValue(time, velocityVector);
    let metersPerSecond = Cartesian3.magnitude(velocityVector);
    if (i > 0 && metersPerSecond !== 0) {
      if (ponto.gpsAltitude! < pontos[i - 1].gpsAltitude!) {
        metersPerSecond = -1 * metersPerSecond;
      }
    }
    const propertie: Propertie = { interval: time.toString(), number: Number(metersPerSecond.toFixed(2)) };
    ascProperties.push(propertie);
  }
  return { velocityProperties, ascProperties };
}

function eliminaVelocidadesIrrelevantes(flightPoints: IGCParser.BRecord[], velocityProperties: Array<Propertie>, ascProperties: Array<Propertie>) {
  const velocidades = velocityProperties;
  const asc = ascProperties;
  const pontosFiltrados = Array<IGCParser.BRecord>();
  const velocidadesFiltradas: Array<Propertie> = [];;
  const ascFiltradas: Array<Propertie> = [];;
  let inicio = false;
  for (let i = 0; i < flightPoints.length; i++) {
    if (velocidades[i].number > 6 && asc[i].number != 0) {
      if (inicio === false) {
        for (let j = i - 1; j >= 0; j--) {
          pontosFiltrados.push(flightPoints[i]);
          velocidadesFiltradas.push(velocidades[i]);
          ascFiltradas.push(asc[i]);
        }
        inicio = true;
      }
      pontosFiltrados.push(flightPoints[i]);
      velocidadesFiltradas.push(velocidades[i]);
      ascFiltradas.push(asc[i]);
    }
  }
  const lastPoint = pontosFiltrados.length - 1
  for (let i = lastPoint; i < flightPoints.length; i++) {
    pontosFiltrados.push(flightPoints[lastPoint]);
    velocidadesFiltradas.push(velocidades[lastPoint]);
    ascFiltradas.push(asc[lastPoint]);
  }
  return { flightPointsFiltrados: pontosFiltrados, velocidadesFiltradas, ascFiltradas };
}

function uploadBlob(path: string, file: Blob): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const storage = useStorage();
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          resolve(url);
        })
      },
    )
  });
}

const collectionTracklog = 'tracklog';
const collectionTracklogData = 'tracklogData';

export const CreateNewTrackLog = async (
  userId: string,
  gliderSettings: GliderSettings,
  model: Blob,
  flight: IGCParser.IGCFile
): Promise<TrackLog> => {

  let points = flight.fixes;
  points = reduzQuantidadedePontos(points, 3);
  const calculados = calculaVelocidades(points);
  const filtrados = eliminaVelocidadesIrrelevantes(points, calculados.velocityProperties, calculados.ascProperties);
  points = filtrados.flightPointsFiltrados;
  const velocityProperties = filtrados.velocidadesFiltradas;
  const ascProperties = filtrados.ascFiltradas;
  const altitudes = points.map((fix) => fix.gpsAltitude!);
  const maxGain = Math.max(...altitudes) - altitudes[0];
  const startDate = new Date(points[0].timestamp);
  const endDate = new Date(points[points.length - 1].timestamp);
  const duration = endDate.getTime() - startDate.getTime();
  const userData = await GetUserData(userId);
  userData!.gliderSettings = gliderSettings;
  const flightPoints:Array<FlightPoints> = points.map((fix) => {
    return {
      gpsAltitude: fix.gpsAltitude!,
      latitude: fix.latitude,
      longitude: fix.longitude,
      pressureAltitude: fix.pressureAltitude!,
      timestamp: fix.timestamp,
    };
  });
  const tracklogData: TrackLogData = {
    id: points[0].timestamp.toString(),
    userId: userId,
    flightPoints: flightPoints,
    velocityProperties: velocityProperties,
    ascProperties: ascProperties,
    gliderURL: URL.createObjectURL(model)
  };
  const tracklog: TrackLog = {
    id: flight.fixes[0].timestamp.toString(),
    userId: userId,
    data: new Date(points[0].timestamp),
    competitionClass: flight.competitionClass,
    gliderType: flight.gliderType,
    hardwareVersion: flight.hardwareVersion,
    pilot: flight.pilot,
    takeoff: new Date(points[0].timestamp),
    landing: new Date(points[points.length - 1].timestamp),
    loggerManufacturer: flight.loggerManufacturer,
    distance: 0,
    score: 0,
    duration: duration,
    maxGain: maxGain,
    photoURL: null,
    trackLogData: tracklogData,
    userData: userData!,
    description: null,
    place: null,
  };
  return tracklog;
}

// adiciona tracklog e tracklogData (coordenadas) - registro completo do tracklog
export const AddTrackLog = async (
  tracklog: TrackLog,
  model: Blob,
  usarPadrao: boolean,
  definirPadrao: boolean,
  corverPhoto: Blob,
  gliderSettings: GliderSettings,
): Promise<void> => {
  let modelPath;
  tracklog.photoURL = null;
  if (definirPadrao) {
    modelPath = await uploadBlob(`glider_default/${tracklog.userId}.gltf`, model);
    const userData = await GetUserData(tracklog.userId);
    userData!.gliderURL = modelPath!;
    userData!.gliderSettings = gliderSettings;
    await DefineUserData(userData!.id, userData!);
    tracklog.trackLogData!.gliderURL = userData!.gliderURL!;
  } else {
    if (usarPadrao) {
      const userData = await GetUserData(tracklog.userId);
      tracklog.trackLogData!.gliderURL = userData!.gliderURL!;
    } else {
      let myuuid = uuidv4();
      modelPath = await uploadBlob(`glider_customized/${myuuid}.gltf`, model);
      tracklog.trackLogData!.gliderURL = modelPath!;
    }
  }
  const tracklog_tumb = await uploadBlob(`tracklog_thumb/${tracklog.id}`, corverPhoto);
  tracklog.photoURL = tracklog_tumb!;
  const tracklogData = tracklog.trackLogData;
  tracklog.trackLogData = null;
  tracklog.userData = null;
  const firestore = useFirestore();
  const docRef = doc(firestore, collectionTracklog, tracklog.id);
  const task = setDoc(docRef, { ...tracklog });
  const docDataRef = doc(firestore, collectionTracklogData, tracklog.id);
  debugger;
  const taskData = setDoc(docDataRef, { ...tracklogData });

  return task;
};

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


