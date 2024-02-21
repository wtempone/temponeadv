import { Container } from "@mantine/core";
import { Wrapper } from "@googlemaps/react-wrapper"
import { useEffect, useRef, useState } from "react";
import ThreejsOverlayView from '@ubilabs/threejs-overlay-view';
import { CatmullRomCurve3, Vector3 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

const CAR_FRONT = new Vector3(0, 1, 0);

const VIEW_PARAMS = {
  center: { lat: 53.554486, lng: 10.007479 },
  zoom: 18,
  heading: 40,
  tilt: 65
};

const ANIMATION_DURATION = 12000;
const ANIMATION_POINTS = [
  { lat: 53.554473, lng: 10.008226 },
  { lat: 53.554913, lng: 10.008124 },
  { lat: 53.554986, lng: 10.007928 },
  { lat: 53.554775, lng: 10.006363 },
  { lat: 53.554674, lng: 10.006383 },
  { lat: 53.554473, lng: 10.006681 },
  { lat: 53.554363, lng: 10.006971 },
  { lat: 53.554453, lng: 10.008091 },
  { lat: 53.554424, lng: 10.008201 },
  { lat: 53.554473, lng: 10.008226 }
];

export default function MapOverlay() {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_GOOGLEMAPS_APIKEY);
  const [mapId, setMapID] = useState<string>(import.meta.env.VITE_GOOGLEMAPS_MAPID);

  const optionsMap: google.maps.MapOptions = {
    center: { lat: 53.554486, lng: 10.007479 },
    zoom: 18,
    heading: 40,
    tilt: 65,
    mapId: mapId,
    disableDefaultUI: true,
  }

  function MyMap() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<google.maps.Map>();

    useEffect(() => {
      if (ref.current) {
        setMap(new window.google.maps.Map(ref.current, optionsMap))
      }
    }, [ref])
    return (
      <>
        <div
          ref={ref}
          id="map"
          style={{ width: "100%", height: "400px" }}
        />
        {map && (<OverlayView map={map} />)}
      </>
    )

    function OverlayView(props: { map: google.maps.Map | undefined }) {
      const overlayRef = useRef<ThreejsOverlayView | null>(null)
      const trackRef = useRef<Line2 | null>(null);
      const carRef = useRef<THREE.Group | null>(null);
      useEffect(() => {
        if (!map) return;
        if (!overlayRef.current) {
          const center = map.getCenter();
          if (center) {
            overlayRef.current = new ThreejsOverlayView({
              lat: center.lat() || 0,
              lng: center.lng() || 0,
            });
            overlayRef.current.setMap(map);
          }
        }
        const scene = overlayRef.current?.getScene();

        const points = ANIMATION_POINTS.map(p => overlayRef.current!.latLngAltToVector3(p));
        const curve = new CatmullRomCurve3(points, true, 'catmullrom', 0.2);

        if (trackRef.current) {
          scene?.remove(trackRef.current);
        }
        trackRef.current = createTrackLine(curve);
        scene?.add(trackRef.current);

        loadCarModel().then((carModel) => {
          if(carRef.current) {
            scene?.remove(carRef.current);
          }
          carRef.current = carModel;
          scene?.add(carRef.current);
        });

        overlayRef.current!.update = () => {
          trackRef.current!.material.resolution.copy(overlayRef.current!.getViewportSize());
          if (carRef.current) {
            const progress = (performance.now() % ANIMATION_DURATION) / ANIMATION_DURATION;
            curve.getPointAt(progress, carRef.current.position);
            const tmpVec3 = new Vector3();
            curve.getTangentAt(progress, tmpVec3);
            carRef.current.quaternion.setFromUnitVectors(CAR_FRONT, tmpVec3);
            carRef.current.rotateX(Math.PI / 2);
            carRef.current.rotateY(Math.PI);
          }
          overlayRef.current!.requestRedraw();
        }

        return () => {
          scene?.remove(trackRef.current as THREE.Object3D);
          scene?.remove(carRef.current as THREE.Object3D);
        }
      }, []);
      async function loadCarModel() {
        const loader = new GLTFLoader();
        const object = await loader.loadAsync('/models/parapente.glb')
        const scene = object.scene;
 
        scene.scale.setScalar(3);
        scene.rotation.set(0, Math.PI, 0, 'ZXY');
        return scene;
      }
      function createTrackLine(curve: CatmullRomCurve3) {
        const points = curve.getSpacedPoints(curve.getPoints().length * 10);
        const positions = points.map((p) => p.toArray()).flat();

        const trackLine = new Line2(
          new LineGeometry(),
          new LineMaterial({
            color: 0x0f9d58,
            linewidth: 5
          })
        );

        trackLine.geometry.setPositions(positions);

        return trackLine;
      }

      return null;
    }
  }

  return (
    <>
      <Container>
        <Wrapper apiKey={apiKey} >
          <MyMap></MyMap>
        </Wrapper>
      </Container >
    </>
  );
}