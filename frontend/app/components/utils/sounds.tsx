import { Audio } from "expo-av";

export let soundEffectVolume = 1;
export const setSoundEffectVolume = (volume: number) => {
  soundEffectVolume = volume;
}
export const getSoundEffectVolume = () => soundEffectVolume;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const txClickedSource = require("../../../assets/sounds/tx-clicked.mp3");
export const playTxClicked = async (isSoundOn: boolean, pitch: number) => {
  if (!isSoundOn) return;

  // TODO: Volume, pitch, loading each time, etc.
  // TODO: loadAsync instead of createAsync?
  // TODO: Move this to setup func
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: false,
  });
  const { sound } = await Audio.Sound.createAsync(txClickedSource, {
    rate: pitch + Math.random() *  0.1,
  });
  await sound.playAsync();
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mineClickedSource = require("../../../assets/sounds/mine-clicked.mp3");
export const playMineClicked = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;
  
  const { sound } = await Audio.Sound.createAsync(mineClickedSource, {
    volume: 0.4,
    rate: 1.2
  });
  await sound.playAsync();
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const blockMinedSource = require("../../../assets/sounds/block-mined.mp3");
export const playBlockMined = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;

  const { sound } = await Audio.Sound.createAsync(blockMinedSource, {
    volume: 0.7,
    rate: 1.2
  });
  await sound.playAsync();
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sequenceClickedSource = require("../../../assets/sounds/sequence-clicked.wav");
export const playSequenceClicked = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;

  const { sound } = await Audio.Sound.createAsync(sequenceClickedSource, {
    volume: 0.7,
    rate: 1.2
  });
  await sound.playAsync();
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const sequenceDoneSource = require("../../../assets/sounds/sequence-done.wav");
export const playSequenceDone = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;

  const { sound } = await Audio.Sound.createAsync(sequenceDoneSource, {
    volume: 0.7,
    rate: 1.2
  });
  await sound.playAsync();
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const proveClickedSource = require("../../../assets/sounds/prove-clicked.wav");
export const playProveClicked = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;

  const { sound } = await Audio.Sound.createAsync(proveClickedSource, {
    volume: 0.4,
    rate: 0.8
  });
  await sound.playAsync();
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const proveDoneSource = require("../../../assets/sounds/prove-done.wav");
export const playProveDone = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;

  const { sound } = await Audio.Sound.createAsync(proveDoneSource, {
    volume: 0.5,
    rate: 1
  });
  await sound.playAsync();
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const daClickedSource = require("../../../assets/sounds/da-clicked.wav");
export const playDaClicked = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;

  const { sound } = await Audio.Sound.createAsync(daClickedSource, {
    volume: 0.5,
    rate: 1.2
  });
  await sound.playAsync();
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const daDoneSource = require("../../../assets/sounds/da-done.wav");
export const playDaDone = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;

  const { sound } = await Audio.Sound.createAsync(daDoneSource, {
    volume: 0.5,
    rate: 1.2
  });
  await sound.playAsync();
}
