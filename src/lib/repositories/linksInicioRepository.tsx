import { collection, getDocs, query } from "firebase/firestore";
import { useFirestore } from "../firebase";

export interface LinksInicio {
    id: string;
    imagem: string;
}
const collectionName = 'links_inicio';

export const ListLinksInicio = async (): Promise<Array<LinksInicio>> => {
    const firestore = useFirestore();
    const colectionRef = collection(firestore, collectionName)
    const q = query(colectionRef);
    const snapshot = await getDocs(q);
    const fetchedData: Array<LinksInicio> = [];
    snapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data() } as LinksInicio);
    })
    return fetchedData;
};
