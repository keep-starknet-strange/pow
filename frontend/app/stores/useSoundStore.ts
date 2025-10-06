import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import soundsJson from "../configs/sounds.json";
import { memo, useEffect } from "react";
import { Asset } from "expo-asset";
import {
  AudioBuffer,
  AudioBufferSourceNode,
  AudioContext,
  AudioManager,
  GainNode,
} from "react-native-audio-api";
import { AppState, NativeEventSubscription } from "react-native";

const SOUND_ENABLED_KEY = "sound_enabled";
const SOUND_VOLUME_KEY = "sound_volume";
const MUSIC_ENABLED_KEY = "music_enabled";
const MUSIC_VOLUME_KEY = "music_volume";
const HAPTICS_ENABLED_KEY = "haptics_enabled";
const FIRST_LAUNCH_KEY = "has_launched_before";

const MUSIC_FILES = {
  "the-return": require("../../assets/music/the-return.m4a"),
  "busy-market": require("../../assets/music/busy-market.m4a"),
  "left-right": require("../../assets/music/left-right.m4a"),
  "super-ninja": require("../../assets/music/super-ninja.m4a"),
  "mega-wall": require("../../assets/music/mega-wall.m4a"),
  happy: require("../../assets/music/happy.m4a"),
};

const REVERT_MUSIC = require("../../assets/music/revert-theme.m4a");

type SongName = keyof typeof MUSIC_FILES;

// Sound file assets - one entry per unique sound file
const soundFileAssets = {
  "confirm.m4a": require("../../assets/sounds/confirm.m4a"),
  "complete.m4a": require("../../assets/sounds/complete.m4a"),
  "purchase.mp3": require("../../assets/sounds/purchase.mp3"),
  "basic-error.m4a": require("../../assets/sounds/basic-error.m4a"),
  "add.m4a": require("../../assets/sounds/add.m4a"),
  "achieve.m4a": require("../../assets/sounds/achieve.m4a"),
  "basic-click.m4a": require("../../assets/sounds/basic-click.m4a"),
  "dice.m4a": require("../../assets/sounds/dice.m4a"),
  "revert.m4a": require("../../assets/sounds/revert.m4a"),
};

type SoundName = keyof typeof soundFileAssets;

// Helper function to get sound file for event type from config
const getSoundNameForEvent = (eventType: string): SoundName | null => {
  const eventConfig = soundsJson[eventType as keyof typeof soundsJson];
  if (eventConfig) {
    return eventConfig.soundFile as SoundName;
  } else {
    return null;
  }
};

class SoundController {
  private audioContext: AudioContext = new AudioContext();
  private gainNode: GainNode = this.audioContext.createGain();
  private soundBuffers: Map<SoundName, AudioBuffer> = new Map();

  constructor() {
    this.gainNode.connect(this.audioContext.destination);
  }

  async setupSounds() {
    const soundNames = Object.keys(soundFileAssets).map((s) => s as SoundName);

    for (const soundName of soundNames) {
      const assetModule = soundFileAssets[soundName];
      const asset = await Asset.fromModule(assetModule).downloadAsync();

      if (asset?.localUri) {
        const audioBuffer = await this.audioContext.decodeAudioDataSource(
          asset.localUri,
        );
        this.soundBuffers.set(soundName, audioBuffer);
      }
    }
  }

  playSound(
    soundName: SoundName,
    pitchShift: number,
    soundConfig: any,
    volume: number,
  ) {
    const audioBuffer = this.soundBuffers.get(soundName);
    if (!audioBuffer) return;

    const finalVolume = Math.max(
      0,
      Math.min(1, volume * (soundConfig?.volume || 1.0)),
    );
    const finalRate = Math.max(
      0.5,
      Math.min(2.0, (soundConfig?.rate || 1.0) * pitchShift),
    );

    const duration = soundConfig.duration || 1000;
    const estimatedDuration = Math.min(duration / finalRate, 3000);

    const source = this.audioContext.createBufferSource();
    source.playbackRate.value = finalRate;
    this.gainNode.gain.value = finalVolume;
    source.buffer = audioBuffer;
    source.connect(this.gainNode);
    source.start();
    source.stop(estimatedDuration);
  }

