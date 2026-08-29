"use client";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { bus, ThrowPayload } from "@/engine/events";
import { FEEL } from "@/engine/config";
import { useGame } from "@/engine/store";

interface ActivePie {
  id: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  spin: number;
  t: number;
  done: boolean;
}

interface Burst {
  id: number;
  pos: THREE.Vector3;
  t: number;
}

let pieId = 0;

function Pie({ pie }: { pie: ActivePie }) {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (!g.current) return;
    g.current.position.copy(pie.pos);
    g.current.rotation.x += pie.spin * 0.016;
  });
  return (
    <group ref={g}>
      {/* tin */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[FEEL.pieRadius, FEEL.pieRadius * 0.82, 0.1, 24]} />
        <meshStandardMaterial color="#b8b8c0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* cream */}
      <mesh position={[0, 0, 0.07]}>
        <sphereGeometry args={[FEEL.pieRadius * 0.92, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fdf6e3" roughness={0.9} />
      </mesh>
    </group>
  );
}

function CreamBurst({ burst }: { burst: Burst }) {
  const pts = useRef<THREE.Vector3[]>(
    Array.from({ length: 14 }, () =>
      new THREE.Vector3((Math.random() - 0.5) * 3.2, Math.random() * 3.0, (Math.random() - 0.2) * 2.4)
    )
  );
  const group = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const v = pts.current[i];
      child.position.x += v.x * dt;
      child.position.y += v.y * dt;
      child.position.z += v.z * dt;
      v.y -= 9 * dt;
      child.scale.multiplyScalar(Math.max(0, 1 - dt * 2.2));
    });
  });
  return (
    <group ref={group} position={burst.pos}>
      {pts.current.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05 + Math.random() * 0.05, 6, 4]} />
          <meshStandardMaterial color="#fdf6e3" />
        </mesh>
      ))}
    </group>
  );
}

export default function PieManager() {
  const [pies, setPies] = useState<ActivePie[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const registerHit = useGame((s) => s.registerHit);
  const registerMiss = useGame((s) => s.registerMiss);
  const setInFlight = useGame((s) => s.setInFlight);

  useEffect(() => {
    return bus.on<ThrowPayload>("throw", ({ velocity }) => {
      setPies((p) => [
        ...p,
        {
          id: pieId++,
          pos: new THREE.Vector3(...FEEL.launchPos),
          vel: new THREE.Vector3(...velocity),
          spin: FEEL.pieSpin * (0.7 + Math.random() * 0.6),
          t: 0,
          done: false,
        },
      ]);
      setInFlight(1);
    });
  }, [setInFlight]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.033);
    const finished: number[] = [];
    const newBursts: Burst[] = [];

    for (const pie of pies) {
      if (pie.done) continue;
      pie.t += dt;
      pie.vel.y -= FEEL.gravity * dt;
      pie.pos.addScaledVector(pie.vel, dt);

      // character-local coordinates (character group at [0, 0, targetZ])
      const lx = pie.pos.x;
      const ly = pie.pos.y;
      const lz = pie.pos.z - FEEL.targetZ;

      // head collision
      const [hx, hy, hz] = FEEL.headCenter;
      const dHead = Math.hypot(lx - hx, ly - hy, lz - hz);
      if (dHead < FEEL.headRadius + FEEL.pieRadius * 0.7) {
        pie.done = true;
        finished.push(pie.id);
        newBursts.push({ id: pie.id, pos: pie.pos.clone(), t: 0 });
        registerHit("face", [lx, ly, lz]);
        bus.emit("facehit", {});
        continue;
      }
      // body collision (vertical capsule)
      if (Math.abs(lz) < FEEL.bodyRadius + FEEL.pieRadius && ly > FEEL.bodyBottom && ly < FEEL.bodyTop) {
        const dBody = Math.hypot(lx, lz);
        if (dBody < FEEL.bodyRadius + FEEL.pieRadius * 0.7) {
          pie.done = true;
          finished.push(pie.id);
          newBursts.push({ id: pie.id, pos: pie.pos.clone(), t: 0 });
          registerHit("body", [lx, ly, lz]);
          continue;
        }
      }
      // miss: sailed past or hit the floor or timed out
      if (pie.pos.z < FEEL.targetZ - 2 || pie.pos.y < -0.5 || pie.t > FEEL.maxFlightTime) {
        pie.done = true;
        finished.push(pie.id);
        registerMiss();
      }
    }

    if (finished.length) {
      setPies((p) => p.filter((x) => !finished.includes(x.id)));
      setInFlight(-finished.length);
      if (newBursts.length) {
        setBursts((b) => [...b, ...newBursts]);
        setTimeout(() => setBursts((b) => b.filter((x) => !newBursts.some((n) => n.id === x.id))), 700);
      }
    }
  });

  return (
    <>
      {pies.map((pie) => (
        <Pie key={pie.id} pie={pie} />
      ))}
      {bursts.map((b) => (
        <CreamBurst key={b.id} burst={b} />
      ))}
    </>
  );
}
