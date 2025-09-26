import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AudioPlayer,
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import soundsJson from "../configs/sounds.json";
import soundPoolsJson from "../configs/soundpools.json";
import { memo, useEffect } from "react";

const SOUND_ENABLED_KEY = "sound_enabled";
const SOUND_VOLUME_KEY = "sound_volume";
const MUSIC_ENABLED_KEY = "music_enabled";
const MUSIC_VOLUME_KEY = "music_volume";
const HAPTICS_ENABLED_KEY = "haptics_enabled";
const FIRST_LAUNCH_KEY = "has_launched_before";

const MUSIC_ASSETS = {
  "The Return": require("../../assets/music/the-return-of-the-8-bit-era-301292.m4a"),
  "Busy Market": require("../../assets/music/Busy Day At The Market-LOOP.m4a"),
  "Left Right": require("../../assets/music/LeftRightExcluded.m4a"),
  "Super Ninja": require("../../assets/music/Ove Melaa - Super Ninja Assasin.m4a"),
  "Mega Wall": require("../../assets/music/awake10_megaWall.m4a"),
  Happy: require("../../assets/music/happy.m4a"),
};

const REVERT_MUSIC = require("../../assets/music/revert-theme.m4a");

type SongName = keyof typeof MUSIC_ASSETS;

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
  "revert.m4a": require("../../assets/sounds/revert.m4a"),
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
  private activeTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();
  private isDestroyed: boolean = false;

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
    // Early return if pool is destroyed
    if (this.isDestroyed) return;

    // Get the sound file for this event type
    const soundFile = getSoundFileForEvent(eventType);
    if (!soundFile) return;

    const players = this.soundPlayers.get(soundFile);
    if (!players || players.length === 0) return;

    // Get the next player in round-robin fashion
    const currentIdx = this.currentIndex.get(soundFile) || 0;
    const player = players[currentIdx];

    // Validate player exists and is not null
    if (!player) {
      if (__DEV__)
        console.warn(
          `Audio player is null for ${soundFile} at index ${currentIdx}`,
        );
      return;
    }

    // Update index for next time (round-robin within the pool for this sound file)
    this.currentIndex.set(soundFile, (currentIdx + 1) % players.length);

    try {
      // Validate player state before operations
      if (this.isDestroyed || !player) return;

      // Simple, fast configuration with null checks
      const finalVolume = Math.max(
        0,
        Math.min(1, volume * (soundConfig?.volume || 1.0)),
      );
      const finalRate = Math.max(
        0.5,
        Math.min(2.0, (soundConfig?.rate || 1.0) * pitchShift),
      );

      player.volume = finalVolume;
      player.setPlaybackRate(finalRate);
      player.seekTo(0);
      player.play();

      // Cleanup after sound duration with proper timeout tracking
      const duration = soundConfig.duration || 1000;
      const playbackRate = (soundConfig.rate || 1.0) * pitchShift;
      const estimatedDuration = Math.min(duration / playbackRate, 3000);

      const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
        this.activeTimeouts.delete(timeoutId);
        if (!this.isDestroyed) {
          try {
            player.pause();
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      }, estimatedDuration + 100);

      this.activeTimeouts.add(timeoutId);
    } catch (error) {
      // Log errors in development but don't crash
      if (__DEV__) {
        console.warn(
          `Failed to play sound ${eventType} (${soundFile}):`,
          error,
        );
      }
    }
  }

  cleanup() {
    // Create a copy of the map to avoid iterator issues during cleanup
    const playersToCleanup = Array.from(this.soundPlayers.entries());

    playersToCleanup.forEach(([soundFile, players]) => {
      players.forEach((player, index) => {
        try {
          // Ensure player is stopped before release
          if (player.playing) {
            player.pause();
          }
          // Small delay to ensure pause completes before release
          setTimeout(() => {
            try {
              player.release();
            } catch (releaseError) {
              if (__DEV__)
                console.warn(
                  `Failed to release audio player ${index} for ${soundFile}:`,
                  releaseError,
                );
            }
          }, 50);
        } catch (error) {
          if (__DEV__)
            console.warn(
              `Failed to cleanup audio player ${index} for ${soundFile}:`,
              error,
            );
        }
      });
    });

    // Cancel all active timeouts to prevent operations on destroyed pool
    this.activeTimeouts.forEach((timeoutId: ReturnType<typeof setTimeout>) => {
      clearTimeout(timeoutId);
    });
    this.activeTimeouts.clear();

    // Mark as destroyed to prevent further operations
    this.isDestroyed = true;

    // Clear maps after a delay to ensure all releases complete
    setTimeout(() => {
      this.soundPlayers.clear();
      this.currentIndex.clear();
    }, 100);
  }
}

interface SoundState {
  isSoundOn: boolean;
  isMusicOn: boolean;
  isHapticsOn: boolean;
  soundEffectVolume: number;
  soundPool: SoundPool | null;
  musicVolume: number;
  lastPlayedTracks: SongName[];
  currentTrack: SongName | null;
  isPlayingRevertMusic: boolean;
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
  isSoundOn: false,
  isMusicOn: false,
  isHapticsOn: true,
  soundEffectVolume: 1,
  musicVolume: 0.2,
  soundPool: null,
  isInitialized: false,
  currentTrack: null,
  isPlayingRevertMusic: false,
  lastPlayedTracks: [],

