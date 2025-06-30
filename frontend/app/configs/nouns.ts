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

export const getRandomNounsAttributes = (): NounsAttributes => {
  const randomAttributes = {
    head: Math.floor(Math.random() * headsCount),
    glasses: Math.floor(Math.random() * glassesCount),
    body: Math.floor(Math.random() * bodyCount),
    accessories: Math.floor(Math.random() * accessoriesCount),
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