  cleanup() {
    this.soundBuffers.clear();
    this.audioContext.close();
  }
}

class MusicController {
  private audioContext: AudioContext = new AudioContext();
  private gainNode: GainNode = this.audioContext.createGain();
  private onSongEndedCallback: (() => void) | null = null;
  private appStateSubscription: NativeEventSubscription | null = null;
  private requestedStatus: "play" | "pause" = "pause";

  private currentMusicBuffer: AudioBuffer | null = null;
  private currentMusicProgress: number = 0;
  private playingMusicNode: AudioBufferSourceNode | null = null;

  private revertAudioBuffer: AudioBuffer | null = null;
  private revertAudioNode: AudioBufferSourceNode | null = null;

  constructor() {
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 1;
  }

  async setupMusic() {
    this.revertAudioBuffer = await Asset.fromModule(REVERT_MUSIC)
      .downloadAsync()
      .then((asset) => {
        if (!asset.localUri) {
          console.error("Failed to load asset for Revert Music");
          return null;
        }

        return this.audioContext.decodeAudioDataSource(asset.localUri);
      });

    this.appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (this.requestedStatus != "play") return;

        if (nextAppState === "active") {
          this.runPlay();
        } else if (
          nextAppState === "inactive" ||
          nextAppState === "background"
        ) {
          this.runPause();
        }
      },
    );
  }

  play(delayMs?: number) {
    this.requestedStatus = "play";
    if (AppState.currentState == "active") {
      this.runPlay(delayMs);
    } else {
      console.log("Play requested but app not active");
    }
  }

  pause() {
    this.requestedStatus = "pause";
    this.runPause();
  }

  private runPlay(delayMs?: number) {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.currentMusicBuffer;
    source.onPositionChanged = (event) => {
      this.currentMusicProgress = event.value;
    };
    source.onEnded = () => {
      if (this.onSongEndedCallback) {
        this.onSongEndedCallback();
      }
    };
    source.onPositionChangedInterval = 100; // ~10Hz
    source.connect(this.gainNode);

    const delaySeconds = (delayMs ?? 0) / 1000;
    source.start(
      this.audioContext.currentTime + delaySeconds,
      this.currentMusicProgress,
    );
    this.playingMusicNode = source;
  }

  private runPause() {
    if (this.playingMusicNode) {
      this.playingMusicNode.onEnded = null;
      this.playingMusicNode.stop();
    }
  }

  setOnSongEndedCallback(onSongEndedCallback: (() => void) | null) {
    this.onSongEndedCallback = onSongEndedCallback;
  }

  async changeSong(songName: SongName) {
    this.currentMusicProgress = 0;
    this.currentMusicBuffer = await Asset.fromModule(MUSIC_FILES[songName])
      .downloadAsync()
      .then((asset) => {
        if (!asset.localUri) {
          console.error("Failed to load asset for", songName);
          return null;
        }

        return this.audioContext.decodeAudioDataSource(asset.localUri);
      });
  }

  cleanup() {
    this.appStateSubscription?.remove();
    this.currentMusicProgress = 0;
    this.currentMusicBuffer = null;
    this.revertAudioBuffer = null;
    this.onSongEndedCallback = null;
    this.playingMusicNode?.disconnect();
    this.revertAudioNode?.disconnect();
    this.audioContext.close();
  }

  set volume(volume: number) {
    this.gainNode.gain.value = volume;
  }

  async playRevertMusic() {
    this.pause();

    const source = this.audioContext.createBufferSource();
    source.buffer = this.revertAudioBuffer;
    source.loop = true;
    source.connect(this.gainNode);
    source.start();
    this.revertAudioNode = source;
  }

  stopRevertMusic() {
    if (this.revertAudioNode) {
      this.revertAudioNode.stop();
    }

    this.play();
  }
}

