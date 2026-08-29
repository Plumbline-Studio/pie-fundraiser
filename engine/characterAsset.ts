// Stylized demo character — background-removed render, 472x720 webp.
// Split across two chunk modules to fit remote-push size limits; replace with
// a real file in public/characters/<slug>/ once local git workflow is running.
import { P1 } from "./characterAssetP1";
import { P2 } from "./characterAssetP2";

export const STYLIZED_DATA_URL = "data:image/webp;base64," + P1 + P2;
