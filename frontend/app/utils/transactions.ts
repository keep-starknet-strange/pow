export const getRandomAddress = () =>
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const getRandomFromArray = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
