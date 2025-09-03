import * as NounsHeads from "../configs/nouns/heads";
export const getNounsHead = (headId: number) => {
  const images = Object.values(NounsHeads);
  return images[headId] || images[0];
};
export const getNounsHeadsList = () => {
  const images = Object.values(NounsHeads);
  return images;
};
export const headsCount = Object.keys(NounsHeads).length;

import * as NounsGlasses from "../configs/nouns/glasses";
export const getNounsGlasses = (glassesId: number) => {
  const images = Object.values(NounsGlasses);
  return images[glassesId] || images[0];
};
export const getNounsGlassesList = () => {
  const images = Object.values(NounsGlasses);
  return images;
};
export const glassesCount = Object.keys(NounsGlasses).length;

import * as NounsBodies from "../configs/nouns/bodies";
export const getNounsBody = (bodyId: number) => {
  const images = Object.values(NounsBodies);
  return images[bodyId] || images[0];
};
export const getNounsBodiesList = () => {
  const images = Object.values(NounsBodies);
  return images;
};
export const bodyCount = Object.keys(NounsBodies).length;

import * as NounsAccessories from "../configs/nouns/accessories";
export const getNounsAccessories = (accessoriesId: number) => {
  const images = Object.values(NounsAccessories);
  return images[accessoriesId] || images[0];
};
export const getNounsAccessoriesList = () => {
  const images = Object.values(NounsAccessories);
  return images;
};
export const accessoriesCount = Object.keys(NounsAccessories).length;

export type NounsAttributes = {
  head: number;
  body: number;
  glasses: number;
  accessories: number;
};

const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return () => {
    hash = ((hash * 1103515245 + 12345) & 0x7fffffff);
    return hash / 0x7fffffff;
  };
};

export const getRandomNounsAttributes = (seed?: string): NounsAttributes => {
  const random = seed ? seededRandom(seed) : Math.random;
  
  const randomAttributes = {
    head: Math.floor(random() * headsCount),
    glasses: Math.floor(random() * glassesCount),
    body: Math.floor(random() * bodyCount),
    accessories: Math.floor(random() * accessoriesCount),
  };
  return randomAttributes;
};

export const createNounsAttributes = (
  head: number,
  body: number,
  glasses: number,
  accessories: number,
): NounsAttributes => {
  return {
    head,
    body,
    glasses,
    accessories,
  };
};
