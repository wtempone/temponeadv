import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useFirestore } from "../firebase";

export interface SectionsInicio {
    id: string;
    order: string;
    title: string;
    classe: string;
    text: string;
    imagem: string;
}
const collectionName = 'sections_inicio';

export const ListSectionsInicio = async (): Promise<Array<SectionsInicio>> => {
    const firestore = useFirestore();
    const colectionRef = collection(firestore, collectionName)
    const q = query(colectionRef,  orderBy("order"));
    const snapshot = await getDocs(q);
    const fetchedData: Array<SectionsInicio> = [];
    snapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() } as SectionsInicio);
    })
    return fetchedData;
};
