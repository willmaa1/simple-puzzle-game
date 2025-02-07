export const assetsPath = "../assets"

export function pathJoin(parts, sep){
  const separator = sep || '/';
  const replace   = new RegExp(separator+'{1,}', 'g');
  return parts.join(separator).replace(replace, separator);
}

// Extract a number from a string ending with 'px'.
export function removePx(pxString) {
  return Number(pxString.slice(0,-2));
}

// Idea from https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript/49837149#49837149
export function getAverageRBG(img) {
  const context = document.createElement('canvas').getContext('2d');
  context.imageSmoothingEnabled = true;
  context.drawImage(img, 0, 0, 1, 1);
  return context.getImageData(0, 0, 1, 1).data.slice(0,3);
}