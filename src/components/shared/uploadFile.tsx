import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { UserData } from '~/lib/repositories/userDataRepository';
import { StorageReference, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useStorage } from '~/lib/firebase';

export default function UploadFile(props: {
    setIsUploading: (isUploading: boolean) => void,
    isUploading: boolean,
    setProgressUpload: (progressUpload: number) => void,
    progressUpload: number,
    setFile: (file: File | null) => void,
    file: File | null, userData: UserData | undefined, 
    storageRef: StorageReference,
    setUrl: (url: string) => void
  }) {

  const storage = useStorage();

  const [opened, { open, close }] = useDisclosure(false);

  const uploadFile = async () => {

    if (!props.file) {
      open()
    }
    else {
      open()
      const uploadTask = uploadBytesResumable(props.storageRef, props.file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          props.setIsUploading(true)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100

          props.setProgressUpload(progress)

          switch (snapshot.state) {
            case 'paused':
              break
            case 'running':
              break
          }
        },
        (error) => {
          notifications.show({
            color: 'red',
            title: 'Erro no upload',
            message: 'Não foi possível fazer o upload do arquivo' + error.message,
          });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            props.setFile(null);
            props.setUrl(url);
          })
        },
      )
    }
  }
  return null;
}