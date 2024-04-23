import { CameraEventType, Cartesian3, Cartographic, Viewer as CesiumViewer, Color, ColorMaterialProperty, CzmlDataSource, GoogleMaps, HeadingPitchRange, HeightReference, ImageryLayer, JulianDate, SampledPositionProperty, Transforms, VelocityVectorProperty, createGooglePhotorealistic3DTileset, createWorldTerrainAsync, sampleTerrainMostDetailed } from 'cesium';
import IGCParser from 'igc-parser';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CesiumComponentRef, Viewer } from 'resium';
import { GetCompleteTrackLog, ListCompleteTrackLog, TrackLog } from '~/lib/repositories/userTrackLogRepository';
import classes from './Scene.module.css';
import { SceneControls } from './SceneControls';
import { stringToDate, tsFBToDate } from '~/components/shared/helpers';
import { LoadingOverlay } from '@mantine/core';
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
  requestRenderMode: true,
};

export default function Scene() {

  const params = useParams();
  const ref = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const [tracklogs, setTracklogs] = useState<Array<TrackLog>>();

  function loadSavedScene() {
    if (!params) {
      throw new Error('Parametros não informados');
    }

    if (!ref.current) {
      if (params.id && params.id?.trim().length > 0) {
        GetCompleteTrackLog(params.id).then((resp) => {
          setTracklogs(resp!);

        });
      } else if (params.date) {
        const dataparam = stringToDate(params.date!);
        ListCompleteTrackLog(dataparam!).then((resp) => {
          setTracklogs(resp!);
        });
      }

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
    //viewer!.scene.debugShowFramesPerSecond = true;
    await configureTerrain();
    //await configureGoogleTerrain();
    const czml = await tracklogToCZML(tracklogs!);
    console.log('czml====> ', czml);
    const dataSourcePromise = await CzmlDataSource.load(czml);
    await viewer!.dataSources.add(dataSourcePromise);
    const trackEntity = viewer!.dataSources.get(0).entities.getById(tracklogs![0].id);

    if (trackEntity) {
      viewer!.scene.screenSpaceCameraController.enableTilt = false;
      viewer!.scene.screenSpaceCameraController.enableZoom = true;
      viewer!.scene.screenSpaceCameraController.enableLook = false;
      viewer!.scene.screenSpaceCameraController.enableTranslate = false;
      viewer!.scene.screenSpaceCameraController.enableRotate = true;
      viewer!.scene.screenSpaceCameraController.enableCollisionDetection = true;
      viewer!.scene.screenSpaceCameraController.minimumZoomDistance = 5;
      viewer!.scene.screenSpaceCameraController.maximumZoomDistance = 1200;

      var center = trackEntity.position!.getValue(viewer!.clock.currentTime);
      var transform = Transforms.eastNorthUpToFixedFrame(center!);
      viewer!.scene.camera.lookAtTransform(transform, new HeadingPitchRange(0, -Math.PI / 8, 900));
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
    ref.current!.cesiumElement!.scene.globe.depthTestAgainstTerrain = false;
    ref.current!.cesiumElement!.scene.globe.show = false;
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
  function formataCustomPropertie(customProperties: Array<any>) {
    if (!customProperties) return null
    const properties: Array<any> = [];
    for (let i = 0; i < customProperties.length; i++) {
      properties.push(customProperties[i].interval);
      properties.push(customProperties[i].number);
    }
    return properties;
  }

  async function tracklogToCZML(tracklogs: Array<TrackLog>) {
    tracklogs.sort((a, b) => tsFBToDate(a.takeoff!)!.getTime() - tsFBToDate(b.takeoff!)!.getTime())

    const menorData = tracklogs.reduce((menorDataAtual, tracklog) => {
      const dataAtual = tsFBToDate(tracklog.takeoff)!;
      return dataAtual < menorDataAtual ? dataAtual : menorDataAtual;
    }, tsFBToDate(tracklogs[0].takeoff)!);

    const maiorData = tracklogs.reduce((maiorDataAtual, tracklog) => {
      const dataAtual = tsFBToDate(tracklog.landing)!;
      return dataAtual > maiorDataAtual ? dataAtual : maiorDataAtual;
    }, tsFBToDate(tracklogs[0].landing)!);

    const initialDateScene = JulianDate.fromDate(menorData);
    ref!.current!.cesiumElement!.clock.currentTime = initialDateScene;
    const endDateScene = JulianDate.fromDate(maiorData);

    const interval = initialDateScene.toString() + '/' + endDateScene.toString();

    const clock = {
      interval: interval,
      currentTime: initialDateScene.toString(),
      multiplier: 2,
      range: 'CLAMPED',
      step: 'SYSTEM_CLOCK_MULTIPLIER',
    };

    const tracklogsEntitiesPromisses = tracklogs.map(async (log) => {

      const start = JulianDate.fromDate(new Date(log.trackLogData?.flightPoints[0].timestamp!));
      const end = JulianDate.fromDate(
        new Date(log.trackLogData?.flightPoints[log.trackLogData?.flightPoints.length - 1].timestamp!),
      );
      const availability = initialDateScene.toString() + '/' + endDateScene.toString();

      if (ref.current!.cesiumElement!.terrainProvider) {
        const terrainProvider = ref.current!.cesiumElement!.terrainProvider;
        const firstPosition = Cartographic.fromDegrees(log.trackLogData!.flightPoints[0].longitude,
          log.trackLogData!.flightPoints[0].latitude,
          log.trackLogData!.flightPoints[0].gpsAltitude);
        const updatedFirstPositions = await sampleTerrainMostDetailed(terrainProvider, [firstPosition]);
        if (updatedFirstPositions[0].height) {
          const diferencaFirst = updatedFirstPositions[0].height - log.trackLogData!.flightPoints[0].gpsAltitude;
          log.trackLogData!.flightPoints.forEach((point: any) => {
            point.gpsAltitude += diferencaFirst;
          });
        }
        const lastPosition = Cartographic.fromDegrees(log.trackLogData!.flightPoints[log.trackLogData!.flightPoints.length - 1].longitude,
          log.trackLogData!.flightPoints[log.trackLogData!.flightPoints.length - 1].latitude,
          log.trackLogData!.flightPoints[log.trackLogData!.flightPoints.length - 1].gpsAltitude);
        const updatedLastPositions = await sampleTerrainMostDetailed(terrainProvider, [lastPosition]);
        if (updatedLastPositions[0].height) {
          for (let i = log.trackLogData!.flightPoints.length - 1; i > 0 ; i--) {
            console.log(i, 'updatedLastPositions[0].height:', updatedLastPositions[0].height,'log.trackLogData!.flightPoints[i].gpsAltitude:', log.trackLogData!.flightPoints[i].gpsAltitude)
            if (log.trackLogData!.flightPoints[i].gpsAltitude <  updatedLastPositions[0].height) {
              log.trackLogData!.flightPoints[i].gpsAltitude =  updatedLastPositions[0].height;
            } else {
              break;
            }
          }
        }
      }

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
      const distancesAcc = formataCustomPropertie(log.trackLogData!.distanceAccProperties);
      const distancesDec = formataCustomPropertie(log.trackLogData!.distanceDecProperties);

      const colorPath = Color.fromCssColorString(log.userData?.gliderSettings?.corRastro!);
      return {
        id: log.id,
        name: log.userData?.nome,
        availability: availability,
        label: {
          fillColor: {
            rgba: [0, 0, 0, 255],
          },
          outlineColor: {
            rgba: [
              0, 0, 0, 255
            ]
          },
          eyeOffset: {
            cartesian: [0.0, 6.0, -4.0],
          },
          scale: 0.25,
          font: '40pt Arial',
          horizontalOrigin: 'CENTER',
          style: 'FILL',
          text: log.userData?.nome,
          showBackground: true,
          backgroundColor:
          {
            rgba: [colorPath.red * 255, colorPath.green * 255, colorPath.blue * 255, colorPath.alpha * 255],
          },
        },
        model: {
          gltf: log.gliderURL,
          scale: 1,
        },
        orientation: {
          velocityReference: '#position',
        },
        path: {
          leadTime: -0.10,
          //trailTime: 3,
          resolution: 0.1,
          material: {
            solidColor: {
              color:
              {
                rgba: [colorPath.red * 255, colorPath.green * 255, colorPath.blue * 255, colorPath.alpha * 255],
              },
            },
          },
          width: [
            {
              number: 1.0,
            },
          ],
        },
        position: [
          {
            interval: initialDateScene.toString() + '/' + start.toString(),
            cartographicDegrees: [
              log.trackLogData!.flightPoints[0].longitude,
              log.trackLogData!.flightPoints[0].latitude,
              log.trackLogData!.flightPoints[0].gpsAltitude,
            ]
          },
          {
            interval: start.toString() + '/' + end.toString(),
            cartographicDegrees: flightPointsDegrees!.flat(),
            interpolationAlgorithm: 'LAGRANGE',
            interpolationDegree: 3,
          },
          {
            interval: end.toString() + '/' + endDateScene.toString(),
            cartographicDegrees: [
              log.trackLogData!.flightPoints[log.trackLogData!.flightPoints.length - 1].longitude,
              log.trackLogData!.flightPoints[log.trackLogData!.flightPoints.length - 1].latitude,
              log.trackLogData!.flightPoints[log.trackLogData!.flightPoints.length - 1].gpsAltitude,
            ]
          }
        ],
        properties: {
          velocidade: [
            {
              interval: initialDateScene.toString() + '/' + start.toString(),
              number: 0
            },
            {
              interval: start.toString() + '/' + end.toString(),
              number: velocities
            },
            {
              interval: end.toString() + '/' + endDateScene.toString(),
              number: 0
            }
          ],
          ascencao: [
            {
              interval: initialDateScene.toString() + '/' + start.toString(),
              number: 0
            },
            {
              interval: start.toString() + '/' + end.toString(),
              number: ascensions
            },
            {
              interval: end.toString() + '/' + endDateScene.toString(),
              number: 0
            }
          ],
          distanceAcc: [
            {
              interval: initialDateScene.toString() + '/' + start.toString(),
              number: 0
            },
            {
              interval: start.toString() + '/' + end.toString(),
              number: distancesAcc
            },
            {
              interval: end.toString() + '/' + endDateScene.toString(),
              number: distancesAcc![distancesAcc!.length - 1]
            }
          ],
          distanceDec: [
            {
              interval: initialDateScene.toString() + '/' + start.toString(),
              number: 0
            },
            {
              interval: start.toString() + '/' + end.toString(),
              number: distancesDec
            },
            {
              interval: end.toString() + '/' + endDateScene.toString(),
              number: distancesDec![distancesDec!.length - 1]
            }
          ],
        }
      };
    });

    const tracklogsEntities = await Promise.all(tracklogsEntitiesPromisses);

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
