import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import soundsJson from "../configs/sounds.json";
import * as Haptics from "expo-haptics";
import { Sound } from "expo-av/build/Audio";

const SOUND_ENABLED_KEY = "sound_enabled";
const SOUND_VOLUME_KEY = "sound_volume";
const MUSIC_ENABLED_KEY = "music_enabled";
const MUSIC_VOLUME_KEY = "music_volume";

type SoundContextType = {
  isSoundOn: boolean;
  toggleSound: () => void;
  isMusicOn: boolean;
  toggleMusic: () => void;
  soundEffectVolume: number;
  setSoundEffectVolume: (volume: number) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  playSoundEffect: (type: string, pitchShift?: number) => Promise<void>;
};

// Create Context
const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Hook to use sound context
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within SoundProvider");
  return context;
};

// Sound Provider Component
export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [soundEffectVolume, setSoundEffectVolumeInner] = useState(1);
  const [musicVolume, setMusicVolumeInner] = useState(0.5);

  // Sound Effects
  const txClickedSource = require("../../assets/sounds/tx-clicked.mp3");
  const mineClickedSource = require("../../assets/sounds/mine-clicked.mp3");
  const blockMinedSource = require("../../assets/sounds/block-mined.mp3");
  const sequenceClickedSource = require("../../assets/sounds/sequence-clicked.wav");
  const sequenceDoneSource = require("../../assets/sounds/sequence-done.wav");
  const proveClickedSource = require("../../assets/sounds/prove-clicked.wav");
  const proveDoneSource = require("../../assets/sounds/prove-done.wav");
  const daClickedSource = require("../../assets/sounds/da-clicked.wav");
  const daDoneSource = require("../../assets/sounds/da-done.wav");
  const itemPurchasedSource = require("../../assets/sounds/purchase.mp3");
  const buyFailedSource = require("../../assets/sounds/buy-failed.mp3");
  const achievementUnlockedSource = require("../../assets/sounds/achievement.mp3");
  const basicClickSource = require("../../assets/sounds/basic-click.mp3");
  const soundEffects: { [key: string]: any } = {
    MineClicked: mineClickedSource,
    MineDone: blockMinedSource,
    SequenceClicked: sequenceClickedSource,
    SequenceDone: sequenceDoneSource,
    ProveClicked: proveClickedSource,
    ProveDone: proveDoneSource,
    DaClicked: daClickedSource,
    DaDone: daDoneSource,
    ItemPurchased: itemPurchasedSource,
    BuyFailed: buyFailedSource,
    TxAdded: txClickedSource,
    AchievementCompleted: achievementUnlockedSource,
    BasicClick: basicClickSource,
    SwitchPage: basicClickSource,
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
  const minPitchShift = 0.5;
  const maxPitchShift = 2.0;
  const playSoundEffect = useCallback(
    async (type: string, pitchShift: number = 1.0) => {
      if (
        !isSoundOn ||
        !soundEffects[type] ||
        !Object.prototype.hasOwnProperty.call(soundsJson, type)
      )
        return;

      if (pitchShift < minPitchShift) {
        pitchShift = minPitchShift;
      } else if (pitchShift > maxPitchShift) {
        pitchShift = maxPitchShift;
      }
      const soundConfig = soundsJson[type as keyof typeof soundsJson];
      playHaptic(soundConfig.haptic);
      const { sound } = await Audio.Sound.createAsync(soundEffects[type], {
        volume: soundEffectVolume * (soundConfig.volume || 1.0),
        rate: (soundConfig.rate || 1.0) * pitchShift,
      });
      await sound.playAsync();
    },
    [isSoundOn, soundEffectVolume],
  );

  // TODO: Choose random music from a list of songs
  // Music
  const song1Source = require("../../assets/music/the-return-of-the-8-bit-era-301292.mp3");
  const song2Source = require("../../assets/music/jungle-ish-beat-for-video-games-314073.mp3");
  const [currentMusic, setCurrentMusic] = useState<Sound | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Start music playback
  useEffect(() => {
    const playMusic = async () => {
      try {
        const { sound: musicSound } = await Audio.Sound.createAsync(
          song1Source,
          {
            volume: musicVolume,
            isLooping: false,
          },
        );
        setCurrentMusic(musicSound);
        await musicSound.playAsync();
      } catch (error) {
        console.error("Failed to play music:", error);
      }
    };

    const stopMusic = async () => {
      try {
        await currentMusic?.stopAsync();
      } catch (error) {
        console.error("Failed to stop music:", error);
      }
    };

    if (isMusicOn && !isPlayingMusic) {
      playMusic();
    } else if (!isMusicOn && isPlayingMusic) {
      stopMusic();
    }
  }, [isMusicOn, isPlayingMusic, musicVolume]);

  useEffect(() => {
    currentMusic?.setOnPlaybackStatusUpdate((status) => {
      let isPlaying = false;
      if (status.isLoaded) {
        isPlaying = status.isPlaying;
      }

      setIsPlayingMusic(isPlaying);
    });

    return currentMusic
      ? () => {
          currentMusic.unloadAsync();
        }
      : undefined;
  }, [currentMusic]);

  useEffect(() => {
    const loadSettings = async () => {
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
        setIsSoundOn(soundEnabled === "true" || soundEnabled === null);
        setIsMusicOn(musicEnabled === "true" || musicEnabled === null);
        setSoundEffectVolume(soundVolume ? parseFloat(soundVolume) : 1);
        setMusicVolume(musicVolume ? parseFloat(musicVolume) : 0.5);
      } catch (error) {
        console.error("Failed to load sound settings:", error);
      }
    };

    loadSettings();
  }, []);

  const toggleSound = () => {
    setIsSoundOn((prev) => {
      const newValue = !prev;
      AsyncStorage.setItem(SOUND_ENABLED_KEY, newValue.toString());
      return newValue;
    });
  };

  const toggleMusic = () => {
    setIsMusicOn((prev) => {
      const newValue = !prev;
      AsyncStorage.setItem(MUSIC_ENABLED_KEY, newValue.toString());
      return newValue;
    });
  };

  const setSoundEffectVolume = (volume: number) => {
    setSoundEffectVolumeInner(volume);
    AsyncStorage.setItem(SOUND_VOLUME_KEY, volume.toString());
  };

  const setMusicVolume = (volume: number) => {
    setMusicVolumeInner(volume);
    AsyncStorage.setItem(MUSIC_VOLUME_KEY, volume.toString());
  };

  return (
    <SoundContext.Provider
      value={{
        isSoundOn,
        isMusicOn,
        toggleSound,
        toggleMusic,
        soundEffectVolume,
        setSoundEffectVolume,
        musicVolume,
        setMusicVolume,
        playSoundEffect,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};