interface SoundState {
  musicController: MusicController;
  soundController: SoundController;

  isSoundOn: boolean;
  isMusicOn: boolean;
  isHapticsOn: boolean;
  soundEffectVolume: number;
  musicVolume: number;
  lastPlayedTracks: SongName[];
  currentTrack: SongName | null;
  isInitialized: boolean;

  toggleSound: () => void;
  toggleMusic: () => Promise<void>;
  toggleHaptics: () => void;
  setSoundEffectVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  playSoundEffect: (soundType: string, pitchShift?: number) => Promise<void>;
  initializeSound: () => Promise<void>;
  cleanupSound: () => void;
  selectNextTrack: () => void;
  startRevertMusic: () => void;
  stopRevertMusic: () => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  musicController: new MusicController(),
  soundController: new SoundController(),
  isSoundOn: false,
  isMusicOn: false,
  isHapticsOn: true,
  soundEffectVolume: 1,
  musicVolume: 0.2,
  isInitialized: false,
  currentTrack: null,
  lastPlayedTracks: [],

  initializeSound: async () => {
    AudioManager.setAudioSessionOptions({
      iosCategory: "playback",
      iosMode: "default",
      iosOptions: ["duckOthers"],
    });
    const { musicController, soundController, selectNextTrack } = get();
    const soundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
    const musicEnabled = await AsyncStorage.getItem(MUSIC_ENABLED_KEY);
    const hapticsEnabled = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
    const soundVolume = await AsyncStorage.getItem(SOUND_VOLUME_KEY);
    const musicVolume = await AsyncStorage.getItem(MUSIC_VOLUME_KEY);
    const hasLaunchedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);

    await musicController.setupMusic();
    await soundController.setupSounds();

