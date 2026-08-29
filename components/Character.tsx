"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/engine/store";
import { FEEL } from "@/engine/config";

// Placeholder character built from primitives. The real character system loads
// asset folders (characters/<slug>) — this stands in until Gio's renders land.

function makeSplatTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.translate(64, 64);
  // blobby cream splat
  g.fillStyle = "#fdf6e3";
  g.beginPath();
  const lobes = 9;
  for (let i = 0; i <= lobes * 8; i++) {
    const a = (i / (lobes * 8)) * Math.PI * 2;
    const r = 40 + Math.sin(a * lobes) * 12 + Math.random() * 4;
    if (i === 0) g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
  g.fill();
  g.fillStyle = "#f7ecd0";
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.arc((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, 6 + Math.random() * 8, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

const REACTION_DURATION = 0.9;

export default function Character() {
  const root = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);
  const torso = useRef<THREE.Mesh>(null!);
  const leftEye = useRef<THREE.Mesh>(null!);
  const rightEye = useRef<THREE.Mesh>(null!);
  const reaction = useGame((s) => s.reaction);
  const splats = useGame((s) => s.splats);
  const splatTex = useMemo(makeSplatTexture, []);
  const anim = useRef({ seq: -1, t0: 0 });

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!root.current) return;

    // --- idle life: breathing, sway, blink ---
    if (torso.current) torso.current.scale.y = 1 + Math.sin(t * 2.1) * 0.015;
    root.current.rotation.y = Math.sin(t * 0.6) * 0.06;
    const blink = Math.max(0, Math.sin(t * 0.9) > 0.995 ? 0.1 : 1);
    if (leftEye.current) leftEye.current.scale.y = blink;
    if (rightEye.current) rightEye.current.scale.y = blink;

    // --- reaction envelope ---
    if (reaction.seq !== anim.current.seq) {
      anim.current = { seq: reaction.seq, t0: t };
    }
    const rt = t - anim.current.t0;
    const active = rt < REACTION_DURATION && reaction.kind !== "idle";
    const k = active ? Math.sin((rt / REACTION_DURATION) * Math.PI) : 0; // ease in-out envelope

    if (head.current) {
      if (reaction.kind === "hitFace" && active) {
        head.current.rotation.x = -0.55 * k + Math.sin(rt * 40) * 0.06 * k; // recoil + shudder
        head.current.position.z = -0.15 * k;
      } else if (reaction.kind === "hitBody" && active) {
        head.current.rotation.x = -0.2 * k;
      } else if (reaction.kind === "miss" && active) {
        head.current.rotation.x = 0.18 * k; // smug lean-in
        head.current.rotation.z = Math.sin(rt * 6) * 0.08 * k; // little head waggle
      } else {
        head.current.rotation.x *= 0.9;
        head.current.rotation.z *= 0.9;
        head.current.position.z *= 0.9;
      }
    }
    if (reaction.kind === "hitBody" && active && root.current) {
      root.current.rotation.z = Math.sin(rt * 25) * 0.04 * k;
    } else if (root.current) {
      root.current.rotation.z *= 0.9;
    }
  });

  const missActive = reaction.kind === "miss";
  const [hc0, hc1, hc2] = FEEL.headCenter;

  return (
    <group ref={root} position={[0, 0, FEEL.targetZ]}>
      {/* torso */}
      <mesh ref={torso} position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.55, 1.3, 24]} />
        <meshStandardMaterial color="#3b5b92" />
      </mesh>
      {/* shoulders */}
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.44, 24, 16]} />
        <meshStandardMaterial color="#3b5b92" />
      </mesh>
      {/* head group */}
      <group ref={head} position={[hc0, hc1 - 0.05, hc2]}>
        <mesh castShadow>
          <sphereGeometry args={[0.45, 32, 24]} />
          <meshStandardMaterial color="#e8b78f" />
        </mesh>
        {/* eyes */}
        <mesh ref={leftEye} position={[-0.16, 0.08, 0.38]}>
          <sphereGeometry args={[0.06, 12, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh ref={rightEye} position={[0.16, 0.08, 0.38]}>
          <sphereGeometry args={[0.06, 12, 8]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        {/* face splats parent to the head so they recoil with it */}
        {splatTex &&
          splats
            .filter((s) => s.zone === "face")
            .map((s) => (
              <sprite key={s.id} position={[s.pos[0] * 0.4, s.pos[1] * 0.4 - (hc1 - 0.05) * 0.4, 0.42]} scale={[s.size, s.size, 1]}>
                <spriteMaterial map={splatTex} rotation={s.rot} depthWrite={false} />
              </sprite>
            ))}
      </group>
      {/* body splats */}
      {splatTex &&
        splats
          .filter((s) => s.zone === "body")
          .map((s) => (
            <sprite key={s.id} position={[s.pos[0] * 0.6, Math.min(Math.max(s.pos[1], 0.6), 1.5), 0.5]} scale={[s.size, s.size, 1]}>
              <spriteMaterial map={splatTex} rotation={s.rot} depthWrite={false} />
            </sprite>
          ))}
      {/* taunt bubble on miss */}
      {missActive && (
        <Html position={[0.9, 2.6, 0]} center distanceFactor={6} zIndexRange={[10, 0]}>
          <div className="rounded-2xl bg-white px-3 py-1.5 text-sm font-bold text-gray-800 shadow-lg whitespace-nowrap border-2 border-gray-200">
            {"Ha! Missed me! \u{1F60F}"}
          </div>
        </Html>
      )}
    </group>
  );
}