  initializeSound: async () => {
    const soundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
    const musicEnabled = await AsyncStorage.getItem(MUSIC_ENABLED_KEY);
    const hapticsEnabled = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
    const soundVolume = await AsyncStorage.getItem(SOUND_VOLUME_KEY);
    const musicVolume = await AsyncStorage.getItem(MUSIC_VOLUME_KEY);
    const hasLaunchedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);

    let selectedTrack: SongName;
    if (!hasLaunchedBefore) {
      // First launch - play "The Return"
      selectedTrack = "The Return";
      // Mark that the app has been launched before
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, "true");
    } else {
      // Returning user - select random track
      const trackNames = Object.keys(MUSIC_ASSETS) as SongName[];
      selectedTrack = trackNames[Math.floor(Math.random() * trackNames.length)];
    }

    set({
      isInitialized: true,
      isSoundOn: soundEnabled === "true" || soundEnabled === null,
      isMusicOn: musicEnabled === "true" || musicEnabled === null,
      isHapticsOn: hapticsEnabled === "true" || hapticsEnabled === null,
      soundEffectVolume: soundVolume ? parseFloat(soundVolume) : 1,
      musicVolume: musicVolume ? parseFloat(musicVolume) : 0.5,
      soundPool: new SoundPool(),
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
    set({ musicVolume: volume });
    AsyncStorage.setItem(MUSIC_VOLUME_KEY, volume.toString());
  },

  playSoundEffect: async (
    soundType: string,
    pitchShift: number = 1.0,
  ): Promise<void> => {
    const { isSoundOn, isHapticsOn, soundEffectVolume, soundPool } = get();

    // Get sound config once for both sound and haptics
    const soundConfig = soundsJson[soundType as keyof typeof soundsJson];
    if (!soundConfig) return;

    // Play haptic feedback independently of sound
    if (isHapticsOn && soundConfig.haptic) {
      playHaptic(soundConfig.haptic);
    }

    // Fast early returns for sound performance
    if (!isSoundOn || !soundPool || !getSoundFileForEvent(soundType)) {
      return;
    }

    // Clamp pitch shift with minimal overhead
    pitchShift = Math.max(0.5, Math.min(2.0, pitchShift));

    try {
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
    const { soundPool } = get();

    // Clean up sound pool
    if (soundPool) {
      soundPool.cleanup();
      set({ soundPool: null });
    }
  },

  selectNextTrack: () => {
    const { currentTrack, lastPlayedTracks } = get();

    // // Get all track names
    const allTracks = Object.keys(MUSIC_ASSETS) as SongName[];

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

    set({
      currentTrack: nextTrack,
      lastPlayedTracks: recentTracks,
    });
  },

  startRevertMusic: () => {
    const { isMusicOn } = get();
    if (!isMusicOn) return;

    set({ isPlayingRevertMusic: true });
  },

  stopRevertMusic: () => {
    const { isMusicOn } = get();
    if (!isMusicOn) return;

    set({ isPlayingRevertMusic: false });
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
    isPlayingRevertMusic,
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
    isPlayingRevertMusic,
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
  const {
    isMusicOn,
    currentTrack,
    musicVolume,
    initializeSound,
    selectNextTrack: selectNextTrack,
    isPlayingRevertMusic,
  } = useSoundStore();

  useEffect(() => {
    // Configure global audio mode to play sounds even in iOS silent mode
    console.log("Starting Audio setup");
    setAudioModeAsync({ playsInSilentMode: true });
    console.log("Audio setup is complete");
    
    initializeSound();
  }, []);

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const revertPlayer = useAudioPlayer(REVERT_MUSIC);
  const revertStatus = useAudioPlayerStatus(revertPlayer);

  // Toggle Music
  useEffect(() => {
    if (status.isLoaded && isMusicOn) {
      player.play();
    } else if (!isMusicOn && status.playing) {
      player.pause();
    }
  }, [status.isLoaded, isMusicOn, player]);

  // Toggle Revert Music
  useEffect(() => {
    if (revertStatus.isLoaded && isMusicOn && isPlayingRevertMusic) {
      player.pause();
      revertPlayer.seekTo(0);
      revertPlayer.play();
    } else if ((!isMusicOn || !isPlayingRevertMusic) && revertStatus.playing) {
      revertPlayer.pause();
      if (isMusicOn) {
        player.play();
      }
    }
  }, [
    revertStatus.isLoaded,
    isMusicOn,
    isPlayingRevertMusic,
    revertPlayer,
    player,
  ]);

  // Select next track, when previous one finished
  useEffect(() => {
    if (status.didJustFinish) {
      setTimeout(
        () => {
          selectNextTrack();
        },
        2000 + Math.random() * 1000,
      );
    }
  }, [status.didJustFinish, selectNextTrack]);

  // Observe current track
  useEffect(() => {
    if (currentTrack) {
      const audioSource = MUSIC_ASSETS[currentTrack];
      player.replace(audioSource);
      console.log("Current track:", currentTrack);
    }
  }, [currentTrack, player]);

  // Observe volume
  useEffect(() => {
    player.volume = musicVolume;
    revertPlayer.volume = musicVolume;
  }, [musicVolume, player, revertPlayer]);

  return null;
});