    let selectedTrack: SongName;
    if (!hasLaunchedBefore) {
      // First launch - play "The Return"
      selectedTrack = "the-return";
      // Mark that the app has been launched before
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, "true");
    } else {
      // Returning user - select random track
      const trackNames = Object.keys(MUSIC_FILES) as SongName[];
      selectedTrack = trackNames[Math.floor(Math.random() * trackNames.length)];
    }

    musicController.setOnSongEndedCallback(() => {
      selectNextTrack();
    });
    await musicController.changeSong(selectedTrack);
    const musicOn = musicEnabled === "true" || musicEnabled === null;
    const volume = musicVolume ? parseFloat(musicVolume) : 0.5;
    musicController.volume = volume;
    if (musicOn) {
      musicController.play();
    }

    set({
      isInitialized: true,
      isSoundOn: soundEnabled === "true" || soundEnabled === null,
      isMusicOn: musicOn,
      isHapticsOn: hapticsEnabled === "true" || hapticsEnabled === null,
      soundEffectVolume: soundVolume ? parseFloat(soundVolume) : 1,
      musicVolume: volume,
      currentTrack: selectedTrack,
    });
  },

  toggleSound: () => {
    set((state) => {
      const newValue = !state.isSoundOn;
      AsyncStorage.setItem(SOUND_ENABLED_KEY, newValue.toString());
      return { isSoundOn: newValue };
    });
  },

  toggleMusic: async () => {
    set((state) => {
      const newValue = !state.isMusicOn;
      AsyncStorage.setItem(MUSIC_ENABLED_KEY, newValue.toString());
      if (newValue) {
        state.musicController.play();
      } else {
        state.musicController.pause();
      }

      return { isMusicOn: newValue };
    });
  },

  toggleHaptics: () => {
    set((state) => {
      const newValue = !state.isHapticsOn;
      AsyncStorage.setItem(HAPTICS_ENABLED_KEY, newValue.toString());
      return { isHapticsOn: newValue };
    });
  },

  setSoundEffectVolume: (volume) => {
    set({ soundEffectVolume: volume });
    AsyncStorage.setItem(SOUND_VOLUME_KEY, volume.toString());
  },

  setMusicVolume: (volume) => {
    const { musicController } = get();
    set({ musicVolume: volume });
    musicController.volume = volume;
    AsyncStorage.setItem(MUSIC_VOLUME_KEY, volume.toString());
  },

  playSoundEffect: async (
    soundType: string,
    pitchShift: number = 1.0,
  ): Promise<void> => {
    const { isSoundOn, isHapticsOn, soundEffectVolume, soundController } =
      get();

    // Get sound config once for both sound and haptics
    const soundConfig = soundsJson[soundType as keyof typeof soundsJson];
    if (!soundConfig) return;

    // Play haptic feedback independently of sound
    if (isHapticsOn && soundConfig.haptic) {
      playHaptic(soundConfig.haptic);
    }

    // Fast early returns for sound performance
    if (!isSoundOn) return;

    const soundName = getSoundNameForEvent(soundType);
    if (!soundName) return;

    // Clamp pitch shift with minimal overhead
    pitchShift = Math.max(0.5, Math.min(2.0, pitchShift));

    try {
      // Play sound with minimal overhead
      soundController.playSound(
        soundName,
        pitchShift,
        soundConfig,
        soundEffectVolume,
      );
    } catch (error) {
      // Silent error handling for performance
    }
  },

  cleanupSound: () => {
    const { musicController, soundController } = get();

    soundController.cleanup();
    musicController.cleanup();
  },

  selectNextTrack: async () => {
    const { musicController, isMusicOn, currentTrack, lastPlayedTracks } =
      get();

    // // Get all track names
    const allTracks = Object.keys(MUSIC_FILES) as SongName[];

    if (currentTrack) {
      lastPlayedTracks.push(currentTrack);
    }

    // Keep track of last 2 played tracks to avoid immediate repeats
    const recentTracks = lastPlayedTracks.slice(-2);

    // Filter out recently played tracks
    let availableTracks = allTracks.filter(
      (track) => !recentTracks.includes(track),
    );

    if (availableTracks.length == 0) {
      availableTracks = allTracks;
    }

    // Select random track from available tracks
    const nextTrack =
      availableTracks[Math.floor(Math.random() * availableTracks.length)];

    await musicController.changeSong(nextTrack);
    if (isMusicOn) {
      const delay = 2000 + 1000 * Math.random();
      musicController.play(delay);
    }

    set({
      currentTrack: nextTrack,
      lastPlayedTracks: recentTracks,
    });
  },

  startRevertMusic: () => {
    const { isMusicOn, musicController } = get();
    if (!isMusicOn) return;

    musicController.playRevertMusic();
  },

  stopRevertMusic: () => {
    const { isMusicOn, musicController } = get();
    if (!isMusicOn) return;

    musicController.stopRevertMusic();
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
      if (__DEV__) console.warn(`Unknown haptic type: ${type}`);
      break;
  }
};

export const useSound = () => {
  const {
    isSoundOn,
    isMusicOn,
    isHapticsOn,
    soundEffectVolume,
    musicVolume,
    toggleSound,
    toggleMusic,
    toggleHaptics,
    setSoundEffectVolume,
    setMusicVolume,
    playSoundEffect,
    cleanupSound,
    startRevertMusic,
    stopRevertMusic,
  } = useSoundStore();

  return {
    isSoundOn,
    isMusicOn,
    isHapticsOn,
    soundEffectVolume,
    musicVolume,
    toggleSound,
    toggleMusic,
    toggleHaptics,
    setSoundEffectVolume,
    setMusicVolume,
    playSoundEffect,
    cleanupSound,
    startRevertMusic,
    stopRevertMusic,
  };
};

export const MusicComponent = memo(() => {
  const { initializeSound, cleanupSound } = useSoundStore();

  useEffect(() => {
    initializeSound();

    return () => {
      cleanupSound();
    };
  }, []);

  return null;
});
