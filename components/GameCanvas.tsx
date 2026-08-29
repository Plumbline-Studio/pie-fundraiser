"use client";
import { Canvas } from "@react-three/fiber";
import Character from "./Character";
import PieManager from "./PieManager";

export default function GameCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 6.2], fov: 50 }}
      style={{ touchAction: "none" }}
    >
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
      {/* backdrop banner */}
      <mesh position={[0, 2.6, -8]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#C8102E" />
      </mesh>
      <Character />
      <PieManager />
    </Canvas>
  );
}
