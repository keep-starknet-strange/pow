import { Audio } from "expo-av";
import txClickedSource from "../../../assets/sounds/tx-clicked.mp3";
import mineClickedSource from "../../../assets/sounds/mine-clicked.mp3";
import blockMinedSource from "../../../assets/sounds/block-mined.mp3";

export let soundEffectVolume = 1;
export const setSoundEffectVolume = (volume: number) => {
  soundEffectVolume = volume;
}
export const getSoundEffectVolume = () => soundEffectVolume;

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
  const { sound } = await Audio.Sound.createAsync({ uri: txClickedSource }, {
      rate: pitch + Math.random() *  0.1,
    });
  await sound.playAsync();
}

export const playMineClicked = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;
  
  const { sound } = await Audio.Sound.createAsync({ uri: mineClickedSource }, {
      volume: 0.4,
      rate: 1.2
    });
  await sound.playAsync();
}

export const playBlockMined = async (isSoundOn: boolean) => {
  if (!isSoundOn) return;

  const { sound } = await Audio.Sound.createAsync({ uri: blockMinedSource }, {
      volume: 0.7,
      rate: 1.2
    });
  await sound.playAsync();
}
