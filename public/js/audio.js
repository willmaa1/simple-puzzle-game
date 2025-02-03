import { assetsPath, pathJoin } from "./utils.js";

const snapSound = "snap.ogg";
const snapAudio = new Audio(pathJoin([assetsPath, snapSound]));
snapAudio.preload = "auto";

export function playSnap() {
  // Reset in case previous still playing
  snapAudio.currentTime = 0;
  snapAudio.play();
}