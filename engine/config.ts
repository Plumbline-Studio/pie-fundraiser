// Engine feel constants — tune these first when the throw doesn't feel right.
export const FEEL = {
  gravity: 14, // world units/s^2 — slightly heavier than earth reads "snappier"
  launchPos: [0, 1.1, 4.5] as [number, number, number],
  targetZ: -4.2, // character stands here
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
  // collision zones (character local, group origin at feet)
  headCenter: [0, 2.05, 0] as [number, number, number],
  headRadius: 0.48,
  bodyTop: 1.62,
  bodyBottom: 0.35,
  bodyRadius: 0.55,
};

export const PRICING = { perPie: 5 }; // demo pricing: $5/pie

export const FLAGS = {
  negativePies: true,
  showDonorNamesInFeed: true,
  individualLeaderboard: false, // HARD OFF — do not build (worthiness indicator light)
};
