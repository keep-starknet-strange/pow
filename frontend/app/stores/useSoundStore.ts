import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import soundsJson from "../configs/sounds.json";
import soundPoolsJson from "../configs/soundpools.json";

const SOUND_ENABLED_KEY = "sound_enabled";
const SOUND_VOLUME_KEY = "sound_volume";
const MUSIC_ENABLED_KEY = "music_enabled";
const MUSIC_VOLUME_KEY = "music_volume";

const musicAssets: { [key: string]: any } = {
  "The Return": require("../../assets/music/the-return-of-the-8-bit-era-301292.m4a"),
  "Jungle Beat": require("../../assets/music/jungle-ish-beat-for-video-games-314073.m4a"),
};

// Sound file assets - one entry per unique sound file
const soundFileAssets: { [key: string]: any } = {
  "confirm.m4a": require("../../assets/sounds/confirm.m4a"),
  "complete.m4a": require("../../assets/sounds/complete.m4a"),
  "purchase.mp3": require("../../assets/sounds/purchase.mp3"),
  "basic-error.m4a": require("../../assets/sounds/basic-error.m4a"),
  "add.m4a": require("../../assets/sounds/add.m4a"),
  "achieve.m4a": require("../../assets/sounds/achieve.m4a"),
  "basic-click.m4a": require("../../assets/sounds/basic-click.m4a"),
  "dice.m4a": require("../../assets/sounds/dice.m4a"),
};

// Helper function to get sound file for event type from config
const getSoundFileForEvent = (eventType: string): string | null => {
  const eventConfig = soundsJson[eventType as keyof typeof soundsJson];
  return eventConfig?.soundFile || null;
};

// Simple sound pool optimized for high-frequency game sounds
class SoundPool {
  private soundPlayers: Map<string, AudioPlayer[]> = new Map();
  private currentIndex: Map<string, number> = new Map();

  constructor() {
    // Create sound pools per sound file using configured pool sizes from soundpools.json
    Object.keys(soundFileAssets).forEach((soundFile) => {
      const poolSize =
        soundPoolsJson[soundFile as keyof typeof soundPoolsJson] || 3; // Default to 3 if not specified

      const players: AudioPlayer[] = [];
      for (let i = 0; i < poolSize; i++) {
        const player = createAudioPlayer(soundFileAssets[soundFile]);
        player.shouldCorrectPitch = true; // Enable pitch correction
        players.push(player);
      }
      this.soundPlayers.set(soundFile, players);
      this.currentIndex.set(soundFile, 0);
    });
  }

  playSound(
    eventType: string,
    pitchShift: number,
    soundConfig: any,
    volume: number,
  ): void {
    // Get the sound file for this event type
    const soundFile = getSoundFileForEvent(eventType);
    if (!soundFile) return;

    const players = this.soundPlayers.get(soundFile);
    if (!players) return;

    // Get the next player in round-robin fashion
    const currentIdx = this.currentIndex.get(soundFile) || 0;
    const player = players[currentIdx];

    // Update index for next time (round-robin within the pool for this sound file)
    this.currentIndex.set(soundFile, (currentIdx + 1) % players.length);

    try {
      // Simple, fast configuration
      player.volume = volume * (soundConfig.volume || 1.0);
      player.setPlaybackRate((soundConfig.rate || 1.0) * pitchShift);
      player.seekTo(0);
      player.play();

      // Simple cleanup - no tracking needed
      setTimeout(() => {
        try {
          player.pause();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }, 2000);
    } catch (error) {
      // Silently ignore errors to maintain performance
    }
  }

  cleanup() {
    this.soundPlayers.forEach((players) => {
      players.forEach((player) => {
        try {
          player.pause();
          player.release();
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    });
    this.soundPlayers.clear();
    this.currentIndex.clear();
  }
}

interface SoundState {
  isSoundOn: boolean;
  isMusicOn: boolean;
  soundEffectVolume: number;
  musicVolume: number;
  musicPlayer: AudioPlayer | null;
  soundPool: SoundPool | null;

  toggleSound: () => void;
  toggleMusic: () => Promise<void>;
  setSoundEffectVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  playSoundEffect: (soundType: string, pitchShift?: number) => Promise<void>;
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
  soundPool: null,

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
        soundPool: new SoundPool(), // Initialize sound pool
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

      const randomSong =
        musicAssets[
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

  playSoundEffect: async (
    soundType: string,
    pitchShift: number = 1.0,
  ): Promise<void> => {
    const { isSoundOn, soundEffectVolume, soundPool } = get();

    // Fast early returns for performance
    if (!isSoundOn || !soundPool || !getSoundFileForEvent(soundType)) {
      return;
    }

    // Clamp pitch shift with minimal overhead
    pitchShift = Math.max(0.5, Math.min(2.0, pitchShift));

    try {
      const soundConfig = soundsJson[soundType as keyof typeof soundsJson];
      if (!soundConfig) return;

      // Play haptic feedback
      playHaptic(soundConfig.haptic);

      // Play sound with minimal overhead
      soundPool.playSound(
        soundType,
        pitchShift,
        soundConfig,
        soundEffectVolume,
      );
    } catch (error) {
      // Silent error handling for performance
    }
  },

  cleanupSound: () => {
    const { musicPlayer, soundPool } = get();
    if (musicPlayer) {
      try {
        musicPlayer.pause();
        musicPlayer.release();
        set({ musicPlayer: null });
      } catch (error) {
        console.warn("Failed to cleanup music player:", error);
      }
    }
    if (soundPool) {
      soundPool.cleanup();
      set({ soundPool: null });
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
