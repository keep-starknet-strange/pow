import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Sound } from "expo-av/build/Audio";
import soundsJson from "../configs/sounds.json";

const SOUND_ENABLED_KEY = "sound_enabled";
const SOUND_VOLUME_KEY = "sound_volume";
const MUSIC_ENABLED_KEY = "music_enabled";
const MUSIC_VOLUME_KEY = "music_volume";

interface SoundState {
  isSoundOn: boolean;
  isMusicOn: boolean;
  soundEffectVolume: number;
  musicVolume: number;
  currentMusic: Sound | null;
  isPlayingMusic: boolean;

  toggleSound: () => void;
  toggleMusic: () => void;
  setSoundEffectVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  playSoundEffect: (type: string, pitchShift?: number) => Promise<void>;
  initializeSound: () => Promise<void>;

  setCurrentMusic: (music: Sound | null) => void;
  setIsPlayingMusic: (playing: boolean) => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  isSoundOn: false,
  isMusicOn: false,
  soundEffectVolume: 1,
  musicVolume: 0.5,
  currentMusic: null,
  isPlayingMusic: false,

  setCurrentMusic: (music) => set({ currentMusic: music }),
  setIsPlayingMusic: (playing) => set({ isPlayingMusic: playing }),

  initializeSound: async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      const soundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      const musicEnabled = await AsyncStorage.getItem(MUSIC_ENABLED_KEY);
      const soundVolume = await AsyncStorage.getItem(SOUND_VOLUME_KEY);
      const musicVolume = await AsyncStorage.getItem(MUSIC_VOLUME_KEY);

      set({
        isSoundOn: soundEnabled === "true" || soundEnabled === null,
        isMusicOn: musicEnabled === "true" || musicEnabled === null,
        soundEffectVolume: soundVolume ? parseFloat(soundVolume) : 1,
        musicVolume: musicVolume ? parseFloat(musicVolume) : 0.5,
      });
    } catch (error) {
      console.error("Failed to load sound settings:", error);
    }
  },

  toggleSound: () => {
    set((state) => {
      const newValue = !state.isSoundOn;
      AsyncStorage.setItem(SOUND_ENABLED_KEY, newValue.toString());
      return { isSoundOn: newValue };
    });
  },

  toggleMusic: () => {
    set((state) => {
      const newValue = !state.isMusicOn;
      AsyncStorage.setItem(MUSIC_ENABLED_KEY, newValue.toString());
      return { isMusicOn: newValue };
    });
  },

  setSoundEffectVolume: (volume) => {
    set({ soundEffectVolume: volume });
    AsyncStorage.setItem(SOUND_VOLUME_KEY, volume.toString());
  },

  setMusicVolume: (volume) => {
    set({ musicVolume: volume });
    AsyncStorage.setItem(MUSIC_VOLUME_KEY, volume.toString());
  },

  playSoundEffect: async (type: string, pitchShift: number = 1.0) => {
    const { isSoundOn, soundEffectVolume } = get();

    if (
      !isSoundOn ||
      !soundEffects[type] ||
      !Object.prototype.hasOwnProperty.call(soundsJson, type)
    ) {
      return;
    }

    const minPitchShift = 0.5;
    const maxPitchShift = 2.0;

    if (pitchShift < minPitchShift) {
      pitchShift = minPitchShift;
    } else if (pitchShift > maxPitchShift) {
      pitchShift = maxPitchShift;
    }

    const soundConfig = soundsJson[type as keyof typeof soundsJson];
    playHaptic(soundConfig.haptic);

    try {
      const { sound } = await Audio.Sound.createAsync(soundEffects[type], {
        volume: soundEffectVolume * (soundConfig.volume || 1.0),
        rate: (soundConfig.rate || 1.0) * pitchShift,
      });
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound effect:", error);
    }
  },
}));

const soundEffects: { [key: string]: any } = {
  MineClicked: require("../../assets/sounds/mine-clicked.mp3"),
  MineDone: require("../../assets/sounds/block-mined.mp3"),
  SequenceClicked: require("../../assets/sounds/sequence-clicked.wav"),
  SequenceDone: require("../../assets/sounds/sequence-done.wav"),
  ProveClicked: require("../../assets/sounds/prove-clicked.wav"),
  ProveDone: require("../../assets/sounds/prove-done.wav"),
  DaClicked: require("../../assets/sounds/da-clicked.wav"),
  DaDone: require("../../assets/sounds/da-done.wav"),
  ItemPurchased: require("../../assets/sounds/purchase.mp3"),
  BuyFailed: require("../../assets/sounds/buy-failed.mp3"),
  TxAdded: require("../../assets/sounds/tx-clicked.mp3"),
  AchievementCompleted: require("../../assets/sounds/achievement.mp3"),
  BasicClick: require("../../assets/sounds/basic-click.mp3"),
  SwitchPage: require("../../assets/sounds/basic-click.mp3"),
};

const playHaptic = async (type: string) => {
  switch (type) {
    case "Error":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case "Success":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case "Warning":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case "Light":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case "Medium":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case "Heavy":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case "Rigid":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      break;
    case "Soft":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      break;
    case "None":
      break;
    default:
      console.warn(`Unknown haptic type: ${type}`);
      break;
  }
};

export const useSound = () => {
  const {
    isSoundOn,
    isMusicOn,
    soundEffectVolume,
    musicVolume,
    toggleSound,
    toggleMusic,
    setSoundEffectVolume,
    setMusicVolume,
    playSoundEffect,
  } = useSoundStore();

  return {
    isSoundOn,
    isMusicOn,
    soundEffectVolume,
    musicVolume,
    toggleSound,
    toggleMusic,
    setSoundEffectVolume,
    setMusicVolume,
    playSoundEffect,
  };
};
