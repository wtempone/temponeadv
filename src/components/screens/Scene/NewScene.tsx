import { Button, Card, Center, Container, LoadingOverlay, SimpleGrid, Stack, Text, Textarea, Title } from '@mantine/core';
import axios from 'axios';
import { Cartesian3, Viewer as CesiumViewer, CzmlDataSource, ImageryLayer, JulianDate, Timeline, createGooglePhotorealistic3DTileset, createWorldTerrainAsync } from 'cesium';
import IGCParser from 'igc-parser';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CesiumComponentRef, Viewer } from 'resium';
import { useUserData } from '~/components/contexts/UserDataContext';
import { GliderSettings } from '~/lib/repositories/userDataRepository';
import { AddTrackLog, CreateNewTrackLog, TrackLog } from '~/lib/repositories/userTrackLogRepository';
import classes from './Scene.module.css';
import { DateInput, TimeInput } from '@mantine/dates';
import { LoadingMain } from '~/components/shared/Loading';
import { useDisclosure } from '@mantine/hooks';


const args = {
  timeline: true,
  animation: false,
  selectionIndicator: false,
  infoBox: false,
  geocoder: false,
  shadows: false,
  homeButton: false,
  sceneModePicker: false,
  projectionPicker: false,
  baseLayerPicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  vrButton: false,
  imageryProvider: false,
  requestRenderMode: false,
};

