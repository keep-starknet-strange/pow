export const hexToInt = (hex: string): number => {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  return parseInt(hex, 16);
}
