import { assetsPath, pathJoin } from "./utils.js";

const snapSound = "snap.ogg";

export function playSnap() {
  const snapAudio = new Audio(pathJoin([assetsPath, snapSound]));
  // snapAudio.currentTime = 0.01;
  snapAudio.play();
}