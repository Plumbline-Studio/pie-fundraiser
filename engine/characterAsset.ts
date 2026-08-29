// Teresa demo character — full-body pose set sliced from character sheet 2,
// background-removed, feet-aligned on a 384x768 canvas, hosted in the
// plumbline-dashboard Supabase public assets bucket (CORS: *), md5-verified.
// TODO: move into public/characters/teresa/ once local git workflow is running.
const BASE =
  "https://ghddsckqbwrjsjvbjwya.supabase.co/storage/v1/object/public/assets/pie-fundraiser/teresa";

export type PoseName = "idle" | "shock" | "splat" | "wipe" | "laugh" | "smug";

export const POSES: Record<PoseName, string> = {
  idle: `${BASE}/idle.webp`,
  shock: `${BASE}/shock.webp`,
  splat: `${BASE}/splat.webp`,
  wipe: `${BASE}/wipe.webp`,
  laugh: `${BASE}/laugh.webp`,
  smug: `${BASE}/smug.webp`,
};

export const POSE_ASPECT = 384 / 768; // canvas w/h — feet sit on the bottom edge
