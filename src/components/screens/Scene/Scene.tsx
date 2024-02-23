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

export default function Scene() {

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
  loadSavedScene();
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
  function formataCustomPropertie(customProperties: Array<any>) {
    const properties: Array<any> = [];
    for (let i = 0; i < customProperties.length; i++) {
      properties.push(customProperties[i].interval);
      properties.push(customProperties[i].number);
    }
    return properties;
  }
  async function tracklogToCZML(tracklogs: Array<TrackLog>) {
    const contTracklog = tracklogs.length;
    const lastPoints = tracklogs[contTracklog - 1].trackLogData!.flightPoints.length;
    const initialDateScene = JulianDate.fromDate(new Date(tracklogs[0].trackLogData?.flightPoints[0].timestamp!));
    const endDateScene = JulianDate.fromDate(
      new Date(tracklogs[contTracklog - 1].trackLogData?.flightPoints[lastPoints - 1].timestamp!),
    );
    const interval = initialDateScene.toString() + '/' + endDateScene.toString();

    const clock = {
      interval: interval,
      currentTime: initialDateScene.toString(),
      multiplier: 2,
      range: 'LOOP_STOP',
      step: 'SYSTEM_CLOCK_MULTIPLIER',
    };

    const tracklogsEntities = tracklogs.map((log) => {

      const start = JulianDate.fromDate(new Date(log.trackLogData?.flightPoints[0].timestamp!));
      const end = JulianDate.fromDate(
        new Date(log.trackLogData?.flightPoints[log.trackLogData?.flightPoints.length - 1].timestamp!),
      );
      const availability = start.toString() + '/' + end.toString();
      const flightPointsDegrees = log.trackLogData!.flightPoints.map((point: any) => {
        return [
          JulianDate.fromDate(new Date(point.timestamp!)).toString(),
          point.longitude,
          point.latitude,
          point.gpsAltitude,
        ];
      });
      const velocities = formataCustomPropertie(log.trackLogData!.velocityProperties);
      const ascensions = formataCustomPropertie(log.trackLogData!.ascProperties);
      const positions = flightPointsDegrees!.flat();
      return {
        id: log.id,
        name: log.userData?.nome,
        availability: availability,
        label: {
          fillColor: {
            rgba: [255, 255, 255, 255],
          },
          outlineColor: {
            rgba: [
              0, 0, 0, 255
            ]
          },
          eyeOffset: {
            cartesian: [0.0, 8.0, -4.0],
          },
          scale: 0.25,
          font: '40pt Arial',
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
          gltf: log.trackLogData?.gliderURL,
          scale: 2,
        },
        orientation: {
          velocityReference: '#position',
        },
        path: {
          leadTime: -0.15,
          // trailTime: 1,
          resolution: 0.5,
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
            number: velocities,
          },
          ascencao: {
            number: ascensions,
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
