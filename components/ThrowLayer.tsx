"use client";
import { useRef } from "react";
import { bus } from "@/engine/events";
import { FEEL } from "@/engine/config";
import { useGame } from "@/engine/store";

// Transparent DOM layer over the canvas that turns a flick into a throw.
export default function ThrowLayer() {
  const drag = useRef<{ x: number; y: number; t: number } | null>(null);
  const consumePie = useGame((s) => s.consumePie);

  function onDown(e: React.PointerEvent) {
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  }

  function onUp(e: React.PointerEvent) {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y; // negative = upward flick
    const dt = Math.max(16, performance.now() - start.t);
    const dist = Math.hypot(dx, dy);
    const speed = dist / dt; // px per ms
    if (speed < FEEL.minFlickSpeed || -dy < 20) return; // not a real upward flick
    if (!consumePie()) return; // out of pies -> pledge modal opens

    const forward = -Math.min(FEEL.forwardMax, FEEL.forwardBase + speed * FEEL.forwardPerSpeed);
    const vx = dx * FEEL.lateralPerPx;
    const vy = Math.min(FEEL.liftMax, FEEL.liftBase + -dy * FEEL.liftPerPx);
    bus.emit("throw", { velocity: [vx, vy, forward] as [number, number, number] });
  }

  return (
    <div
      className="absolute inset-0 z-10 select-none"
      style={{ touchAction: "none" }}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => (drag.current = null)}
    />
  );
}
