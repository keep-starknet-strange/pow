import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, createAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import soundsJson from "../configs/sounds.json";
import soundPoolsJson from "../configs/soundpools.json";
import { memo, useEffect } from "react";
import { FlatList, Text } from "react-native";
import { Asset } from "expo-asset";
import {
  AudioContext,
  AudioManager,
  AudioBuffer,
  AudioBufferSourceNode,
} from "react-native-audio-api";
import { v4 as uuidv4 } from "uuid";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
const soundFileAssets: { [key: string]: number } = {
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
      player.seekTo(0).then(() => {
        player.play();
      });

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

class MusicController {
  private audioContext: AudioContext = new AudioContext();
  private onSongEndedCallback: (() => void) | null = null;

  private currentAudioBuffer: AudioBuffer | null = null;
  private currentAudioProgress: number = 0;
  private playingAudioNode: AudioBufferSourceNode | null = null;

  public play() {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.currentAudioBuffer;
    source.connect(this.audioContext.destination);
    source.onPositionChanged = (event) => {
      console.log("Progress", event.value);
      this.currentAudioProgress = event.value;
    };
    source.onEnded = () => {
      if (this.onSongEndedCallback) {
        this.onSongEndedCallback();
      }
    };
    source.onPositionChangedInterval = 100; // ~10Hz
    source.start(0, this.currentAudioProgress);
    this.playingAudioNode = source;
  }

  public pause() {
    if (this.playingAudioNode) {
      this.playingAudioNode.onEnded = null;
      this.playingAudioNode.stop();
    }
  }

  public setOnSongEndedCallback(onSongEndedCallback: (() => void) | null) {
    this.onSongEndedCallback = onSongEndedCallback;
  }

  public async changeSong(songName: SongName) {
    this.currentAudioProgress = 0;
    this.currentAudioBuffer = await Asset.fromModule(MUSIC_FILES[songName])
      .downloadAsync()
      .then((asset) => {
        if (!asset.localUri) {
          console.error("Failed to load asset for", songName);
          return null;
        }

        return this.audioContext.decodeAudioDataSource(asset.localUri);
      });
  }

  public cleanup() {
    this.currentAudioProgress = 0;
    this.currentAudioBuffer = null;
    this.onSongEndedCallback = null;
    this.playingAudioNode?.disconnect();
    this.audioContext.close();
  }
}

interface SoundState {
  audioLogs: { id: string; log: string }[];
  musicController: MusicController;

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

  log: (log: string) => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  musicController: new MusicController(),
  audioLogs: [],
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
    AudioManager.setAudioSessionOptions({
      iosCategory: "soloAmbient",
      iosMode: "default",
      iosOptions: ["mixWithOthers"],
    });
    const { musicController, log, selectNextTrack } = get();
    const soundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
    const musicEnabled = await AsyncStorage.getItem(MUSIC_ENABLED_KEY);
    const hapticsEnabled = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
    const soundVolume = await AsyncStorage.getItem(SOUND_VOLUME_KEY);
    const musicVolume = await AsyncStorage.getItem(MUSIC_VOLUME_KEY);
    const hasLaunchedBefore = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);

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
    log("Initialize sound");

    musicController.setOnSongEndedCallback(() => {
      selectNextTrack();
    });
    await musicController.changeSong(selectedTrack);
    const musicOn = musicEnabled === "true" || musicEnabled === null;
    if (musicOn) {
      musicController.play();
    }

    set({
      isInitialized: true,
      isSoundOn: false, // isSoundOn: soundEnabled === "true" || soundEnabled === null,
      isMusicOn: musicOn,
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
    const { log, musicController, soundPool } = get();

    // Clean up sound pool
    if (soundPool) {
      soundPool.cleanup();
      set({ soundPool: null });
    }

    // musicController.pause();
    log("Closing audio context");
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
      musicController.play();
    }

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

  log: (log: string) => {
    set((soundState) => {
      return {
        audioLogs: [...soundState.audioLogs, { id: uuidv4(), log: log }],
      };
    });
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
  const { initializeSound, cleanupSound, audioLogs } = useSoundStore();

  useEffect(() => {
    initializeSound();

    return () => {
      cleanupSound();
    };
  }, []);

  //
  // const [logs, setLogs] = useState<{ id: string; log: string }[]>([]);
  //
  // const audioContextRef = useRef<AudioContext | null>(null);
  //
  // const log = useCallback(
  //   (log: string) => {
  //     setLogs((logs) => [...logs, { id: uuidv4(), log: log }]);
  //   },
  //   [setLogs],
  // );
  //
  // useEffect(() => {
  //   if (!audioContextRef.current) {
  //     audioContextRef.current = new AudioContext();
  //   }
  //
  //   return () => {
  //     audioContextRef.current?.close();
  //   };
  // }, []);
  //
  // useEffect(() => {
  //   if (!isInitialized) {
  //     log("Init sound");
  //     initializeSound();
  //   }
  // }, [isInitialized, initializeSound]);
  //
  // useEffect(() => {
  //   const handlePlay = async (song: SongName) => {
  //     if (!audioContextRef.current) {
  //       log("No audio context");
  //       return;
  //     }
  //
  //     const audioContext = audioContextRef.current;
  //
  //
  //     const playerNode = audioContext.createBufferSource();
  //     playerNode.buffer = buffer;
  //
  //     log("Play");
  //     playerNode.connect(audioContext.destination);
  //     playerNode.start(audioContext.currentTime);
  //   };
  //
  //   if (currentTrack) {
  //     handlePlay(currentTrack);
  //   }
  // }, [currentTrack]);
  //
  const insets = useSafeAreaInsets();
  return (
    <FlatList
      style={{
        flex: 1,
        height: "100%",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        zIndex: 100,
        pointerEvents: "none",
        position: "absolute",
      }}
      data={audioLogs}
      renderItem={({ item }) => <Text>{item.log}</Text>}
      keyExtractor={(item) => item.id}
    />
  );
});
