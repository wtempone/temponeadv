import { Button, Card, Center, ColorInput, Container, Group, SimpleGrid, Stack, Switch, Title } from "@mantine/core";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import classes from "./Customize.module.css";

import { BufferGeometry, Color, Material, Mesh, MeshStandardMaterial, NormalBufferAttributes, Object3DEventMap } from "three";
import { GliderSettings } from "~/lib/repositories/userDataRepository";
import { useUserData } from "~/components/contexts/UserDataContext";
import { useForm } from "@mantine/form";

export default function Customize(props:
  {
    setGliderSetings: React.Dispatch<React.SetStateAction<GliderSettings | null>>,
    setModel: React.Dispatch<React.SetStateAction<Blob | null>>,
    definirPadrao: boolean,
    setDefinirPadrao: React.Dispatch<React.SetStateAction<boolean>>,
    coresPadrao: boolean,
    setCoresPadrao: React.Dispatch<React.SetStateAction<boolean>>,
    close: () => void,
    confirm: () => void,
  }
) {
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

  const { userData } = useUserData();

  interface FormData {
    corPrimaria: string;
    corLinhas: string;
    corSelete: string;
    corRoupa: string;
    corCapacete: string;
    corViseira: string;
    corLuvas: string;
    corDetalhe1: string;
    corDetalhe2: string;
    corRastro: string;
    definirPadrao: boolean;
  }

  const form = useForm<FormData>({
    initialValues: {
      corPrimaria: userData?.gliderSettings?.corPrimaria || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      corLinhas: userData?.gliderSettings?.corLinhas || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      corSelete: userData?.gliderSettings?.corSelete || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      corRoupa: userData?.gliderSettings?.corRoupa || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      corCapacete: userData?.gliderSettings?.corCapacete || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      corViseira: userData?.gliderSettings?.corViseira || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      corLuvas: userData?.gliderSettings?.corLuvas || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      corDetalhe1: userData?.gliderSettings?.corDetalhe1 || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      corDetalhe2: userData?.gliderSettings?.corDetalhe2 || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      corRastro: userData?.gliderSettings?.corRastro || colorsArray[Math.floor(Math.random() * colorsArray.length)],
      definirPadrao: false,
    }
  });
  function MeshComponent(props: { refMesh: React.MutableRefObject<Mesh<BufferGeometry<NormalBufferAttributes>, Material | Material[], Object3DEventMap>> }) {
    const fileUrl = "/models/glider_model_sol.glb";
    const gltf = useLoader(GLTFLoader, fileUrl);
    useFrame(() => {
      updateColors();
    })
    return (
      <mesh ref={props.refMesh}>
        <primitive object={gltf.scene} />
      </mesh>
    );
  }
  const mesh = useRef<Mesh>(null!);

  const handleSubmit = async (cores: FormData) => {
    const exporter = new GLTFExporter();
    exporter.parse(mesh.current, function (gltfJson) {
      const jsonString = JSON.stringify(gltfJson);
      const model = new Blob([jsonString], { type: "application/json" });
      const gliderSetings: GliderSettings = {
        corPrimaria: form.values.corPrimaria,
        corLinhas: form.values.corLinhas,
        corSelete: form.values.corSelete,
        corRoupa: form.values.corRoupa,
        corCapacete: form.values.corCapacete,
        corViseira: form.values.corViseira,
        corLuvas: form.values.corLuvas,
        corDetalhe1: form.values.corDetalhe1,
        corDetalhe2: form.values.corDetalhe2,
        corRastro: form.values.corRastro,
        tipoRastro: '',
        gliderModel: ''
      }
      if (userData && userData!.gliderSettings) {
        props.setCoresPadrao(false);
      }
      props.setGliderSetings(gliderSetings);
      props.setModel(model);
      props.confirm();

    }, function (erro) {
      console.log('error', erro)
    });
  }
  function updateColors() {
    mesh.current.children[0].children[0].children.forEach((child, index) => {
      const part = child as Mesh;
      const material = part.material as MeshStandardMaterial;
      switch (material.name) {
        case 'Primaria':
          material.color = new Color(form.values.corPrimaria);
          break;
        case 'Detalhe1':
          material.color = new Color(form.values.corDetalhe1);
          break;
        case 'Detalhe2':
          material.color = new Color(form.values.corDetalhe2);
          break;
        case 'Linhas':
          material.color = new Color(form.values.corLinhas);
          break;
        case 'Selete':
          material.color = new Color(form.values.corSelete);
          break;
        case 'Roupa':
          material.color = new Color(form.values.corRoupa);
          break;
        case 'Capacete':
          material.color = new Color(form.values.corCapacete);
          break;
        case 'Viseira':
          material.color = new Color(form.values.corViseira);
          break;
        case 'Luvas':
          material.color = new Color(form.values.corLuvas);
          break;
      }
    });
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
                <Canvas>
                  <OrbitControls />
                  <ambientLight intensity={Math.PI / 2} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                  <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
                  <MeshComponent refMesh={mesh} />
                </Canvas>
              </Card>
            </Group>
            <Group gap={0}>
              <Card withBorder padding="xs" radius="md">
                <Stack gap={0}>
                  <form onSubmit={form.onSubmit((cores) => {
                    handleSubmit(cores as FormData);
                  })}>
                    <Title size='h6'> Cor da Asa</Title>
                    <SimpleGrid spacing="xs" verticalSpacing="xs" cols={2} >
                      <ColorInput size="xs" required label="Primaria" value={form.values.corPrimaria} onChange={(event) => form.setFieldValue('corPrimaria', event)} disallowInput />
                      <ColorInput size="xs" required label="Detalhe 1" value={form.values.corDetalhe1} onChange={(event) => form.setFieldValue('corDetalhe1', event)} disallowInput />
                      <ColorInput size="xs" required label="Detalhe 2" value={form.values.corDetalhe2} onChange={(event) => form.setFieldValue('corDetalhe2', event)} disallowInput />
                      <ColorInput size="xs" required label="Linhas" value={form.values.corLinhas} onChange={(event) => form.setFieldValue('corLinhas', event)} disallowInput />
                    </SimpleGrid>
                    <Title size='h6' mt='xs'>Selete</Title>
                    <SimpleGrid spacing="xs" verticalSpacing="xs" cols={2} >
                      <ColorInput size="xs" required label="Selete" value={form.values.corSelete} onChange={(event) => form.setFieldValue('corSelete', event)} disallowInput />
                    </SimpleGrid>
                    <Title size='h6' mt='xs'> Corpo</Title>
                    <SimpleGrid spacing="xs" verticalSpacing="xs" cols={2} >
                      <ColorInput size="xs" required label="Roupa" value={form.values.corRoupa} onChange={(event) => form.setFieldValue('corRoupa', event)} disallowInput />
                      <ColorInput size="xs" required label="Capacete" value={form.values.corCapacete} onChange={(event) => form.setFieldValue('corCapacete', event)} disallowInput />
                      <ColorInput size="xs" required label="Viseira" value={form.values.corViseira} onChange={(event) => form.setFieldValue('corViseira', event)} disallowInput />
                      <ColorInput size="xs" required label="Luvas" value={form.values.corLuvas} onChange={(event) => form.setFieldValue('corLuvas', event)} disallowInput />
                    </SimpleGrid>
                    <Title size='h6' mt='xs'> Rastro</Title>
                    <SimpleGrid spacing="xs" verticalSpacing="xs" cols={2} >
                      <ColorInput size="xs" required label="Cor Rastro" value={form.values.corRastro} onChange={(event) => form.setFieldValue('corRastro', event)} disallowInput />
                    </SimpleGrid>
                    <Group justify="end" wrap="nowrap" m='md'>
                      <Switch
                        className={classes.switch}
                        label="Definir como padrão"
                        labelPosition="left"
                        size="md"
                        checked={form.values.definirPadrao}
                        onChange={(event) => form.setFieldValue('definirPadrao', event.target.checked)}
                      />
                    </Group>
                    <Center>
                      <Button size="md" radius="xl" m='sm' onClick={props.close} variant="default">Voltar</Button>
                      <Button size="md" radius="xl" m='sm' type="submit" >Avançar</Button>
                    </Center>
                  </form>
                </Stack>
              </Card>
            </Group>
          </SimpleGrid >
        </Center>
      </Container >
    </>
  );
}