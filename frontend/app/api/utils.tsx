export const hexToInt = (hex: string): number => {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  return parseInt(hex, 16);
}

export const getEventValue = (
  event: any | undefined,
  fallback = 0,
  index = 1
): number => {
  return event?.data?.data?.[index]
    ? hexToInt(event.data.data[index])
    : fallback;
};
