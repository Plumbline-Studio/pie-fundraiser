"use client";
import dynamic from "next/dynamic";
import { TopBar, GameOverlay, BottomBar } from "@/components/HUD";
import ThrowLayer from "@/components/ThrowLayer";

const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-gray-500">
      <div className="text-center">
        <div className="text-5xl">{"\u{1F967}"}</div>
        <div className="mt-2 text-sm font-semibold">warming up the pies…</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="app-height flex w-full flex-col overflow-hidden bg-[#dfe9f2]">
      <TopBar />
      <div className="relative min-h-0 flex-1">
        <GameCanvas />
        <ThrowLayer />
        <GameOverlay />
      </div>
      <BottomBar />
    </main>
  );
}
