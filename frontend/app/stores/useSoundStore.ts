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

const musicAssets = [
  require("../../assets/music/the-return-of-the-8-bit-era-301292.mp3"),
  require("../../assets/music/jungle-ish-beat-for-video-games-314073.mp3"),
];

interface SoundState {
  isSoundOn: boolean;
  isMusicOn: boolean;
  soundEffects: { [key: string]: Sound };
  soundEffectVolume: number;
  musicVolume: number;
  currentMusic: Sound | null;
  isPlayingMusic: boolean;

  toggleSound: () => void;
  toggleMusic: () => Promise<void>;
  setSoundEffectVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  playSoundEffect: (type: string, pitchShift?: number) => Promise<void>;
  initializeSound: () => Promise<void>;
  playMusic: () => Promise<void>;
  stopMusic: () => Promise<void>;

  setCurrentMusic: (music: Sound | null) => void;
  setIsPlayingMusic: (playing: boolean) => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  isSoundOn: false,
  isMusicOn: false,
  soundEffects: {},
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

      const musicOn = musicEnabled === "true" || musicEnabled === null;

      set({
        isSoundOn: soundEnabled === "true" || soundEnabled === null,
        isMusicOn: musicOn,
        soundEffectVolume: soundVolume ? parseFloat(soundVolume) : 1,
        musicVolume: musicVolume ? parseFloat(musicVolume) : 0.5,
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

    const { currentMusic } = get();
    if (currentMusic) {
      currentMusic.setVolumeAsync(volume);
    }
  },

  playMusic: async () => {
    const { isMusicOn, musicVolume, currentMusic } = get();

    if (!isMusicOn) return;

    try {
      if (currentMusic) {
        await currentMusic.stopAsync();
        await currentMusic.unloadAsync();
      }

      const randomIndex = Math.floor(Math.random() * musicAssets.length);
      const musicAsset = musicAssets[randomIndex];

      const { sound } = await Audio.Sound.createAsync(musicAsset, {
        volume: musicVolume,
        isLooping: true,
        shouldPlay: true,
      });

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          set({ isPlayingMusic: status.isPlaying });
        }
      });

      set({ currentMusic: sound, isPlayingMusic: true });
    } catch (error) {
      console.error("Failed to play music:", error);
    }
  },

  stopMusic: async () => {
    const { currentMusic } = get();

    if (currentMusic) {
      try {
        await currentMusic.stopAsync();
        await currentMusic.unloadAsync();
      } catch (error) {
        console.error("Failed to stop music:", error);
      }
    }

    set({ currentMusic: null, isPlayingMusic: false });
  },

  playSoundEffect: async (type: string, pitchShift: number = 1.0) => {
    const { isSoundOn, soundEffectVolume } = get();

    if (
      !isSoundOn ||
      !soundEffectsData[type] ||
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
      if (get().soundEffects[type]) {
        const sound = get().soundEffects[type];
        await sound.setVolumeAsync(soundEffectVolume * (soundConfig.volume || 1.0));
        await sound.setRateAsync((soundConfig.rate || 1.0) * pitchShift, false);
        await sound.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(soundEffectsData[type], {
          volume: soundEffectVolume * (soundConfig.volume || 1.0),
          rate: (soundConfig.rate || 1.0) * pitchShift,
        });
        await sound.playAsync();
        set((state) => ({
          soundEffects: {
            ...state.soundEffects,
            [type]: sound,
          },
        }));
      }
    } catch (error) {
      console.error("Failed to play sound effect:", error);
    }
  },
}));

const soundEffectsData: { [key: string]: any } = {
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
    soundEffects,
    soundEffectVolume,
    musicVolume,
    toggleSound,
    toggleMusic,
    setSoundEffectVolume,
    setMusicVolume,
    playSoundEffect,
    playMusic,
    stopMusic,
    currentMusic,
    isPlayingMusic,
  } = useSoundStore();

  return {
    isSoundOn,
    isMusicOn,
    soundEffects,
    soundEffectVolume,
    musicVolume,
    toggleSound,
    toggleMusic,
    setSoundEffectVolume,
    setMusicVolume,
    playSoundEffect,
    playMusic,
    stopMusic,
    currentMusic,
    isPlayingMusic,
  };
};
