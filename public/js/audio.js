import { assetsPath, pathJoin } from "./utils.js";

const defaultSnapSound = "snap.ogg";
const defaultCompleteSound = "snap3.ogg";
const defaultSnapAudio = new Audio(pathJoin([assetsPath, defaultSnapSound]));
const defaultCompleteAudio = new Audio(pathJoin([assetsPath, defaultCompleteSound]));
defaultSnapAudio.preload = "auto";
defaultCompleteAudio.preload = "auto";

const customsnapPath = "/snap"
const customcompletePath = "/complete"
let customSnaps = [];
let customCompletes = [];
let snapAudio = defaultSnapAudio;
let completeAudio = defaultCompleteAudio;

export function playSnap() {
  if (customSnaps.length > 0) {
    let oldSnapAudio = snapAudio;
    snapAudio = customSnaps[Math.floor(Math.random()*customSnaps.length)];
    if (customSnaps.length > 1) {
      while (oldSnapAudio === snapAudio) {
        snapAudio = customSnaps[Math.floor(Math.random()*customSnaps.length)];
      }
    }
  } else {
    snapAudio = defaultSnapAudio;
  }
  // Reset in case previous still playing
  snapAudio.currentTime = 0;
  snapAudio.play();
}

export function playComplete() {
  if (customCompletes.length > 0) {
    completeAudio = customCompletes[Math.floor(Math.random()*customCompletes.length)];
  } else {
    completeAudio = defaultCompleteAudio;
  }
  // Reset in case previous still playing
  completeAudio.currentTime = 0;
  completeAudio.play();
}

export function loadCustomSounds() {
  customSnaps = [];
  fetch(customsnapPath)
    .then((resp) => resp.json())
    .then((resp) => {
      for (const file of resp) {
        if (file.match(/\.(mp4|ogg|mp3|wav)$/i) ) {
          let newCustomSnap = new Audio(pathJoin([customsnapPath, file]));
          newCustomSnap.preload = "auto";
          customSnaps.push(newCustomSnap);
        }
      }
      console.log("Custom snaps:", customSnaps);
    })
    .catch((reason) => {
      alert(`Fetching custom snap failed. ${reason}`);
    });
  
  customCompletes = [];
  fetch(customcompletePath)
    .then((resp) => resp.json())
    .then((resp) => {
      for (const file of resp) {
        if (file.match(/\.(mp4|ogg|mp3|wav)$/i) ) {
          let newCustomComplete = new Audio(pathJoin([customcompletePath, file]));
          newCustomComplete.preload = "auto";
          customCompletes.push(newCustomComplete);
        }
      }
      console.log("Custom completes:", customCompletes);
    })
    .catch((reason) => {
      alert(`Fetching custom completes failed. ${reason}`);
    });
}
