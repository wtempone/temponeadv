import { CameraEventType, Cartesian3, Viewer as CesiumViewer, Color, ColorMaterialProperty, CzmlDataSource, GoogleMaps, JulianDate, SampledPositionProperty, VelocityVectorProperty, createGooglePhotorealistic3DTileset } from 'cesium';
import IGCParser from 'igc-parser';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CesiumComponentRef, Viewer } from 'resium';
import { GetCompleteTrackLog, TrackLog } from '~/lib/repositories/userTrackLogRepository';
import classes from './Scene.module.css';
import { SceneControls } from './SceneControls';

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

export default function Scene(props: { model: ArrayBuffer | null, points: IGCParser.BRecord[] | null }) {
  
  const params = useParams();
  const ref = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [tracklogs, setTracklogs] = useState<Array<TrackLog>>();
  const [currentCzml, setCurrentCzml] = useState<any>(null);

  function loadSavedScene() {
    if (!params || !params.id) {
      throw new Error('Data não informada');
    }
    const id = params.id!;
    if (!ref.current) {
      GetCompleteTrackLog(id!).then((resp) => {
        setTracklogs(resp!);
        console.log('tracklogs', resp);
      });
    }
  }
 
  function createNewScene() {

  }

  if (!props.points || !props.model) {
    loadSavedScene();
  } else {
    createNewScene();
  }

  useEffect(() => {
    if (ref.current?.cesiumElement) {
      configureScene();
    }
  }, [ref.current]);

  async function configureScene() {
    const viewer = ref.current!.cesiumElement;
    viewer!.scene.debugShowFramesPerSecond = true;
    configureTerrain(ref);
    const czml = await tracklogToCZML(tracklogs!);
    const dataSourcePromise = await CzmlDataSource.load(czml);
    await viewer!.dataSources.add(dataSourcePromise);
    const trackEntity = viewer!.dataSources.get(0).entities.getById(tracklogs![0].id);

    if (trackEntity) {
      // viewer!.flyTo(trackEntity).then(() => {
      viewer!.zoomTo(trackEntity);
      viewer!.trackedEntity = trackEntity;
      viewer!.trackedEntity!.viewFrom = new Cartesian3(0, -100, 100);
      const orginPosition = trackEntity!.position?.getValue(dataSourcePromise.clock.currentTime);

      viewer!.scene.screenSpaceCameraController.enableTilt = false;
      viewer!.scene.screenSpaceCameraController.enableZoom = true;
      viewer!.scene.screenSpaceCameraController.enableLook = false;
      viewer!.scene.screenSpaceCameraController.enableTranslate = false;
      viewer!.scene.screenSpaceCameraController.enableRotate = true;
      viewer!.scene.screenSpaceCameraController.enableCollisionDetection = true;
      viewer!.scene.screenSpaceCameraController.minimumZoomDistance = 5;
      viewer!.scene.screenSpaceCameraController.maximumZoomDistance = 1200;
      viewer!.scene.camera.changed.addEventListener(
        function () {
          if (viewer!.trackedEntity) {
            viewer!.trackedEntity!.viewFrom = new Cartesian3(0, -100, 100);
          }
        }
      );

      // });
    } else {
      console.log('trackEntity not found');
    }
  }

  async function configureTerrain(viewerRef: React.RefObject<CesiumComponentRef<CesiumViewer>>) {
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

  function reduzQuantidadedePontos(pontos: IGCParser.BRecord[], quantidade: number) {
    const pontosFiltrados = pontos.filter((ponto, index, array) => {
      return index % quantidade === 0;
    });
    return pontosFiltrados;
  }

  function calculaVelocidades(pontos: IGCParser.BRecord[]) {
    const position = new SampledPositionProperty();

    const velocityVectorProperty = new VelocityVectorProperty(
      position,
      false
    );

    for (let i = 0; i < pontos.length; i++) {
      const ponto = pontos[i];
      const time = JulianDate.fromDate(new Date(ponto.timestamp!));
      const location = Cartesian3.fromDegrees(ponto.longitude, ponto.latitude, ponto.gpsAltitude!);
      position.addSample(time, location);
    }

    const velocityProperties = [];

    for (let i = 0; i < pontos.length; i++) {
      const ponto = pontos[i];
      const velocityVector = new Cartesian3();
      const time = JulianDate.fromDate(new Date(ponto.timestamp!));
      velocityVectorProperty.getValue(time, velocityVector);
      const metersPerSecond = Cartesian3.magnitude(velocityVector);
      const kmPerHour = Math.round(metersPerSecond * 3.6);
      velocityProperties.push(
        { interval: time.toString(), number: kmPerHour }
      );
    }
    const positionAsc = new SampledPositionProperty();

    const ascVectorProperty = new VelocityVectorProperty(
      positionAsc,
      false
    );

    for (let i = 0; i < pontos.length; i++) {
      const ponto = pontos[i];
      const time = JulianDate.fromDate(new Date(ponto.timestamp!));
      const location = Cartesian3.fromDegrees(0, 0, ponto.gpsAltitude!);
      positionAsc.addSample(time, location);
    }

    const ascProperties = [];

    for (let i = 0; i < pontos.length; i++) {
      const ponto = pontos[i];
      const velocityVector = new Cartesian3();
      const time = JulianDate.fromDate(new Date(ponto.timestamp!));
      ascVectorProperty.getValue(time, velocityVector);
      let metersPerSecond = Cartesian3.magnitude(velocityVector);
      if (i > 0 && metersPerSecond !== 0) {
        if (ponto.gpsAltitude! < pontos[i - 1].gpsAltitude!) {
          metersPerSecond = -1 * metersPerSecond;
        }
      }
      ascProperties.push(
        { interval: time.toString(), number: metersPerSecond }
      );
    }
    return { velocityProperties, ascProperties };
  }

  function eliminaVelocidadesIrrelevantes(filtered: IGCParser.BRecord[], velocityProperties: Array<any>, ascProperties: Array<any>) {
    const velocidades = velocityProperties;
    const asc = ascProperties;
    const pontosFiltrados = Array<IGCParser.BRecord>();
    const velocidadesFiltradas = Array<any>();
    const ascFiltradas = Array<any>();
    let inicio = false;
    for (let i = 0; i < filtered.length; i++) {
      if (velocidades[i].number > 6 && asc[i].number != 0) {
        if (inicio === false) {
          for (let j = i - 1; j >= 0; j--) {
            pontosFiltrados.push(filtered[i]);
            velocidadesFiltradas.push(velocidades[i]);
            ascFiltradas.push(asc[i]);
          }
          inicio = true;
        }
        pontosFiltrados.push(filtered[i]);
        velocidadesFiltradas.push(velocidades[i]);
        ascFiltradas.push(asc[i]);
      }
    }
    const lastPoint = pontosFiltrados.length - 1
    for (let i = lastPoint; i < filtered.length; i++) {
      pontosFiltrados.push(filtered[lastPoint]);
      velocidadesFiltradas.push(velocidades[lastPoint]);
      ascFiltradas.push(asc[lastPoint]);
    }
    return { filteredFiltrados: pontosFiltrados, velocidadesFiltradas, ascFiltradas };
  }
  function formataCustomPropertie(customProperties: Array<any>) {
    const properties: Array<any> = [];
    for (let i = 0; i < customProperties.length; i++) {
      properties.push(customProperties[i].interval);
      properties.push(customProperties[i].number);
    }
    return properties;
  }
  async function tracklogToCZML(tracklogs: Array<TrackLog>) {

    let tracklogsAnalisis: Array<any> = [];
    for (let i = 0; i < tracklogs.length; i++) {
      tracklogsAnalisis.push(tracklogs[i]);
      const tracklog = tracklogs[i];
      let filtered = tracklog.trackLogData!.filtered;
      filtered = reduzQuantidadedePontos(filtered, 3);
      const customProperties = calculaVelocidades(filtered);
      const filtrados = eliminaVelocidadesIrrelevantes(filtered, customProperties.velocityProperties, customProperties.ascProperties);
      const customVelocity = formataCustomPropertie(filtrados.velocidadesFiltradas);
      const customAsc = formataCustomPropertie(filtrados.ascFiltradas);
      tracklogsAnalisis[i].trackLogData.filtered = filtrados.filteredFiltrados;
      tracklogsAnalisis[i].trackLogData.velocityProperties = customVelocity;
      tracklogsAnalisis[i].trackLogData.ascProperties = customAsc;
    }

    const contTracklog = tracklogsAnalisis.length;
    const lastPoints = tracklogsAnalisis[contTracklog - 1].trackLogData!.filtered.length;
    const initialDateScene = JulianDate.fromDate(new Date(tracklogsAnalisis[0].trackLogData?.filtered[0].timestamp!));
    const endDateScene = JulianDate.fromDate(
      new Date(tracklogsAnalisis[contTracklog - 1].trackLogData?.filtered[lastPoints - 1].timestamp!),
    );
    const interval = initialDateScene.toString() + '/' + endDateScene.toString();

    const clock = {
      interval: interval,
      currentTime: initialDateScene.toString(),
      multiplier: 2,
      range: 'LOOP_STOP',
      step: 'SYSTEM_CLOCK_MULTIPLIER',
    };

    const tracklogsEntities = tracklogsAnalisis.map((log) => {
      const start = JulianDate.fromDate(new Date(log.trackLogData?.filtered[0].timestamp!));
      const end = JulianDate.fromDate(
        new Date(log.trackLogData?.filtered[log.trackLogData?.filtered.length - 1].timestamp!),
      );
      const availability = start.toString() + '/' + end.toString();
      let filtered = log.trackLogData!.filtered;
      const degrees = filtered.map((point: any) => {
        return [
          JulianDate.fromDate(new Date(point.timestamp!)).toString(),
          point.longitude,
          point.latitude,
          point.gpsAltitude,
        ];
      });

      const positions = degrees!.flat();
      return {
        id: log.id,
        name: log.userData?.nome,
        availability: availability,
        billboard: {
          sizeInMeters: true,
          eyeOffset: {
            cartesian: [0.0, 2.2, -2.0],
          },
          image: log.userData?.photoURL,
          width: 1,
          height: 1,

        },
        label: {
          fillColor: {
            rgba: [255, 255, 255, 255],
          },
          eyeOffset: {
            cartesian: [0.0, 3.2, -5.0],
          },
          font: '10pt Lucida Console',
          horizontalOrigin: 'CENTER',
          style: 'FILL',
          text: log.userData?.nome,
          showBackground: true,
          backgroundColor:
          {
            rgba: [255, 0, 0, 127],
          },
        },
        model: {
          gltf: 'https://firebasestorage.googleapis.com/v0/b/avlva-dev.appspot.com/o/glider_customized_models%2Ff83e4151-2252-4044-a56f-e065476e26be.gltf?alt=media&token=38bb665c-41bb-4c62-948b-5731993deefe',
          scale: 3,
          silhouetteColor:
          {
            rgba: [127, 127, 127, 127],
          },
          silhouetteSize: 0.2,
          color: {
            rgba: [255, 0, 0, 255],
          },
          colorBlendMode: 'HIGHLIGHT',
          colorBlendAmount: 0.01,
        },
        orientation: {
          velocityReference: '#position',
        },
        path: {
          leadTime: -0.15,
          // trailTime: 1,
          resolution: 1,
          material: {
            solidColor: {
              color:
              {
                rgba: [255, 0, 0, 127],
              },
            },
          },
          width: [
            {
              number: 5.0,
            },
          ],
        },
        position: {
          cartographicDegrees: positions,
          interpolationAlgorithm: 'LAGRANGE',
          interpolationDegree: 3,
        },
        properties: {
          velocidade: {
            number: log.trackLogData.velocityProperties,
          },
          ascencao: {
            number: log.trackLogData.ascProperties,
          },
        }
      };
    });
    const czml = [
      {
        id: 'document',
        name: 'CZML Voo',
        version: '1.0',
        clock: clock,
      },
      ...tracklogsEntities,
    ];
    return czml;
  }
  return <>
    {tracklogs && (
      <Viewer className={classes.viewer} id="cesiumContainer" full {...args} ref={ref}>
      </Viewer>
    )}
    {tracklogs && ref.current?.cesiumElement && (<SceneControls viewer={ref} tracklogs={tracklogs} />)}

  </>
}
