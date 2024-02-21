import { Text, ColorInput, Container, Group, SegmentedControl, SimpleGrid, Button, Title, Center, Card, Paper, Stack, Switch } from "@mantine/core";
import classes from "./Customize.module.css";
import { useState } from "react";
import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { StorageReference, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useStorage } from '~/lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { notifications } from '@mantine/notifications';

import { Material, Mesh, MeshStandardMaterial, Color, BufferGeometry, NormalBufferAttributes, Object3DEventMap } from "three";
import { useAuthState } from "~/components/contexts/UserContext";
import { useUserData } from "~/components/contexts/UserDataContext";
export default function Customize() {
  let colorsArray = [
    "#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177", "#0d5ac1",
    "#f205e6", "#1c0365", "#14a9ad", "#4ca2f9", "#a4e43f", "#d298e2", "#6119d0",
    "#d2737d", "#c0a43c", "#f2510e", "#651be6", "#79806e", "#61da5e", "#cd2f00",
    "#9348af", "#01ac53", "#c5a4fb", "#996635", "#b11573", "#4bb473", "#75d89e",
    "#2f3f94", "#2f7b99", "#da967d", "#34891f", "#b0d87b", "#ca4751", "#7e50a8",
    "#c4d647", "#e0eeb8", "#11dec1", "#289812", "#566ca0", "#ffdbe1", "#2f1179",
    "#935b6d", "#916988", "#513d98", "#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
    "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
    "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
    "#5be4f0", "#57c4d8", "#a4d17a", "#225b8c", "#be608b", "#96b00c", "#088baf",
    "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
    "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
    "#fb21a3", "#51aed9", "#5bb32d", "#807fbc", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271c", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271c", "#9cb64a", "#996c48", "#9ab9b7",
    "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
    "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
    "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18c", "#dd93fd", "#3f8473", "#e7dbce",
    "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
    "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
    "#32d5d6", "#17232c", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
    "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
    "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
    "#28fcfd", "#bb09bc", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
    "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
    "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
    "#615af0", "#4be47c", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
    "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
    "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
    "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065c",
    "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
    "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
    "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67c",
    "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
    "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
    "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca "]

  const [corPrimaria, setCorPrimaria] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [corLinhas, setCorLinhas] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [corSelete, setCorSelete] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [corRoupa, setCorRoupa] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [corCapacete, setCorCapacete] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [corViseira, setCorViseira] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [corLuvas, setCorLuvas] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [corDetalhe1, setCorDetalhe1] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [corDetalhe2, setCorDetalhe2] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [corRastro, setCorRastro] = useState(colorsArray[Math.floor(Math.random() * colorsArray.length)]);
  const [tipoRastro, setTipoRastro] = useState('sem');
  const [definirPadrao, setDefinirPadrao] = useState(true);

  function toggleDefinirPadrao() {
    setDefinirPadrao(!definirPadrao);
  }
  function MeshComponent(props: { refMesh: React.MutableRefObject<Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], Object3DEventMap>> }) {
    const fileUrl = "/models/glider_model_sol.glb";
    const gltf = useLoader(GLTFLoader, fileUrl);
    useFrame(() => {
      props.refMesh.current.children[0].children[0].children.forEach((child, index) => {
        const part = child as Mesh;
        const material = part.material as MeshStandardMaterial;
        switch (material.name) {
          case 'Primaria':
            material.color = new Color(corPrimaria);
            break;
          case 'Detalhe1':
            material.color = new Color(corDetalhe1);
            break;
          case 'Detalhe2':
            material.color = new Color(corDetalhe2);
            break;
          case 'Linhas':
            material.color = new Color(corLinhas);
            break;
          case 'Selete':
            material.color = new Color(corSelete);
            break;
          case 'Roupa':
            material.color = new Color(corRoupa);
            break;
          case 'Capacete':
            material.color = new Color(corCapacete);
            break;
          case 'Viseira':
            material.color = new Color(corViseira);
            break;
          case 'Luvas':
            material.color = new Color(corLuvas);
            break;
        }
      });
    });

    return (
      <mesh ref={props.refMesh}>
        <primitive object={gltf.scene} />
      </mesh>
    );
  }
  const mesh = useRef<Mesh>(null!);

  function save() {
    const exporter = new GLTFExporter();
    exporter.parse(mesh.current, function (gltfJson) {
      console.log(gltfJson);
      const jsonString = JSON.stringify(gltfJson);
      console.log(jsonString);
      const blob = new Blob([jsonString], { type: "application/json" });
      console.log(blob);
      uplaoadModel(blob);
    }, function (erro) {
      console.log('error', erro)
    });
  }
  const { state } = useAuthState();
  const { userData, setUserData } = useUserData();
  const [file, setFile] = useState<File | null>(null);
  const [loadForm, setLoadForm] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [progressUpload, setProgressUpload] = useState(0)
  const storage = useStorage();

  function uplaoadModel(blob: Blob) {
    //open()
    const uuid = uuidv4()
    const storageRef = ref(storage, `glider_customized_models/${uuid}.gltf`)
    const uploadTask = uploadBytesResumable(storageRef, blob)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        setIsUploading(true)
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100

        setProgressUpload(progress)

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
          console.log('File available at', url);
          // user.photoURL = url;
          // setFile(null);
          // updateFirestore(user).then(() => {
          //   setIsUploading(false)
          // });
        })
      },
    )
  }

  return (
    <>
      <Container>
        <Center p='xs'>
          <Title size='h5'> Defina suas cores</Title>
        </Center>
        <Center>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Group gap={0}>
              <Card withBorder padding={0} radius="md" className={classes.three_canvas}>
                <Canvas className='h-3xl w-3xl'>
                  <OrbitControls />
                  <ambientLight intensity={2} />
                  <MeshComponent refMesh={mesh} />
                </Canvas>
              </Card>
            </Group>
            <Group gap={0}>
              <Card withBorder padding="xs" radius="md">

                <Stack gap={0}>
                  <Title size='h6'> Cor da Asa</Title>
                  <SimpleGrid spacing="xs" verticalSpacing="xs" cols={2} >
                    <ColorInput size="xs" label="Primaria" defaultValue={corPrimaria} onChange={(value) => setCorPrimaria(value)} disallowInput />
                    <ColorInput size="xs" label="Detalhe 1" defaultValue={corDetalhe1} onChange={(value) => setCorDetalhe1(value)} disallowInput />
                    <ColorInput size="xs" label="Detalhe 2" defaultValue={corDetalhe2} onChange={(value) => setCorDetalhe2(value)} disallowInput />
                    <ColorInput size="xs" label="Linhas" defaultValue={corLinhas} onChange={(value) => setCorLinhas(value)} disallowInput />
                  </SimpleGrid>
                  <Title size='h6' mt='xs'>Selete</Title>
                  <SimpleGrid spacing="xs" verticalSpacing="xs" cols={2} >
                    <ColorInput size="xs" label="Selete" defaultValue={corSelete} onChange={(value) => setCorSelete(value)} disallowInput />
                  </SimpleGrid>
                  <Title size='h6' mt='xs'> Corpo</Title>
                  <SimpleGrid spacing="xs" verticalSpacing="xs" cols={2} >
                    <ColorInput size="xs" label="Roupa" defaultValue={corRoupa} onChange={(value) => setCorRoupa(value)} disallowInput />
                    <ColorInput size="xs" label="Capacete" defaultValue={corCapacete} onChange={(value) => setCorCapacete(value)} disallowInput />
                    <ColorInput size="xs" label="Viseira" defaultValue={corViseira} onChange={(value) => setCorViseira(value)} disallowInput />
                    <ColorInput size="xs" label="Luvas" defaultValue={corLuvas} onChange={(value) => setCorLuvas(value)} disallowInput />
                  </SimpleGrid>
                  <Title size='h6' mt='xs'> Rastro</Title>
                      <SimpleGrid spacing="xs" verticalSpacing="xs" cols={2} >
                      <ColorInput size="xs" label="Cor Rastro" defaultValue={corRastro} onChange={(value) => setCorRastro(value)} disallowInput />
                    </SimpleGrid>
                  <Group justify="end" wrap="nowrap" m='md'>
                    <Switch
                      className={classes.switch}
                      label="Definir como padrão"
                      labelPosition="left"

                      size="md"
                      checked={definirPadrao}
                      onChange={toggleDefinirPadrao}
                    />
                  </Group>
                  <Center>
                    <Button fullWidth size="md" radius="xl"  m='sm' onClick={save} >Avançar</Button>
                  </Center>
                </Stack>
              </Card>
            </Group>
          </SimpleGrid >
        </Center>
      </Container >
    </>
  );
}