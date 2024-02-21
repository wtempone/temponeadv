import { useMemo, StrictMode, useEffect, useState, forwardRef } from "react";
import { Viewer, Cesium3DTileset as Resium3DTileset, useCesium, Entity } from "resium";
import {
  Cartesian3,
  Cesium3DTileset,
  Color,
  HeadingPitchRoll,
  ImageryLayer,
  JulianDate,
  OpenStreetMapImageryProvider,
  PathGraphics,
  SampledPositionProperty,
  TimeInterval,
  TimeIntervalCollection,
  VelocityOrientationProperty,
  createWorldImageryAsync,
} from "cesium";
import { Center } from "@mantine/core";


function TileSet(props:{flightData: any[]}) {
  const { viewer } = useCesium();

  const handleReady = (tileset: Cesium3DTileset) => {

    viewer!.scene.primitives.add(tileset);
    viewer!.scene.globe.show = false;

    const dataPoint = { longitude: -19.3508461, latitude: -42.568511, height: 2000 };

    const pointEntity = viewer!.entities.add({
      description: `Location: (${-19.3508461}, ${-42.568511}, ${1000})`,
      position: Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height),
      point: { pixelSize: 0, color: Color.RED }
    });

    viewer!.flyTo(pointEntity);
    const flightData = props.flightData;
    for (let i = 0; i < flightData.length; i++) {
      const dataPoint = flightData[i];

      viewer!.entities.add({
        description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
        position: Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height),
        point: { pixelSize: 0, color: Color.RED }
      });
    }

    /* Initialize the viewer clock:
      Assume the radar samples are 30 seconds apart, and calculate the entire flight duration based on that assumption.
      Get the start and stop date times of the flight, where the start is the known flight departure time (converted from PST 
        to UTC) and the stop is the start plus the calculated duration. (Note that Cesium uses Julian dates. See 
        https://simple.wikipedia.org/wiki/Julian_day.)
      Initialize the viewer's clock by setting its start and stop to the flight start and stop times we just calculated. 
      Also, set the viewer's current time to the start time and take the user to that time. 
    */
    const timeStepInSeconds = 30;
    const totalSeconds = timeStepInSeconds * (flightData.length - 1);
    const start = JulianDate.fromIso8601("2020-03-09T23:10:00Z");
    const stop = JulianDate.addSeconds(start, totalSeconds, new JulianDate());
    viewer!.clock.startTime = start.clone();
    viewer!.clock.stopTime = stop.clone();
    viewer!.clock.currentTime = start.clone();
    viewer!.timeline.zoomTo(start, stop);
    // Speed up the playback speed 50x.
    viewer!.clock.multiplier = 50;
    // Start playing the scene.
    viewer!.clock.shouldAnimate = true;

    // The SampledPositionedProperty stores the position and timestamp for each sample along the radar sample series.
    const positionProperty = new SampledPositionProperty();

    for (let i = 0; i < flightData.length; i++) {
      const dataPoint = flightData[i];

      // Declare the time for this individual sample and store it in a new JulianDate instance.
      const time = JulianDate.addSeconds(start, i * timeStepInSeconds, new JulianDate());
      const position = Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
      // Store the position along with its timestamp.
      // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
      positionProperty.addSample(time, position);

      // viewer!.entities.add({
      //   description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
      //   position: position,
      //   point: { pixelSize: 10, color: Color.RED }
      // });
    }

    // STEP 4 CODE (green circle entity)
    // Create an entity to both visualize the entire radar sample series with a line and add a point that moves along the samples.
    const airplaneEntity = viewer!.entities.add({
      availability: new TimeIntervalCollection([new TimeInterval({ start: start, stop: stop })]),
      position: positionProperty,
      point: { pixelSize: 0, color: Color.GREEN },
      path: new PathGraphics({ width: 0 })
    });
    // Make the camera track this moving entity.
    viewer!.trackedEntity = airplaneEntity;

    async function loadModel() {
      // Load the glTF model from Cesium ion.
      const airplaneUri = '/models/parapente.glb';
      const airplaneEntity = viewer!.entities.add({
        availability: new TimeIntervalCollection([new TimeInterval({ start: start, stop: stop })]),
        position: positionProperty,
        // Attach the 3D model instead of the green point.
        model: { uri: airplaneUri },
        // Automatically compute the orientation from the position.
        orientation: new VelocityOrientationProperty(positionProperty),
        path: new PathGraphics({ width: 0 })
      });

      viewer!.trackedEntity = airplaneEntity;
    }

    loadModel();
  };




  return (
    <Resium3DTileset
      url={
        `https://tile.googleapis.com/v1/3dtiles/root.json?key=${import.meta.env.VITE_GOOGLEMAPS_APIKEY}`
      }
      skipLevelOfDetail={true}
      baseScreenSpaceError={1024}
      skipScreenSpaceErrorFactor={16}
      skipLevels={1}
      immediatelyLoadDesiredLevelOfDetail={false}
      loadSiblings={false}
      cullWithChildrenBounds={true}
      onReady={handleReady}
      showCreditsOnScreen={true}
    />
  );
}

const args = {
  timeline: true,
  animation: true,
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

function TestDiv({ children }: { children?: React.ReactNode }) {
  const [a, setA] = useState<boolean>(false);

  useEffect(() => setA(true));

  if (a) {
    return <div>{children}</div>;
  } else {
    return null;
  }
}

export default function Mapa3D(props: { tracklog:[]}) {

  const [a, setA] = useState<boolean>(false);
  useEffect(() => setA(true));

  return (
    <Center>
      <TestDiv>
        <Viewer id="cesiumContainer"
          full
          {...args}
          style={{ position: 'relative', width: "80vw", height: "80vh" }}
        >
          <TileSet flightData={props.tracklog} />
        </Viewer>
      </TestDiv>
    </Center>
  );
}
