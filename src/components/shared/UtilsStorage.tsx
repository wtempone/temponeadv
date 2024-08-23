import { getDownloadURL, ref, uploadBytes, uploadString, listAll, deleteObject } from 'firebase/storage';
import { useStorage } from '~/lib/firebase';

export function uploadBlob(path: string, file: Blob): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const storage = useStorage();
    const storageRef = ref(storage, path);

    uploadBytes(storageRef, file).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        resolve(url);
      })
        .catch((error) => {
          reject(error);
        });;
    }).catch((error) => {
      reject(error);
    });
  });
}

export function uploadBase64(path: string, base64: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const storage = useStorage();
    const storageRef = ref(storage, path);

    uploadString(storageRef, base64, 'data_url').then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        resolve(url);
      })
        .catch((error) => {
          reject(error);
        });
    }).catch((error) => {
      reject(error);
    });
  });
}

export function deleteTracklogFolder(id: string): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    const storage = useStorage();

    try {
      const pathPhotos = `tracklogs/${id}/fotos`;
      const storageFotosRef = ref(storage, pathPhotos);
      await listAll(storageFotosRef).then((res) => {
        res.items.forEach((itemRef) => {
          deleteObject(itemRef);
        });
      });

      const path = `tracklogs/${id}`;
      const storageRef = ref(storage, path);
      await listAll(storageRef).then((res) => {
        res.items.forEach((itemRef) => {
          deleteObject(itemRef);
        });
      })
      resolve(true);
    } catch (error) {
      reject(error);
    };
  });
}
