"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/engine/store";
import { FEEL } from "@/engine/config";
import { POSE_SETS, POSE_ASPECT, PoseName, VariantName } from "@/engine/characterAsset";

// Full-body 2.5D character: one plane, six pose textures, a reaction timeline
// per hit type, ~150ms crossfade between poses so swaps read as motion,
// plus procedural life (breath, sway, recoil) on top.

const PLANE_H = 2.55;
const PLANE_W = PLANE_H * POSE_ASPECT;
const CROSSFADE = 0.15; // seconds
const SPLAT_HOLD = 6000; // ms at full opacity
const SPLAT_FADE = 3000; // ms fading out
const SPLAT_MAX_AGE = SPLAT_HOLD + SPLAT_FADE + 200;

// reaction timelines: sequence of [pose, seconds]
const TIMELINES: Record<"hitFace" | "hitBody" | "miss", [PoseName, number][]> = {
  hitFace: [
    ["splat", 1.0],
    ["wipe", 0.9],
  ],
  hitBody: [
    ["shock", 0.45],
    ["laugh", 1.0],
  ],
  miss: [["smug", 1.3]],
};

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

export default function BillboardCharacter({ variant = "stylized" }: { variant?: VariantName }) {
  const root = useRef<THREE.Group>(null!);
  const plane = useRef<THREE.Group>(null!);
  const matCur = useRef<THREE.MeshStandardMaterial>(null!);
  const matPrev = useRef<THREE.MeshStandardMaterial>(null!);
  const splatMats = useRef(new Map<number, THREE.SpriteMaterial>());
  const reaction = useGame((s) => s.reaction);
  const splats = useGame((s) => s.splats);
  const pruneSplats = useGame((s) => s.pruneSplats);
  const anim = useRef({ seq: -1, t0: 0 });
  const fade = useRef({ t0: -10 });
  const [pose, setPose] = useState<PoseName>("idle");
  const [prevPose, setPrevPose] = useState<PoseName | null>(null);

  const textures = useMemo(() => {
    const poses = POSE_SETS[variant];
    const loader = new THREE.TextureLoader();
    const out = {} as Record<PoseName, THREE.Texture>;
    (Object.keys(poses) as PoseName[]).forEach((k) => {
      const tex = loader.load(poses[k]);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      out[k] = tex;
    });
    return out;
  }, [variant]);
  const splatTex = useMemo(makeSplatTexture, []);

  // sweep expired splat decals out of the store
  useEffect(() => {
    const iv = setInterval(() => pruneSplats(SPLAT_MAX_AGE), 1500);
    return () => clearInterval(iv);
  }, [pruneSplats]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!root.current || !plane.current) return;

    // --- pose state machine ---
    if (reaction.seq !== anim.current.seq) {
      anim.current = { seq: reaction.seq, t0: t };
    }
    const rt = t - anim.current.t0;
    let nextPose: PoseName = "idle";
    let total = 0;
    if (reaction.kind !== "idle") {
      const timeline = TIMELINES[reaction.kind];
      let acc = 0;
      total = timeline.reduce((s, [, d]) => s + d, 0);
      if (rt < total) {
        for (const [p, d] of timeline) {
          acc += d;
          if (rt < acc) {
            nextPose = p;
            break;
          }
        }
      }
    }
    if (nextPose !== pose) {
      setPrevPose(pose);
      fade.current.t0 = t;
      setPose(nextPose);
    }

    // --- crossfade between poses ---
    const f = THREE.MathUtils.clamp((t - fade.current.t0) / CROSSFADE, 0, 1);
    if (matCur.current) matCur.current.opacity = f;
    if (matPrev.current) matPrev.current.opacity = 1 - f;
    if (f >= 1 && prevPose) setPrevPose(null);

    // --- splat decal fade-out ---
    const now = Date.now();
    splatMats.current.forEach((mat, id) => {
      const rec = splats.find((s) => s.id === id);
      if (!rec) return;
      const age = now - rec.born;
      mat.opacity = age < SPLAT_HOLD ? 0.9 : 0.9 * Math.max(0, 1 - (age - SPLAT_HOLD) / SPLAT_FADE);
    });

    // --- procedural life on top of the pose swap ---
    root.current.rotation.y = Math.sin(t * 0.6) * 0.04;
    plane.current.scale.y = 1 + Math.sin(t * 2.1) * 0.006;
    plane.current.scale.x = 1 - Math.sin(t * 2.1) * 0.003;

    const active = reaction.kind !== "idle" && rt < total;
    const k = active ? Math.sin((rt / total) * Math.PI) : 0;
    if (reaction.kind === "hitFace" && active) {
      plane.current.rotation.x = -0.22 * k + Math.sin(rt * 40) * 0.04 * k; // recoil + shudder
      plane.current.position.z = -0.1 * k;
    } else if (reaction.kind === "hitBody" && active) {
      plane.current.rotation.z = Math.sin(rt * 22) * 0.05 * k; // wobble
    } else if (reaction.kind === "miss" && active) {
      plane.current.rotation.x = 0.08 * k; // smug lean-in
      plane.current.rotation.z = Math.sin(rt * 6) * 0.04 * k;
    } else {
      plane.current.rotation.x *= 0.9;
      plane.current.rotation.z *= 0.9;
      plane.current.position.z *= 0.9;
    }
  });

  const missActive = reaction.kind === "miss" && pose === "smug";

  return (
    <group ref={root} position={[0, 0, FEEL.targetZ]}>
      <group ref={plane} position={[0, PLANE_H / 2, 0]}>
        {/* previous pose, fading out under the current one */}
        {prevPose && (
          <mesh position={[0, 0, -0.004]}>
            <planeGeometry args={[PLANE_W, PLANE_H]} />
            <meshStandardMaterial
              ref={matPrev}
              map={textures[prevPose]}
              transparent
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        <mesh>
          <planeGeometry args={[PLANE_W, PLANE_H]} />
          <meshStandardMaterial
            ref={matCur}
            map={textures[pose]}
            transparent
            alphaTest={0.02}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* splat decals ride the plane; opacity animated in useFrame */}
        {splatTex &&
          splats.map((s) => {
            const y =
              s.zone === "face"
                ? THREE.MathUtils.clamp(FEEL.headCenter[1] + s.pos[1] * 0.15, 1.8, 2.45) - PLANE_H / 2
                : THREE.MathUtils.clamp(s.pos[1], 0.5, 1.6) - PLANE_H / 2;
            const x = THREE.MathUtils.clamp(s.pos[0] * 0.4, -PLANE_W / 2 + 0.15, PLANE_W / 2 - 0.15);
            return (
              <sprite key={s.id} position={[x, y, 0.06]} scale={[s.size * 0.7, s.size * 0.7, 1]}>
                <spriteMaterial
                  ref={(m) => {
                    if (m) splatMats.current.set(s.id, m);
                    else splatMats.current.delete(s.id);
                  }}
                  map={splatTex}
                  rotation={s.rot}
                  depthWrite={false}
                  opacity={0.9}
                />
              </sprite>
            );
          })}
      </group>
      {/* soft contact shadow at her feet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.55, 24]} />
        <meshBasicMaterial color="#9fb0c0" transparent opacity={0.45} />
      </mesh>
      {missActive && (
        <Html position={[0.95, 2.5, 0]} center distanceFactor={6} zIndexRange={[10, 0]}>
          <div className="rounded-2xl bg-white px-3 py-1.5 text-sm font-bold text-gray-800 shadow-lg whitespace-nowrap border-2 border-gray-200">
            {"Ha! Missed me! \u{1F60F}"}
          </div>
        </Html>
      )}
    </group>
  );
}
