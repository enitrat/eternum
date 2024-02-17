import { Canvas } from "@react-three/fiber";
import { WorldMapScene } from "./WorldMapScene";
import { RealmCityViewScene } from "./RealmCityViewScene";
import useUIStore from "../../hooks/store/useUIStore";
import { Perf } from "r3f-perf";
import { useLocation, Switch, Route } from "wouter";
import { a } from "@react-spring/three";
import { Sky, AdaptiveDpr, useHelper, Clouds, Cloud, CameraShake } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { EffectComposer, Bloom, Noise, SMAA } from "@react-three/postprocessing";
// @ts-ignore
import { Sobel } from "../../utils/effects.jsx";
import { useControls } from "leva";
import { CameraControls } from "../../utils/Camera";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import FPSLimiter from "../../utils/FPSLimiter";

export const Camera = () => {
  // const [isMapView] = useRoute("/map");

  const cameraPosition = useUIStore((state) => state.cameraPosition);
  // const camera1 = { x: 0, y: 50, z: -500 };
  // const camera2 = { x: 100, y: 30, z: -500 }
  const cameraTarget = useUIStore((state) => state.cameraTarget);

  const dLightRef = useRef<any>();
  if (import.meta.env.DEV) {
    useHelper(dLightRef, THREE.DirectionalLightHelper, 50, "hotpink");
  }

  const { lightPosition, bias } = useControls({
    lightPosition: {
      value: { x: 0, y: 1000, z: 0 }, // Adjust y value to position the light above
      step: 0.01,
    },
    bias: {
      value: -0.002,
      min: -0.05,
      max: 0.05,
      step: 0.001,
    },
  });

  return (
    <>
      <CameraControls position={cameraPosition} target={cameraTarget} />
      <directionalLight
        ref={dLightRef}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={3000}
        shadow-camera-left={-3000}
        shadow-camera-right={3000}
        shadow-camera-top={3000}
        shadow-camera-bottom={-3000}
        shadow-bias={bias}
        position={[lightPosition.x, lightPosition.y, lightPosition.z]}
        intensity={1}
      ></directionalLight>
    </>
  );
};

export const MainScene = () => {
  const [location] = useLocation();
  // location type
  const locationType = useMemo(() => {
    if (location === "/map" || location === "/") {
      return "map";
    } else {
      return "realm";
    }
  }, [location]);

  const data = useControls("GL", {
    exposure: { value: 0.4, min: -5, max: 5 },
    toneMapping: {
      options: {
        filmic: THREE.ACESFilmicToneMapping,
        linear: THREE.LinearToneMapping,
        notone: THREE.NoToneMapping,
        reinhard: THREE.ReinhardToneMapping,
        cineon: THREE.CineonToneMapping,
      },
    },
    legacyLights: { value: false },
    // fog: "#fff",
    encoding: {
      options: {
        rgb: THREE.sRGBEncoding,
        linear: THREE.LinearEncoding,
      },
    },
  });

  const shakeConfig = useMemo(
    () => ({
      maxYaw: 0.01, // Max amount camera can yaw in either direction
      maxPitch: 0, // Max amount camera can pitch in either direction
      maxRoll: 0, // Max amount camera can roll in either direction
      yawFrequency: 0.04, // Frequency of the the yaw rotation
      pitchFrequency: 0, // Frequency of the pitch rotation
      rollFrequency: 0, // Frequency of the roll rotation
      intensity: 1, // initial intensity of the shake
      controls: undefined, // if using orbit controls, pass a ref here so we can update the rotation
    }),
    [],
  );

  const fogDistance = useMemo(
    () =>
      locationType === "map"
        ? {
            near: 507,
            far: 725,
          }
        : {
            near: 1885,
            far: 2300,
          },
    [locationType],
  );

  const cloudsConfig = useMemo(
    () =>
      locationType === "map"
        ? {
            position: [0, 75, 50],
            opacity: 0.05,
            bounds: [200, 1, 100],
            volume: 50,
          }
        : {
            position: [0, 255, -250],
            opacity: 0.1,
            bounds: [700, 10, 300],
            volume: 200,
          },
    [locationType],
  );

  return (
    <Canvas
      frameloop="demand" // for fps limiter
      raycaster={{ params: { Points: { threshold: 0.2 } } }}
      className="rounded-xl"
      camera={{ fov: 15, position: [0, 700, 0], far: 3500 }}
      dpr={[0.5, 1]}
      performance={{
        min: 0.1,
        max: 1,
      }}
      shadows={{
        enabled: true, // Always Enabled, but in Lights.tsx control render mode
        type: THREE.PCFSoftShadowMap,
      }}
      gl={{
        powerPreference: "low-power",
        antialias: false,
        stencil: false,
        depth: false,
        logarithmicDepthBuffer: true,
        toneMappingExposure: Math.pow(2, data.exposure),
        toneMapping: data.toneMapping,
        useLegacyLights: data.legacyLights,
        outputEncoding: data.encoding,
      }}
    >
      {import.meta.env.DEV && <Perf position="bottom-left" />}
      <FPSLimiter>
        <Sky azimuth={1} inclination={0.6} distance={3000} />
        <ambientLight />
        <Camera />
        <CameraShake {...shakeConfig} />
        <Suspense fallback={null}>
          <a.group>
            <Switch location={locationType}>
              <Route path="map">
                <WorldMapScene />
              </Route>
              <Route path="realm">
                <RealmCityViewScene />
              </Route>
            </Switch>
          </a.group>
        </Suspense>
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0} intensity={0.1} mipmapBlur />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.3} />
          <SMAA />
        </EffectComposer>
        <AdaptiveDpr pixelated />
        <Clouds position={cloudsConfig.position as any} material={THREE.MeshBasicMaterial}>
          <Cloud
            concentrate="random"
            seed={7331}
            speed={0.06}
            segments={100}
            castShadow={true}
            opacity={cloudsConfig.opacity}
            bounds={cloudsConfig.bounds as any}
            volume={cloudsConfig.volume}
            color="white"
          />
          <Cloud
            concentrate="random"
            seed={1337}
            castShadow={true}
            speed={0.03}
            segments={100}
            opacity={cloudsConfig.opacity}
            bounds={cloudsConfig.bounds as any}
            volume={cloudsConfig.volume}
            color="white"
          />
        </Clouds>
        {/* <fog attach="fog" color={data.fog} near={fogDistance.near} far={fogDistance.far} /> */}
      </FPSLimiter>
    </Canvas>
  );
};
