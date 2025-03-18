export const calculateWidthPercentage = (gridSize: number, gapSizePx: number, containerSizePx: number) => {
  const totalGap = (gridSize - 1) * gapSizePx;
  return ((containerSizePx - totalGap) / gridSize / containerSizePx) * 100;
};
