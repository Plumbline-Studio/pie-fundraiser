"use client";
import { create } from "zustand";

export type TargetId = "regionA" | "regionB" | "regionC" | "teresa";

export interface FeedEvent {
  id: number;
  text: string;
}

export interface SplatRec {
  id: number;
  zone: "face" | "body";
  // character-local position of the splat center
  pos: [number, number, number];
  size: number;
  rot: number;
}

export type CharStyle = "stylized" | "blocky";

export type Reaction =
  | { kind: "idle"; seq: number }
  | { kind: "hitFace"; seq: number }
  | { kind: "hitBody"; seq: number }
  | { kind: "miss"; seq: number };

export const TARGETS: { id: TargetId; label: string; demo: boolean }[] = [
  { id: "teresa", label: "Teresa (demo)", demo: true },
  { id: "regionA", label: "Region A President", demo: false },
  { id: "regionB", label: "Region B President", demo: false },
  { id: "regionC", label: "Region C President", demo: false },
];

const FIRST_NAMES = ["Jennifer", "Marcus", "Helen", "Dae", "Priya", "Tom", "Rosa", "Walt", "Kim", "Andre"];
const REGIONS = ["Roanoke", "Shenandoah", "Augusta", "Richmond"];

interface GameState {
  piesLeft: number;
  negative: boolean; // negative-pie mode armed
  target: TargetId;
  standings: Record<TargetId, number>;
  campaignTotal: number; // $ pledged, fake seed + player
  splats: SplatRec[];
  feed: FeedEvent[];
  reaction: Reaction;
  pledgeOpen: boolean;
  throwsInFlight: number;
  seq: number;
  style: CharStyle;

  setStyle: (style: CharStyle) => void;
  setTarget: (t: TargetId) => void;
  setPledgeOpen: (open: boolean) => void;
  buyPies: (count: number, negative: boolean) => void;
  consumePie: () => boolean;
  setInFlight: (delta: number) => void;
  registerHit: (zone: "face" | "body", localPos: [number, number, number]) => void;
  registerMiss: () => void;
  fakeFeedTick: () => void;
}

let splatId = 0;
let feedId = 0;

export const useGame = create<GameState>((set, get) => ({
  piesLeft: 3, // a few free demo pies so the first touch is a throw, not a form
  negative: false,
  target: "teresa",
  standings: { teresa: 0, regionA: 47, regionB: 62, regionC: 38 },
  campaignTotal: 735,
  splats: [],
  feed: [{ id: feedId++, text: "Welcome! Flick up to throw a pie \u{1F967}" }],
  reaction: { kind: "idle", seq: 0 },
  pledgeOpen: false,
  throwsInFlight: 0,
  seq: 0,
  style: "stylized",

  setStyle: (style) => set({ style }),
  setTarget: (t) => set({ target: t }),
  setPledgeOpen: (open) => set({ pledgeOpen: open }),

  buyPies: (count, negative) =>
    set((s) => ({
      piesLeft: s.piesLeft + count,
      negative,
      campaignTotal: s.campaignTotal + count * 5,
      pledgeOpen: false,
      feed: [
        { id: feedId++, text: negative ? `You armed ${count} negative pie${count > 1 ? "s" : ""} \u{1F608} (still $${count * 5} to United Way)` : `Pledge recorded: $${count * 5} to United Way — ${count} pie${count > 1 ? "s" : ""} added` },
        ...s.feed,
      ].slice(0, 6),
    })),

  consumePie: () => {
    const s = get();
    if (s.piesLeft <= 0) {
      set({ pledgeOpen: true });
      return false;
    }
    set({ piesLeft: s.piesLeft - 1 });
    return true;
  },

  setInFlight: (delta) => set((s) => ({ throwsInFlight: Math.max(0, s.throwsInFlight + delta) })),

  registerHit: (zone, localPos) =>
    set((s) => {
      const label = TARGETS.find((t) => t.id === s.target)!.label;
      const delta = s.negative ? -1 : 1;
      const next = { ...s.standings, [s.target]: Math.max(0, s.standings[s.target] + delta) };
      const text = s.negative
        ? `You stole a pie from ${label}! \u{1F967}➖`
        : zone === "face"
          ? `SPLAT! You pied ${label} right in the face!`
          : `You landed one on ${label}!`;
      return {
        standings: next,
        splats: [
          ...s.splats.slice(-23), // cap decals for perf; oldest fade off
          { id: splatId++, zone, pos: localPos, size: zone === "face" ? 0.42 + Math.random() * 0.18 : 0.5 + Math.random() * 0.25, rot: Math.random() * Math.PI * 2 },
        ],
        reaction: { kind: zone === "face" ? "hitFace" : "hitBody", seq: s.seq + 1 },
        seq: s.seq + 1,
        feed: [{ id: feedId++, text }, ...s.feed].slice(0, 6),
      };
    }),

  registerMiss: () =>
    set((s) => ({
      reaction: { kind: "miss", seq: s.seq + 1 },
      seq: s.seq + 1,
      feed: [{ id: feedId++, text: "Swing and a miss — they saw that one coming." }, ...s.feed].slice(0, 6),
    })),

  fakeFeedTick: () =>
    set((s) => {
      const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const targets = TARGETS.filter((t) => !t.demo);
      const tgt = targets[Math.floor(Math.random() * targets.length)];
      const n = Math.random() < 0.7 ? 1 : Math.floor(2 + Math.random() * 4);
      return {
        standings: { ...s.standings, [tgt.id]: s.standings[tgt.id] + n },
        campaignTotal: s.campaignTotal + n * 5,
        feed: [{ id: feedId++, text: `${name} in ${region} just pied the ${tgt.label} ${n > 1 ? `×${n}` : ""}` }, ...s.feed].slice(0, 6),
      };
    }),
}));
