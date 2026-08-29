"use client";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/engine/store";
import { FEEL } from "@/engine/config";
import { POSE_SETS, POSE_ASPECT, PoseName, VariantName, ANIMS } from "@/engine/characterAsset";

// Full-body 2.5D character: pose textures + reaction timelines + a Veo-derived
// 24fps flipbook idle with inter-frame blending (reads ~48fps), ~150ms
// crossfade between poses, and procedural recoil layered on top.
// Splat decals removed by design — impact feedback is the burst + reaction.

const PLANE_H = 2.55;
const PLANE_W = PLANE_H * POSE_ASPECT;
const CROSSFADE = 0.15; // seconds

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

export default function BillboardCharacter({ variant = "stylized" }: { variant?: VariantName }) {
  const root = useRef<THREE.Group>(null!);
  const plane = useRef<THREE.Group>(null!);
  const matCur = useRef<THREE.MeshStandardMaterial>(null!);
  const matPrev = useRef<THREE.MeshStandardMaterial>(null!);
  const matBlend = useRef<THREE.MeshStandardMaterial>(null!);
  const blendMesh = useRef<THREE.Mesh>(null!);
  const reaction = useGame((s) => s.reaction);
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

  // flipbook idle animation (Veo-derived frames), when available for this variant.
  // Per-frame load tracking: playback starts once ~1s of frames is in, failed
  // frames retry and are walked around — never an all-or-nothing gate.
  const idleAnim = ANIMS[variant]?.idle;
  const lastIdleTex = useRef<THREE.Texture | null>(null);
  const idleFlip = useMemo(() => {
    if (!idleAnim) return null;
    const loader = new THREE.TextureLoader();
    const loadedFlags: boolean[] = new Array(idleAnim.count).fill(false);
    const state = { loaded: 0 };
    const frames: THREE.Texture[] = new Array(idleAnim.count);
    const loadFrame = (i: number, attempt: number): THREE.Texture => {
      const tex = loader.load(
        `${idleAnim.base}/${String(i).padStart(3, "0")}.webp`,
        () => {
          if (!loadedFlags[i]) {
            loadedFlags[i] = true;
            state.loaded += 1;
          }
        },
        undefined,
        () => {
          if (attempt < 3) {
            setTimeout(() => {
              frames[i] = loadFrame(i, attempt + 1);
            }, 800 * (attempt + 1));
          }
        }
      );
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      return tex;
    };
    for (let i = 0; i < idleAnim.count; i++) frames[i] = loadFrame(i, 0);
    return { frames, loadedFlags, state };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

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

    // when fading out of the animated idle, fade the frame she was actually
    // showing — not the static idle pose (that mismatch read as a "break")
    if (prevPose === "idle" && lastIdleTex.current && matPrev.current) {
      if (matPrev.current.map !== lastIdleTex.current) matPrev.current.map = lastIdleTex.current;
    }

    // --- flipbook with inter-frame blending: real motion while idle ---
    const flipActive =
      pose === "idle" &&
      !!idleAnim &&
      !!idleFlip &&
      idleFlip.state.loaded >= Math.min(24, idleAnim.count);
    if (matCur.current) {
      if (flipActive && idleAnim && idleFlip) {
        const fpos = (t * idleAnim.fps) % idleAnim.count;
        let i0 = Math.floor(fpos);
        const frac = fpos - i0;
        // walk back to the nearest loaded frame if this one isn't in yet
        let guard = 0;
        while (!idleFlip.loadedFlags[i0] && guard < idleAnim.count) {
          i0 = (i0 - 1 + idleAnim.count) % idleAnim.count;
          guard++;
        }
        if (guard < idleAnim.count) {
          matCur.current.map = idleFlip.frames[i0];
          lastIdleTex.current = idleFlip.frames[i0];
          const i1 = (i0 + 1) % idleAnim.count;
          if (matBlend.current && blendMesh.current) {
            if (guard === 0 && idleFlip.loadedFlags[i1]) {
              blendMesh.current.visible = true;
              matBlend.current.map = idleFlip.frames[i1];
              matBlend.current.opacity = frac * f;
            } else {
              blendMesh.current.visible = false;
            }
          }
        }
      } else {
        if (blendMesh.current) blendMesh.current.visible = false;
        if (matCur.current.map !== textures[pose]) matCur.current.map = textures[pose];
      }
    }

    // --- procedural life layered on top ---
    root.current.rotation.y = Math.sin(t * 0.6) * 0.04;
    if (!flipActive) {
      plane.current.scale.y = 1 + Math.sin(t * 2.1) * 0.006;
      plane.current.scale.x = 1 - Math.sin(t * 2.1) * 0.003;
    } else {
      plane.current.scale.y = 1;
      plane.current.scale.x = 1;
    }

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
        {/* current frame */}
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
        {/* next frame, fractionally blended on top (perceived ~2x frame rate) */}
        <mesh ref={blendMesh} position={[0, 0, 0.002]} visible={false}>
          <planeGeometry args={[PLANE_W, PLANE_H]} />
          <meshStandardMaterial
            ref={matBlend}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
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
