import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import soundsJson from "../configs/sounds.json";

const SOUND_ENABLED_KEY = "sound_enabled";
const SOUND_VOLUME_KEY = "sound_volume";
const MUSIC_ENABLED_KEY = "music_enabled";
const MUSIC_VOLUME_KEY = "music_volume";

const musicAssets: { [key: string]: any } = {
  "The Return": require("../../assets/music/the-return-of-the-8-bit-era-301292.mp3"),
  "Jungle Beat": require("../../assets/music/jungle-ish-beat-for-video-games-314073.mp3"),
};

const soundEffectsAssets: { [key: string]: any } = {
  MineClicked: require("../../assets/sounds/confirm.wav"),
  MineDone: require("../../assets/sounds/complete.wav"),
  SequenceClicked: require("../../assets/sounds/confirm.wav"),
  SequenceDone: require("../../assets/sounds/complete.wav"),
  ProveClicked: require("../../assets/sounds/confirm.wav"),
  ProveDone: require("../../assets/sounds/complete.wav"),
  DaClicked: require("../../assets/sounds/confirm.wav"),
  DaDone: require("../../assets/sounds/complete.wav"),
  ItemPurchased: require("../../assets/sounds/purchase.mp3"),
  BuyFailed: require("../../assets/sounds/basic-error.wav"),
  InvalidPurchase: require("../../assets/sounds/basic-error.wav"),
  BlockFull: require("../../assets/sounds/basic-error.wav"),
  TxAdded: require("../../assets/sounds/add.wav"),
  AchievementCompleted: require("../../assets/sounds/achieve.wav"),
  BasicClick: require("../../assets/sounds/basic-click.wav"),
  BasicError: require("../../assets/sounds/basic-error.wav"),
  SwitchPage: require("../../assets/sounds/basic-click.wav"),
  DiceRoll: require("../../assets/sounds/dice.wav"),
};

interface SoundState {
  isSoundOn: boolean;
  isMusicOn: boolean;
  soundEffectVolume: number;
  musicVolume: number;
  musicPlayer: AudioPlayer | null;

  toggleSound: () => void;
  toggleMusic: () => Promise<void>;
  setSoundEffectVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  playSoundEffect: (type: string, pitchShift?: number) => Promise<void>;
  initializeSound: () => Promise<void>;
  playMusic: () => Promise<void>;
  stopMusic: () => Promise<void>;

  cleanupSound: () => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  isSoundOn: false,
  isMusicOn: false,
  soundEffectVolume: 1,
  musicVolume: 0.2,
  musicPlayer: null,

  initializeSound: async () => {
    try {
      const soundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      const musicEnabled = await AsyncStorage.getItem(MUSIC_ENABLED_KEY);
      const soundVolume = await AsyncStorage.getItem(SOUND_VOLUME_KEY);
      const musicVolume = await AsyncStorage.getItem(MUSIC_VOLUME_KEY);

      const musicOn = musicEnabled === "true" || musicEnabled === null;
      const musicAsset = musicAssets["The Return"];
      const musicPlayer = createAudioPlayer(musicAsset);
      musicPlayer.volume = musicVolume ? parseFloat(musicVolume) : 0.5;

      set({
        isSoundOn: soundEnabled === "true" || soundEnabled === null,
        isMusicOn: musicOn,
        soundEffectVolume: soundVolume ? parseFloat(soundVolume) : 1,
        musicVolume: musicVolume ? parseFloat(musicVolume) : 0.5,
        musicPlayer: musicPlayer,
      });

      if (musicOn) {
        get().playMusic();
      }
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

  toggleMusic: async () => {
    const currentState = get();
    const newValue = !currentState.isMusicOn;
    set({ isMusicOn: newValue });
    AsyncStorage.setItem(MUSIC_ENABLED_KEY, newValue.toString());

    if (newValue) {
      await get().playMusic();
    } else {
      await get().stopMusic();
    }
  },

  setSoundEffectVolume: (volume) => {
    set({ soundEffectVolume: volume });
    AsyncStorage.setItem(SOUND_VOLUME_KEY, volume.toString());
  },

  setMusicVolume: (volume) => {
    set({ musicVolume: volume });
    AsyncStorage.setItem(MUSIC_VOLUME_KEY, volume.toString());

    const { musicPlayer } = get();
    if (!musicPlayer) {
      console.warn("Music player is not initialized.");
      return;
    }
    musicPlayer.volume = volume;
  },

  playMusic: async () => {
    const { isMusicOn, musicPlayer } = get();

    if (!isMusicOn) return;

    try {
      if (!musicPlayer) {
        console.warn("Music player is not initialized.");
        return;
      }

      const randomSong = musicAssets[
        Object.keys(musicAssets)[
          Math.floor(Math.random() * Object.keys(musicAssets).length)
        ]
      ];
      musicPlayer.replace(randomSong);
      musicPlayer.volume = get().musicVolume;
      musicPlayer.seekTo(0);
      musicPlayer.play();
    } catch (error) {
      console.error("Failed to play music:", error);
    }
  },

  stopMusic: async () => {
    const { musicPlayer } = get();

    if (musicPlayer) {
      try {
        musicPlayer.pause();
      } catch (error) {
        console.error("Failed to stop music:", error);
      }
    }
  },

  playSoundEffect: async (type: string, pitchShift: number = 1.0) => {
    const { isSoundOn, soundEffectVolume } = get();

    if (
      !isSoundOn ||
      !soundEffectsAssets[type] ||
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

    /*
    const soundConfig = soundsJson[type as keyof typeof soundsJson];
    playHaptic(soundConfig.haptic);

    try {
      const soundPlayer = createAudioPlayer(soundEffectsAssets[type]);
      soundPlayer.shouldCorrectPitch = true;
      soundPlayer.volume = soundEffectVolume * (soundConfig.volume || 1.0);
      soundPlayer.setPlaybackRate((soundConfig.rate || 1.0) * pitchShift);
      soundPlayer.seekTo(0);
      soundPlayer.play();
      setTimeout(() => {
        soundPlayer.pause();
        soundPlayer.release();
      }, 1000);
    } catch (error) {
      console.error("Failed to play sound effect:", error);
    }
    */
  },

  cleanupSound: () => {
    const { musicPlayer } = get();
    if (musicPlayer) {
      try {
        musicPlayer.pause();
        musicPlayer.release();
        set({ musicPlayer: null });
      } catch (error) {
        console.warn("Failed to cleanup sound:", error);
      }
    }
  },
}));

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
    playMusic,
    stopMusic,
    cleanupSound,
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
    playMusic,
    stopMusic,
    cleanupSound,
  };
};
