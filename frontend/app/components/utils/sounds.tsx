import { Audio } from "expo-av";

export let soundEffectVolume = 1;
export const setSoundEffectVolume = (volume: number) => {
  soundEffectVolume = volume;
}
export const getSoundEffectVolume = () => soundEffectVolume;

const txClickedSource = require("../../../assets/sounds/tx-clicked.wav");
export const playTxClicked = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;

  // TODO: Volume, pitch, loading each time, etc.
  // TODO: Move this to setup func
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: false,
  });
  const { sound } = await Audio.Sound.createAsync(txClickedSource);
  await sound.playAsync();
}

const mineClickedSource = require("../../../assets/sounds/mine-clicked.wav");
export const playMineClicked = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;
  
  const { sound } = await Audio.Sound.createAsync(mineClickedSource);
  await sound.playAsync();
}
