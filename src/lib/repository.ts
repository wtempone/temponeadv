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
  orderBy,
  setDoc,
  where,
  WhereFilterOp,
} from 'firebase/firestore';
import { useFirestore } from './firebase';

export interface IRepository<T> {
  get(id: string): Promise<T>;
  list(order: string): Promise<Array<T>>;
  add(item: T): Promise<T>;
  update(id: string, item: T): Promise<T>;
  delete(id: string): void;
  query(field: string, operator: WhereFilterOp, value: any): Promise<Array<T>>;
}

export abstract class Repository<T> implements IRepository<T> {
  protected collectionName: string;
  protected collection: CollectionReference<any>;
  protected firestore = useFirestore();

  constructor(collectionName: string) {
    this.collectionName = collectionName;
    this.collection = collection(this.firestore, this.collectionName);
  }

  get = async (id: string): Promise<T> => {
    const docRef = doc(this.firestore, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as T;
    }
    return undefined as T;
  };

  list = async (order: string): Promise<Array<T>> => {
    const q = query(this.collection, orderBy(order));
    const snapshot = await getDocs(q);
    const fetchedData: Array<T> = [];
    snapshot.forEach((doc) => {
      fetchedData.push({ id: doc.id, ...doc.data() } as T);
      console.log(doc.id, ' => ', doc.data());
    });
    return fetchedData;
  };

  add = async (item: T): Promise<T> => {
    const docRef = await addDoc(this.collection, item);
    return docRef as T;
  };

  update = async (id: string, item: T): Promise<T> => {
    const docRef = doc(this.firestore, this.collectionName, id);
    const task = setDoc(docRef, item as DocumentData);
    return task as T;
  };

  delete = async (id: string) => {
    const docRef = doc(this.firestore, this.collectionName, id);
    return deleteDoc(docRef);
  };

  query = async (field: string, operator: WhereFilterOp, value: any): Promise<Array<T>> => {
    const q = query(this.collection, where(field, operator, value));
    const snapshot = await getDocs(q);
    const results: Array<T> = [];
    snapshot.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...docSnap.data() } as T);
    });
    return results;
  };
}
