// Engine feel constants — tune these first when the throw doesn't feel right.
export const FEEL = {
  gravity: 14, // world units/s^2 — slightly heavier than earth reads "snappier"
  launchPos: [0, 0.9, 1.0] as [number, number, number],
  targetZ: -2.8, // character stands here
  // flick mapping: screen drag (px, px/ms) -> world velocity
  forwardBase: 7.5,
  forwardPerSpeed: 11, // * flick speed (px/ms)
  forwardMax: 20,
  lateralPerPx: 0.015, // vx per horizontal drag px
  liftBase: 3.2,
  liftPerPx: 0.022, // vy per upward drag px
  liftMax: 8.5,
  minFlickSpeed: 0.25, // px/ms below which the flick is ignored
  pieRadius: 0.32,
  pieSpin: 9,
  maxFlightTime: 2.2,
  // collision zones (character local, group origin at feet; full-body figure ~2.55 tall)
  headCenter: [0, 2.18, 0] as [number, number, number],
  headRadius: 0.38,
  bodyTop: 1.85,
  bodyBottom: 0.1,
  bodyRadius: 0.5,
};

// Pricing: arcade-token model. Cheap per-pie (low pain-of-paying, high play
// volume) but sold in packs so pledge transactions stay reconciliation-friendly.
// Bigger packs carry bonus pies. Final call is Teresa/chairperson's.
export const PRICING = {
  perPie: 1,
  bundles: [
    { pies: 5, price: 5, bonus: 0 },
    { pies: 12, price: 10, bonus: 2 },
    { pies: 30, price: 20, bonus: 10 },
  ],
};

export const FLAGS = {
  negativePies: true,
  showDonorNamesInFeed: true,
  individualLeaderboard: false, // HARD OFF — do not build (worthiness indicator light)
};
