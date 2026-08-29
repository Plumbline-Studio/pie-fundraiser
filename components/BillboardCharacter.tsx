"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/engine/store";
import { FEEL } from "@/engine/config";
import { STYLIZED_DATA_URL } from "@/engine/characterAsset";

// 2.5D billboard character — the pre-approved fallback path from BRIEF.md.
// A high-craft render on a plane, animated with squash/recoil and dressed
// with the same splat decal + reaction system as the 3D placeholder.

const PLANE_H = 2.5;
const PLANE_W = PLANE_H * (590 / 900); // asset aspect
const BASE_Y = 0.22; // plane bottom so the face lands on FEEL.headCenter.y

function makeSplatTexture(): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.translate(64, 64);
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
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

const REACTION_DURATION = 0.9;

export default function BillboardCharacter() {
  const root = useRef<THREE.Group>(null!);
  const plane = useRef<THREE.Group>(null!);
  const reaction = useGame((s) => s.reaction);
  const splats = useGame((s) => s.splats);
  const anim = useRef({ seq: -1, t0: 0 });

  const charTex = useMemo(() => {
    const tex = new THREE.TextureLoader().load(STYLIZED_DATA_URL);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, []);
  const splatTex = useMemo(makeSplatTexture, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!root.current || !plane.current) return;

    // idle life: sway + breathe
    root.current.rotation.y = Math.sin(t * 0.6) * 0.05;
    plane.current.scale.y = 1 + Math.sin(t * 2.1) * 0.008;
    plane.current.scale.x = 1 - Math.sin(t * 2.1) * 0.004;

    if (reaction.seq !== anim.current.seq) {
      anim.current = { seq: reaction.seq, t0: t };
    }
    const rt = t - anim.current.t0;
    const active = rt < REACTION_DURATION && reaction.kind !== "idle";
    const k = active ? Math.sin((rt / REACTION_DURATION) * Math.PI) : 0;

    if (reaction.kind === "hitFace" && active) {
      plane.current.rotation.x = -0.32 * k + Math.sin(rt * 40) * 0.05 * k; // recoil + shudder
      plane.current.position.z = -0.12 * k;
    } else if (reaction.kind === "hitBody" && active) {
      plane.current.rotation.z = Math.sin(rt * 25) * 0.05 * k; // body wobble
    } else if (reaction.kind === "miss" && active) {
      plane.current.rotation.x = 0.12 * k; // smug lean-in
      plane.current.rotation.z = Math.sin(rt * 6) * 0.06 * k;
    } else {
      plane.current.rotation.x *= 0.9;
      plane.current.rotation.z *= 0.9;
      plane.current.position.z *= 0.9;
    }
  });

  const missActive = reaction.kind === "miss";

  return (
    <group ref={root} position={[0, 0, FEEL.targetZ]}>
      <group ref={plane} position={[0, BASE_Y + PLANE_H / 2, 0]}>
        <mesh>
          <planeGeometry args={[PLANE_W, PLANE_H]} />
          <meshStandardMaterial map={charTex} transparent alphaTest={0.1} side={THREE.DoubleSide} />
        </mesh>
        {/* splats ride the plane so they recoil with it (plane-local coords) */}
        {splatTex &&
          splats.map((s) => {
            const y =
              s.zone === "face"
                ? THREE.MathUtils.clamp(FEEL.headCenter[1] + s.pos[1] * 0.15, 1.7, 2.4) - (BASE_Y + PLANE_H / 2)
                : THREE.MathUtils.clamp(s.pos[1], 0.6, 1.5) - (BASE_Y + PLANE_H / 2);
            const x = THREE.MathUtils.clamp(s.pos[0] * 0.5, -PLANE_W / 2 + 0.2, PLANE_W / 2 - 0.2);
            return (
              <sprite key={s.id} position={[x, y, 0.06]} scale={[s.size, s.size, 1]}>
                <spriteMaterial map={splatTex} rotation={s.rot} depthWrite={false} />
              </sprite>
            );
          })}
      </group>
      {/* soft contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.7, 24]} />
        <meshBasicMaterial color="#9fb0c0" transparent opacity={0.45} />
      </mesh>
      {missActive && (
        <Html position={[1.0, 2.6, 0]} center distanceFactor={6} zIndexRange={[10, 0]}>
          <div className="rounded-2xl bg-white px-3 py-1.5 text-sm font-bold text-gray-800 shadow-lg whitespace-nowrap border-2 border-gray-200">
            {"Ha! Missed me! \u{1F60F}"}
          </div>
        </Html>
      )}
    </group>
  );
}
