"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import BillboardCharacter from "./BillboardCharacter";
import PieManager from "./PieManager";
import { useGame } from "@/engine/store";
import { FEEL } from "@/engine/config";

// Frame the character tightly on any aspect ratio: pull in close, aim at her
// chest height so she fills the vertical, not the floor and sky.
function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.position.set(0, 1.45, aspect > 1.4 ? 1.3 : 1.7);
    camera.lookAt(0, 1.3, FEEL.targetZ);
  }, [camera, size]);
  return null;
}

export default function GameCanvas() {
  const style = useGame((s) => s.style);
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.45, 1.7], fov: 50 }}
      style={{ touchAction: "none" }}
    >
      <CameraRig />
      <color attach="background" args={["#dfe9f2"]} />
      <fog attach="fog" args={["#dfe9f2", 12, 24]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* stage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#c9d6e2" />
      </mesh>
      {/* backdrop banner — wide enough to fill desktop aspect ratios */}
      <mesh position={[0, 3.4, -9]}>
        <planeGeometry args={[44, 9]} />
        <meshStandardMaterial color="#C8102E" />
      </mesh>
      <BillboardCharacter key={style} variant={style} />
      <PieManager />
    </Canvas>
  );
}
