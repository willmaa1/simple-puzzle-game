export const assetsPath = "../assets"

export function pathJoin(parts, sep){
  const separator = sep || '/';
  const replace   = new RegExp(separator+'{1,}', 'g');
  return parts.join(separator).replace(replace, separator);
}