import { pathJoin } from "./utils.js";

let customImages = [];

export const defaultImg = "Balloons.jpg";

const customImagePath = "/custompuzzles"

export function loadCustomImages() {
  customImages = [];
  fetch(customImagePath)
    .then((resp) => resp.json())
    .then((resp) => {
      for (const file of resp) {
        if (file.match(/\.(jpe?g|png|webp)$/i) ) {
            customImages.push(pathJoin([customImagePath, file]));
        }
      }
      console.log("Custom images:", customImages);
    })
    .catch((reason) => {
      alert(`Fetching custom puzzles failed. ${reason}`);
    });
}

export function maxCustomImage() {
  return customImages.length - 1;
}

export function getCustomImage(index = -1) {
  if (customImages.length === 0) {
    alert("No custom images");
    return {src: "", index: -1};
  }
  
  if (index === -1) {
    index = Math.floor(Math.random()*customImages.length);
  }
  index = Math.max(0, Math.min(customImages.length-1, index));
  return {src: customImages[index], index: index};
}
