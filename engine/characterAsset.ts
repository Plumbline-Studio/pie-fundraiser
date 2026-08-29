// Teresa demo character — two full pose sets (the A/B experiment), sliced from
// character sheets, background-removed, feet-aligned on 384x768 canvases,
// hosted in the plumbline-dashboard Supabase public assets bucket, md5-verified.
// TODO: move into public/characters/teresa/ once local git workflow is running.
const ROOT =
  "https://ghddsckqbwrjsjvbjwya.supabase.co/storage/v1/object/public/assets/pie-fundraiser";

export type PoseName = "idle" | "shock" | "splat" | "wipe" | "laugh" | "smug";
export type VariantName = "stylized" | "realistic";

const POSE_NAMES: PoseName[] = ["idle", "shock", "splat", "wipe", "laugh", "smug"];

function poseSet(folder: string): Record<PoseName, string> {
  return Object.fromEntries(POSE_NAMES.map((p) => [p, `${ROOT}/${folder}/${p}.webp`])) as Record<
    PoseName,
    string
  >;
}

export const POSE_SETS: Record<VariantName, Record<PoseName, string>> = {
  stylized: poseSet("teresa"),
  realistic: poseSet("teresa-realistic"),
};

export const POSE_ASPECT = 384 / 768; // canvas w/h — feet sit on the bottom edge

// Flipbook animations (Veo-generated, frame-extracted at 12fps, matted, aligned).
// Frames live at `${base}/NNN.webp` for NNN in 000..count-1.
export interface Flipbook {
  base: string;
  count: number;
  fps: number;
  loop: boolean;
}

export const ANIMS: Partial<Record<VariantName, Partial<Record<PoseName, Flipbook>>>> = {
  stylized: {
    idle: { base: `${ROOT}/teresa/anim-idle`, count: 76, fps: 12, loop: true },
  },
};
