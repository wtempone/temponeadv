import { CameraEventType, Cartesian3, Viewer as CesiumViewer, Color, ColorMaterialProperty, CzmlDataSource, Entity, GoogleMaps, JulianDate, SampledPositionProperty, VelocityVectorProperty, createGooglePhotorealistic3DTileset, createWorldTerrainAsync } from 'cesium';
import IGCParser from 'igc-parser';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CesiumComponentRef, Viewer } from 'resium';
import { AddTrackLog, CreateNewTrackLog, GetCompleteTrackLog, TrackLog } from '~/lib/repositories/userTrackLogRepository';
import classes from './Scene.module.css';
import { SceneControls } from './SceneControls';
import { GliderSettings as GliderSettings } from '~/lib/repositories/userDataRepository';
import { useUserData } from '~/components/contexts/UserDataContext';
import { Text, Button, Card, Center, Container, Group, SimpleGrid, Stack, Textarea, Title } from '@mantine/core';
import axios from 'axios';

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
  baseLayerPicker: true,
  navigationHelpButton: false,
  fullscreenButton: false,
  vrButton: false,
  imageryProvider: false,
  requestRenderMode: false,
};

export default function NewScene(props: {
  gliderSettings: GliderSettings | null,
  model: Blob | null,
  usarPadrao: boolean,
  definirPadrao: boolean,
  flight: IGCParser.IGCFile | null
}) {

  const ref = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [currentCzml, setCurrentCzml] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [descricao, setDescricao] = useState<string>();
  const [cenaConfigurada, setCenaConfigurada] = useState<boolean>(false);
  const [tracklog, setTracklog] = useState<TrackLog | null>(null);
  const { userData } = useUserData();
  const navigate = useNavigate();

  async function createNewScene() {
    console.log('criando nova cena');
    const czml = await newSceneCZML()
    console.log(czml);
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
    console.log('configurando cena')
    setCenaConfigurada(true);
    const viewer = ref.current!.cesiumElement;
    //configureGoogleTerrain(ref);
    configureTerrain(ref);
    if (currentCzml) {

      const dataSourcePromise = await CzmlDataSource.load(currentCzml);
      await viewer!.dataSources.add(dataSourcePromise);
      const trackEntity = viewer!.dataSources.get(0).entities.getById(props.flight!.fixes[0].timestamp.toString());

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
      }
    } else {
      console.log('trackEntity not found');
    }
  }
  async function configureTerrain(viewerRef: React.RefObject<CesiumComponentRef<CesiumViewer>>) {
    const terrainProvider = await createWorldTerrainAsync();
    viewerRef.current!.cesiumElement!.terrainProvider = terrainProvider;
  }
  async function configureGoogleTerrain(viewerRef: React.RefObject<CesiumComponentRef<CesiumViewer>>) {
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
      await viewerRef!.current!.cesiumElement!.scene.primitives.add(tileset);
    } catch (error) {
      throw error
    }
  }

  function formataCustomPropertie(customProperties: Array<any>) {
    const properties: Array<any> = [];
    for (let i = 0; i < customProperties.length; i++) {
      properties.push(customProperties[i].interval);
      properties.push(customProperties[i].number);
    }
    return properties;
  }

  async function newSceneCZML() {
    const tracklog = await CreateNewTrackLog(
      userData?.id!,
      props.gliderSettings!,
      props.model!,
      props.flight!
    )
    setTracklog(tracklog);
    const customVelocity = formataCustomPropertie(tracklog.trackLogData!.velocityProperties);
    const customAsc = formataCustomPropertie(tracklog.trackLogData!.ascProperties);

    const contTracklog = tracklog.trackLogData!.flightPoints.length;
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
        gltf: tracklog.trackLogData?.gliderURL,
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
      properties: {
        velocidade: {
          number: customVelocity,
        },
        ascencao: {
          number: customAsc,
        },
      }
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
    window.history.back();
  }
  function save() {
    ref.current?.cesiumElement!.render();
    ref.current?.cesiumElement!.canvas.toBlob((corverPhoto) => {
      tracklog!.description = descricao!;
      tracklog!.place = currentLocation;
      AddTrackLog(
        tracklog!,
        props.model!,
        props.usarPadrao,
        props.definirPadrao,
        corverPhoto!,
        props.gliderSettings!,
      ).then(() => {
        navigate('/activity');
      });

    });
  }
  return <>
    <Container>
      <Center p='xs'>
        <Title size='h5'>Escolha uma capa e descreva seu voo</Title>
      </Center>
      <Center>
        <Stack className={classes.card_viewer}>
          <Card withBorder radius="md" className={classes.card_viewer}>
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
          <Card withBorder padding="xs" radius="md" className={classes.card_viewer}>
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
                <Button size="md" radius="xl" m='sm' onClick={save} >Publicar</Button>
              </Center>
            </Stack>
          </Card>
        </Stack>
      </Center>
    </Container>
  </>
}
