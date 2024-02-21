import { Timestamp, collection, getDocs, limit, orderBy, query, startAfter } from "firebase/firestore";
import { useFirestore } from "../firebase";
import dayjs from "dayjs";
export interface TesteVoo {
    id: string;
    data: Date;
    maior_altitude: number;
    maior_distancia: number;
    melhor_pontuacao: number;
    pilotos: [
        {
            id: string;
            nome: string;
            foto: string;
        }
    ]
}

export interface TesteVooFirst {
    count: number;
    itens: Array<TesteVoo>;
}
const collectionName = 'testeVoo';

export const GetFirst = async () : Promise<TesteVooFirst> => {
    const firestore = useFirestore();
    const colectionRef = collection(firestore, collectionName)
    const qall = query(colectionRef);
    const snapall = await getDocs(qall);
    const qfirst = query(colectionRef, orderBy('data', 'desc'), limit(10));
    const snapshot = await getDocs(qfirst);
    const fetchedData: Array<TesteVoo> = [];
    snapshot.forEach((doc) => {
        const parseDoc = { id: doc.id, ...doc.data() } as TesteVoo;
        fetchedData.push(parseDoc);
    })
    return {count: snapall.size, itens: fetchedData};
};


export const GetNext = async (last: any) : Promise<Array<TesteVoo>> => {
    const firestore = useFirestore();
    const colectionRef = collection(firestore, collectionName)
    const next = query(colectionRef, orderBy('data', 'desc'), startAfter(last), limit(10));
    const snapshot = await getDocs(next);
    const fetchedData: Array<TesteVoo> = [];
    snapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() } as TesteVoo);
    })
    return  fetchedData;
};

