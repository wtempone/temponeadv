import {
    CollectionReference,
    DocumentData,
    collection,
    getDocs,
    query,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import { useFirestore } from "./firebase";

export interface IRepository<T> {
    get(id: string): Promise<T>;
    list(): Promise<Array<T>>;
    add(item: T): Promise<T>;
    update(id: string, item: T): Promise<T>;
    delete(id: string): void;
}


export abstract class Repository<T> implements IRepository<T> {

    protected collectionName: string;
    protected collection: CollectionReference<any>;
    protected firestore = useFirestore();

    constructor(collectionName: string) {
        this.collectionName = collectionName;
        this.collection = collection(this.firestore, this.collectionName)
    }

    get = async (id: string): Promise<T> => {
        const docRef = doc(this.firestore, this.collectionName, id)
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as T;
        }
        return undefined as T;
    }

    list = async (): Promise<Array<T>> => {
        const q = query(this.collection);
        const snapshot = await getDocs(q);
        const fetchedData: Array<T> = [];
        snapshot.forEach((doc) => {
            fetchedData.push({ id: doc.id, ...doc.data() } as T);
        })
        return fetchedData;
    };

    add = async (item: T): Promise<T> => {
        const docRef = await addDoc(this.collection, item);
        return docRef as T;
    }

    update = async (id: string, item: T): Promise<T> => {
        const docRef = doc(this.firestore, this.collectionName, id)
        const task = updateDoc(docRef, { item })
        return task as T;
    }
    delete = async (id: string) => {
        const docRef = doc(this.firestore, this.collectionName, id)
        return deleteDoc(docRef)
    }

}