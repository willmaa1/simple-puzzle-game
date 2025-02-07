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
