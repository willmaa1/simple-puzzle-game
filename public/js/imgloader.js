import { pathJoin } from "./utils.js";

let customImages = [];

export const defaultImg = "Balloons.jpg";

const customImagePath = "/custompuzzles"

export function loadCustomImages() {
  fetch(customImagePath)
    .then((resp) => resp.json())
    .then((resp) => {
      for (const file of resp) {
        if (file.match(/\.(jpe?g|png|webp)$/i) ) {
            customImages.push(pathJoin([customImagePath, file]));
        }
      }
    })
    .catch((reason) => {
      alert(`Fetching custom puzzles failed. ${reason}`);
    });
  console.log("Custom images:", customImages);
}

export function getRandomCustomImage() {
  return customImages.length === 0 ? "" : customImages[Math.floor(Math.random()*customImages.length)];
}