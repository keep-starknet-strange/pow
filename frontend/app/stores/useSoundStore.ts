import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import soundsJson from "../configs/sounds.json";
import soundPoolsJson from "../configs/soundpools.json";

const SOUND_ENABLED_KEY = "sound_enabled";
const SOUND_VOLUME_KEY = "sound_volume";
const MUSIC_ENABLED_KEY = "music_enabled";
const MUSIC_VOLUME_KEY = "music_volume";
const HAPTICS_ENABLED_KEY = "haptics_enabled";
const FIRST_LAUNCH_KEY = "has_launched_before";

const musicAssets: { [key: string]: any } = {
  "The Return": require("../../assets/music/the-return-of-the-8-bit-era-301292.m4a"),
  "Busy Market": require("../../assets/music/Busy Day At The Market-LOOP.m4a"),
  "Left Right": require("../../assets/music/LeftRightExcluded.m4a"),
  "Super Ninja": require("../../assets/music/Ove Melaa - Super Ninja Assasin.m4a"),
  "Mega Wall": require("../../assets/music/awake10_megaWall.m4a"),
  Happy: require("../../assets/music/happy.m4a"),
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
  musicVolume: number;
  musicPlayer: AudioPlayer | null;
  soundPool: SoundPool | null;
  isInitialized: boolean;
  currentTrackName: string | null;
  lastPlayedTracks: (string | null)[];
  musicPlayerListener: any;
  revertMusicPlayer: AudioPlayer | null;
  previousTrackBeforeRevert: string | null;
  isPlayingRevertMusic: boolean;

  toggleSound: () => void;
  toggleMusic: () => Promise<void>;
  toggleHaptics: () => void;
  setSoundEffectVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  playSoundEffect: (soundType: string, pitchShift?: number) => Promise<void>;
  initializeSound: () => Promise<void>;
  playMusic: () => Promise<void>;
  stopMusic: () => Promise<void>;
  cleanupSound: () => void;
  playNextTrack: () => Promise<void>;
  playRevertMusic: () => Promise<void>;
  stopRevertMusic: () => Promise<void>;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  isSoundOn: false,
  isMusicOn: false,
  isHapticsOn: true,
  soundEffectVolume: 1,
  musicVolume: 0.2,
  musicPlayer: null,
  soundPool: null,
  isInitialized: false,
  currentTrackName: null,
  lastPlayedTracks: [],
  musicPlayerListener: null,
  revertMusicPlayer: null,
  previousTrackBeforeRevert: null,
  isPlayingRevertMusic: false,

  initializeSound: async () => {
    try {
      // Configure global audio mode to play sounds even in iOS silent mode
      await setAudioModeAsync({
        playsInSilentMode: true,
      });

      const soundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      const musicEnabled = await AsyncStorage.getItem(MUSIC_ENABLED_KEY);
      const hapticsEnabled = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
      const soundVolume = await AsyncStorage.getItem(SOUND_VOLUME_KEY);
      const musicVolume = await AsyncStorage.getItem(MUSIC_VOLUME_KEY);
      const hasLaunchedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);

      const musicOn = musicEnabled === "true" || musicEnabled === null;
      const volume = musicVolume ? parseFloat(musicVolume) : 0.5;

      let musicPlayer = null;
      let selectedTrack: string | null = null;

      if (musicOn) {
        try {
          // Check if this is the first launch
          if (!hasLaunchedBefore) {
            // First launch - play "The Return"
            selectedTrack = "The Return";
            // Mark that the app has been launched before
            await AsyncStorage.setItem(FIRST_LAUNCH_KEY, "true");
          } else {
            // Returning user - select random track
            const trackNames = Object.keys(musicAssets);
            selectedTrack =
              trackNames[Math.floor(Math.random() * trackNames.length)];
          }

          const musicAsset = musicAssets[selectedTrack];
          musicPlayer = createAudioPlayer(musicAsset);
          musicPlayer.volume = volume;
          musicPlayer.loop = false; // Don't loop, we'll play next track

          // Set up playback status listener to detect when track ends
          const statusListener = musicPlayer.addListener(
            "playbackStatusUpdate",
            (status) => {
              if (
                !status.playing &&
                status.currentTime > 0 &&
                status.currentTime >= status.duration - 0.1
              ) {
                // Track has ended, wait 2-3 seconds then play next
                const delay = 2000 + Math.random() * 1000; // 2-3 second delay
                setTimeout(() => {
                  get().playNextTrack();
                }, delay);
              }
            },
          );

          // Store listener reference for cleanup
          set({ musicPlayerListener: statusListener });
        } catch (error) {
          if (__DEV__) console.error("Failed to create music player:", error);
        }
      }

      set({
        isSoundOn: soundEnabled === "true" || soundEnabled === null,
        isMusicOn: musicOn,
        isHapticsOn: hapticsEnabled === "true" || hapticsEnabled === null,
        soundEffectVolume: soundVolume ? parseFloat(soundVolume) : 1,
        musicVolume: volume,
        musicPlayer: musicPlayer,
        soundPool: new SoundPool(),
        currentTrackName: selectedTrack,
        musicPlayerListener: null,
      });

      if (musicOn && musicPlayer) {
        musicPlayer.play();
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to load sound settings:", error);
      set({
        isSoundOn: true,
        isMusicOn: false,
        isHapticsOn: true,
        soundEffectVolume: 1,
        musicVolume: 0.5,
        soundPool: new SoundPool(),
        isInitialized: true,
      });
      return;
    }

    // Mark as initialized
    set((state) => ({ ...state, isInitialized: true }));
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
      if (!currentState.musicPlayer) {
        try {
          const trackNames = Object.keys(musicAssets);
          const randomTrack =
            trackNames[Math.floor(Math.random() * trackNames.length)];
          const musicAsset = musicAssets[randomTrack];

          const musicPlayer = createAudioPlayer(musicAsset);
          musicPlayer.volume = currentState.musicVolume;
          musicPlayer.loop = false; // Don't loop, we'll play next track

          // Set up playback status listener
          const statusListener = musicPlayer.addListener(
            "playbackStatusUpdate",
            (status) => {
              if (
                !status.playing &&
                status.currentTime > 0 &&
                status.currentTime >= status.duration - 0.1
              ) {
                // Track has ended, wait 2-3 seconds then play next
                const delay = 2000 + Math.random() * 1000; // 2-3 second delay
                setTimeout(() => {
                  get().playNextTrack();
                }, delay);
              }
            },
          );

          set({
            musicPlayer,
            currentTrackName: randomTrack,
            musicPlayerListener: statusListener,
          });
        } catch (error) {
          if (__DEV__) console.error("Failed to create music player:", error);
          return;
        }
      }
      get().playMusic();
    } else {
      await get().stopMusic();
    }
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

    const { musicPlayer } = get();
    if (!musicPlayer) {
      if (__DEV__) console.warn("Music player is not initialized.");
      return;
    }
    musicPlayer.volume = volume;
  },

  playMusic: async () => {
    const { isMusicOn, musicPlayer } = get();

    if (!isMusicOn) return;

    try {
      if (!musicPlayer) {
        const trackNames = Object.keys(musicAssets);
        const randomTrack =
          trackNames[Math.floor(Math.random() * trackNames.length)];
        const musicAsset = musicAssets[randomTrack];

        const newMusicPlayer = createAudioPlayer(musicAsset);
        newMusicPlayer.volume = get().musicVolume;
        newMusicPlayer.loop = false; // Don't loop, we'll play next track

        // Set up playback status listener
        const statusListener = newMusicPlayer.addListener(
          "playbackStatusUpdate",
          (status) => {
            if (
              !status.playing &&
              status.currentTime > 0 &&
              status.currentTime >= status.duration - 0.1
            ) {
              // Track has ended, wait 2-3 seconds then play next
              const delay = 2000 + Math.random() * 1000; // 2-3 second delay
              setTimeout(() => {
                get().playNextTrack();
              }, delay);
            }
          },
        );

        set({
          musicPlayer: newMusicPlayer,
          currentTrackName: randomTrack,
          musicPlayerListener: statusListener,
        });

        newMusicPlayer.play();
      } else {
        get().playNextTrack();
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to play music:", error);
    }
  },

  stopMusic: async () => {
    const { musicPlayer } = get();

    if (musicPlayer) {
      try {
        musicPlayer.pause();
      } catch (error) {
        if (__DEV__) console.error("Failed to stop music:", error);
      }
    }
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
    const { musicPlayer, soundPool, musicPlayerListener } = get();

    // Clean up music player and its listener
    if (musicPlayer) {
      try {
        // Remove listener before cleanup
        if (musicPlayerListener) {
          musicPlayerListener.remove();
        }
        musicPlayer.pause();
        musicPlayer.release();
        set({ musicPlayer: null, musicPlayerListener: null });
      } catch (error) {
        if (__DEV__) console.warn("Failed to cleanup music player:", error);
      }
    }

    // Clean up sound pool
    if (soundPool) {
      soundPool.cleanup();
      set({ soundPool: null });
    }
  },

  playNextTrack: async () => {
    const {
      isMusicOn,
      musicVolume,
      currentTrackName,
      lastPlayedTracks,
      musicPlayer,
      musicPlayerListener,
      isPlayingRevertMusic,
    } = get();

    if (!isMusicOn || isPlayingRevertMusic) return;

    // Clean up current player
    if (musicPlayer) {
      try {
        // Remove listener before cleanup
        if (musicPlayerListener) {
          musicPlayerListener.remove();
        }
        musicPlayer.pause();
        musicPlayer.release();
      } catch (error) {
        if (__DEV__) console.error("Failed to cleanup previous player:", error);
      }
    }

    // Get all track names
    const trackNames = Object.keys(musicAssets);

    // Keep track of last 2 played tracks to avoid immediate repeats
    const recentTracks = [...lastPlayedTracks, currentTrackName]
      .filter((track): track is string => track !== null)
      .slice(-2);

    // Filter out recently played tracks if we have enough tracks
    let availableTracks = trackNames;
    if (trackNames.length > 3) {
      availableTracks = trackNames.filter(
        (track) => !recentTracks.includes(track),
      );
    }

    // If all tracks were recently played (shouldn't happen with 6 tracks), use all tracks
    if (availableTracks.length === 0) {
      availableTracks = trackNames;
    }

    // Select random track from available tracks
    const nextTrack =
      availableTracks[Math.floor(Math.random() * availableTracks.length)];

    try {
      const musicAsset = musicAssets[nextTrack];
      const newMusicPlayer = createAudioPlayer(musicAsset);
      newMusicPlayer.volume = musicVolume;
      newMusicPlayer.loop = false;

      // Set up playback status listener for the new track
      const statusListener = newMusicPlayer.addListener(
        "playbackStatusUpdate",
        (status) => {
          if (
            !status.playing &&
            status.currentTime > 0 &&
            status.currentTime >= status.duration - 0.1
          ) {
            // Track has ended, wait 2-3 seconds then play next
            const delay = 2000 + Math.random() * 1000; // 2-3 second delay
            setTimeout(() => {
              get().playNextTrack();
            }, delay);
          }
        },
      );

      set({
        musicPlayer: newMusicPlayer,
        currentTrackName: nextTrack,
        lastPlayedTracks: recentTracks,
        musicPlayerListener: statusListener,
      });

      newMusicPlayer.play();

      if (__DEV__) console.log(`Now playing: ${nextTrack}`);
    } catch (error) {
      if (__DEV__) console.error("Failed to play next track:", error);
    }
  },

  playRevertMusic: async () => {
    const {
      isMusicOn,
      musicVolume,
      musicPlayer,
      currentTrackName,
      revertMusicPlayer,
    } = get();

    // Don't start if already playing
    if (revertMusicPlayer) {
      return;
    }

    // Store the current track name before switching (if music was playing)
    if (isMusicOn && currentTrackName) {
      set({ previousTrackBeforeRevert: currentTrackName });
    }

    // Pause current music if playing
    if (musicPlayer && isMusicOn) {
      try {
        musicPlayer.pause();
      } catch (error) {
        if (__DEV__) console.error("Failed to pause music:", error);
      }
    }

    try {
      // Create and play revert theme - plays regardless of music setting for dramatic effect
      const revertMusicAsset = require("../../assets/music/revert-theme.m4a");

      const revertPlayer = createAudioPlayer(revertMusicAsset);
      // Use the music volume setting if available, otherwise default to 0.3
      const volume = musicVolume > 0 ? musicVolume * 0.8 : 0.3;
      revertPlayer.volume = volume;
      revertPlayer.shouldCorrectPitch = true; // Enable pitch correction like sound effects
      // Don't set loop immediately, set it after play starts

      // Store player reference before playing
      set({
        revertMusicPlayer: revertPlayer,
        isPlayingRevertMusic: true,
      });

      // Play the revert music
      revertPlayer.play();
      revertPlayer.loop = true;

      // Also play the revert sound effect
      const { playSoundEffect } = get();
      playSoundEffect("RevertStarted");
    } catch (error) {
      if (__DEV__) console.error("Failed to play revert music:", error);
    }
  },

  stopRevertMusic: async () => {
    const {
      revertMusicPlayer,
      musicPlayer,
      isMusicOn,
      previousTrackBeforeRevert,
    } = get();

    // Stop and cleanup revert music
    if (revertMusicPlayer) {
      try {
        // First set state to indicate we're stopping
        set({
          isPlayingRevertMusic: false,
        });

        // Then stop and cleanup the player
        if (revertMusicPlayer.playing) {
          await revertMusicPlayer.pause();
        }

        // Small delay before release to ensure pause completes
        setTimeout(() => {
          try {
            revertMusicPlayer.release();
          } catch (releaseError) {
            if (__DEV__)
              console.error("Error releasing revert player:", releaseError);
          }
        }, 100);

        // Clear the reference
        set({
          revertMusicPlayer: null,
          previousTrackBeforeRevert: null,
        });
      } catch (error) {
        if (__DEV__) console.error("Failed to stop revert music:", error);
        // Force clear the reference even if cleanup failed
        set({
          revertMusicPlayer: null,
          isPlayingRevertMusic: false,
          previousTrackBeforeRevert: null,
        });
      }
    }

    // Resume normal music after a short delay (only if music was on and we had a track)
    if (isMusicOn && previousTrackBeforeRevert) {
      setTimeout(() => {
        const state = get();
        if (!state.isPlayingRevertMusic && state.isMusicOn) {
          // If we had a track before, resume it, otherwise play next
          if (musicPlayer) {
            try {
              musicPlayer.play();
            } catch (error) {
              // If resume fails, play next track
              get().playNextTrack();
            }
          } else {
            get().playNextTrack();
          }
        }
      }, 2000); // 2 second delay before resuming normal music
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
    playMusic,
    stopMusic,
    cleanupSound,
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
    playMusic,
    stopMusic,
    cleanupSound,
  };
};