export default function NewScene(props: {
  gliderSettings: GliderSettings | null,
  model: Blob | null,
  flight: IGCParser.IGCFile | null,
  setTracklog: React.Dispatch<React.SetStateAction<TrackLog | null>>,
  setImagemCapa: React.Dispatch<React.SetStateAction<Blob | null>>,
  confirm: () => void,
  close: () => void,
}) {


  const ref = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [currentCzml, setCurrentCzml] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [descricao, setDescricao] = useState<string>();
  const [cenaConfigurada, setCenaConfigurada] = useState<boolean>(false);
  const [tracklog, setTracklog] = useState<TrackLog | null>(null);
  const { userData } = useUserData();

  async function createNewScene() {
    const czml = await newSceneCZML()
    setCurrentCzml(czml);
  }

  async function getLocation() {
    const logitude = props.flight!.fixes[0].longitude;
    const latitude = props.flight!.fixes[0].latitude;
    const location = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${logitude}&key=${import.meta.env.VITE_GOOGLEMAPS_APIKEY}`)
    if (location.status === 200) {
      if (location.data.results[2].formatted_address) {
        setCurrentLocation(location.data.results[2].formatted_address);
      } else if (location.data.results[1].formatted_address) {
        setCurrentLocation(location.data.results[1].formatted_address);
      } else if (location.data.results[0].formatted_address) {
        setCurrentLocation(location.data.results[0].formatted_address);
      }
    }
  }
  if (!ref.current) {
    createNewScene();
    getLocation();
  }
  useEffect(() => {
    if (ref.current?.cesiumElement && !cenaConfigurada) {
      configureScene();
    }
  }, [ref.current]);

  async function configureScene() {
    console.log('configurando cena');

    setCenaConfigurada(true);
    const viewer = ref.current!.cesiumElement;
    
    //configureGoogleTerrain(ref);
    configureTerrain();
    if (currentCzml) {

      ref.current!.cesiumElement!.scene.globe.depthTestAgainstTerrain = true;
      ref.current!.cesiumElement!.scene.globe.show = true;
      const imageryLayer = ImageryLayer.fromWorldImagery({});
      ref.current!.cesiumElement!.scene.imageryLayers.add(imageryLayer)
      const terrainProvider = await createWorldTerrainAsync();
      ref.current!.cesiumElement!.terrainProvider = terrainProvider;

      const dataSourcePromise = await CzmlDataSource.load(currentCzml);
      await viewer!.dataSources.add(dataSourcePromise);

      const trackEntity = viewer!.dataSources.get(0).entities.getById(props.flight!.fixes[0].timestamp.toString());
      await viewer!.render();
      if (trackEntity) {
        viewer!.zoomTo(trackEntity);
        viewer!.trackedEntity = trackEntity;
        viewer!.trackedEntity!.viewFrom = new Cartesian3(0, -100, 100);

        viewer!.scene.screenSpaceCameraController.enableTilt = false;
        viewer!.scene.screenSpaceCameraController.enableZoom = true;
        viewer!.scene.screenSpaceCameraController.enableLook = false;
        viewer!.scene.screenSpaceCameraController.enableTranslate = false;
        viewer!.scene.screenSpaceCameraController.enableRotate = true;
        viewer!.scene.screenSpaceCameraController.enableCollisionDetection = true;
        viewer!.scene.screenSpaceCameraController.minimumZoomDistance = 5;
        viewer!.scene.screenSpaceCameraController.maximumZoomDistance = 1200;
        toggle();
      }
    } else {
      console.log('trackEntity not found');
    }
  }
  async function configureTerrain() {
    ref.current!.cesiumElement!.scene.globe.depthTestAgainstTerrain = true;
    ref.current!.cesiumElement!.scene.globe.show = true;
    const imageryLayer = ImageryLayer.fromWorldImagery({});
    ref.current!.cesiumElement!.scene.imageryLayers.add(imageryLayer)
    const terrainProvider = await createWorldTerrainAsync();
    ref.current!.cesiumElement!.terrainProvider = terrainProvider;
  }
  
  async function configureGoogleTerrain() {
    try {
      const tileset = await createGooglePhotorealistic3DTileset(import.meta.env.VITE_GOOGLEMAPS_APIKEY, {
        skipLevelOfDetail: true,
        baseScreenSpaceError: 1024,
        skipScreenSpaceErrorFactor: 16,
        skipLevels: 1,
        immediatelyLoadDesiredLevelOfDetail: false,
        loadSiblings: false,
        cullWithChildrenBounds: true,
        showCreditsOnScreen: true,
      });
      await ref!.current!.cesiumElement!.scene.primitives.add(tileset);
    } catch (error) {
      throw error
    }
  }

  async function newSceneCZML() {
    const tracklog = await CreateNewTrackLog(
      userData?.id!,
      props.gliderSettings!,
      props.model!,
      props.flight!
    )

    if (!tracklog) return;

    setTracklog(tracklog);
    
    const lastPoints = tracklog.trackLogData!.flightPoints.length;
    const initialDateScene = JulianDate.fromDate(new Date(tracklog.trackLogData?.flightPoints[0].timestamp!));
    const endDateScene = JulianDate.fromDate(
      new Date(tracklog.trackLogData?.flightPoints[lastPoints - 1].timestamp!),
    );
    const interval = initialDateScene.toString() + '/' + endDateScene.toString();

    const clock = {
      interval: interval,
      currentTime: initialDateScene.toString(),
      multiplier: 2,
      range: 'LOOP_STOP',
      step: 'SYSTEM_CLOCK_MULTIPLIER',
    };

    const start = JulianDate.fromDate(new Date(tracklog.trackLogData?.flightPoints[0].timestamp!));
    const end = JulianDate.fromDate(
      new Date(tracklog.trackLogData?.flightPoints[tracklog.trackLogData?.flightPoints.length - 1].timestamp!),
    );
    const availability = start.toString() + '/' + end.toString();
    let flightPoints = tracklog.trackLogData!.flightPoints;
    
    const degrees = flightPoints.map((point: any) => {
      return [
        JulianDate.fromDate(new Date(point.timestamp!)).toString(),
        point.longitude,
        point.latitude,
        point.gpsAltitude,
      ];
    });

    const positions = degrees!.flat();
    const newDocument = {
      id: tracklog.id,
      name: tracklog.userData?.nome,
      availability: availability,
      model: {
        gltf: tracklog.gliderURL,
        scale: 2.0,
        resolutionScale: 0.1,
      },
      orientation: {
        velocityReference: '#position',
      },
      position: {
        cartographicDegrees: positions,
        interpolationAlgorithm: 'LAGRANGE',
        interpolationDegree: 3,
      },
    };
    const czml = [
      {
        id: 'document',
        name: 'CZML Voo',
        version: '1.0',
        clock: clock,
      },
      newDocument,
    ];
    return czml;
  }
  function close() {
    props.close();
  }
  function avancar() {
    if (descricao === '') return;
    ref.current?.cesiumElement!.render();
    ref.current?.cesiumElement!.canvas.toBlob((corverPhoto) => {
      tracklog!.photoCapaURL = URL.createObjectURL(corverPhoto!);
      tracklog!.description = descricao!;
      tracklog!.place = currentLocation;
      props.setTracklog(tracklog!);
      props.setImagemCapa(corverPhoto!);
      props.confirm();
    });

  }
  const [visible, { toggle }] = useDisclosure(true);

  return <>
    <LoadingOverlay visible={visible} overlayProps={{ blur: 5 }} loaderProps={{ children: <LoadingMain /> }} />
    <Container className={classes.container_viewer}>
      <Center p='xs'>
        <Title size='h5'>Escolha uma capa e descreva seu voo</Title>
      </Center>
      <Center>
        <Stack gap={0} className={classes.card_viewer}>
          <Card p={0} m={0} radius={0} className={classes.card_viewer}>
            {currentCzml && (
              <Viewer
                className={classes.viewer}
                id="cesiumContainer"
                full={false}
                style={{ height: 'auto', width: '100%', position: 'relative' }}
                {...args}
                ref={ref}>
              </Viewer>
            )}
          </Card>
          <Card withBorder padding="xs" radius="md"  mt='sm' className={classes.card_viewer}>
            <Stack >
              <SimpleGrid spacing="xs" verticalSpacing="xs" cols={1} >
                <Stack>
                  <Textarea
                    required
                    label="Descrição"
                    placeholder="Descreva seu voo..."
                    minRows={4}
                    classNames={{ input: classes.input, label: classes.inputLabel }}
                    mt="md"
                    onChange={(value) => setDescricao(value.target.value)}
                  />
                  <Text size="sm" c="dimmed">
                    {currentLocation}
                  </Text>
                </Stack>
              </SimpleGrid>
              <Center>
                <Button size="md" radius="xl" m='sm' onClick={close} variant="default">Voltar</Button>
                <Button size="md" radius="xl" m='sm' onClick={avancar} disabled={!descricao}>Avançar</Button>
              </Center>
            </Stack>
          </Card>
        </Stack>
      </Center>
    </Container>
  </>
}
