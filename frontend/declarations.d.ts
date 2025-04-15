declare module "*.mp3" {
  const src: string;
  export default src;
}
declare module ".wav" {
  const src: string;
  export default src;
}
declare module "*.png" {
  const src: ImageSourcePropType;
  export default src;
}
declare module "*.jpeg" {
  const src: ImageSourcePropType;
  export default src;
}