import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOUND_ENABLED_KEY = "alma_sounds_enabled";

// Sound URLs - soft, feminine spa-like sounds for wellness
const SOUND_URLS = {
  // Gentle interactions - soft, delicate tones
  tap: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3", // Soft bubble pop
  waterDrop: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3", // Gentle water ripple

  // Progress and completion - crystal and bell tones
  chime: "https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3", // Soft meditation bell
  success: "https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3", // Gentle positive notification
  complete: "https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3", // Peaceful achievement ding

  // Celebrations - uplifting but gentle
  celebration: "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3", // Soft magical achievement
  levelUp: "https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3", // Gentle ascending chime

  // Navigation - whisper soft
  swoosh: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3", // Soft whoosh

  // Ambient - nature and spa inspired  
  natureChime: "https://assets.mixkit.co/active_storage/sfx/2516/2516-preview.mp3", // Gentle wind chime
  stoneClick: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3", // Soft gentle click
};

export type SoundType = keyof typeof SOUND_URLS;

class SoundManager {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;

  async init() {
    if (this.isInitialized) return;

    try {
      // Set audio mode for background compatibility
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load sound preference
      const stored = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
      this.isEnabled = stored !== "false";
      this.isInitialized = true;
    } catch {
      // Sound init failed - will use defaults
    }
  }

  async preloadSound(type: SoundType): Promise<Audio.Sound | null> {
    if (this.sounds.has(type)) {
      return this.sounds.get(type)!;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUND_URLS[type] },
        { shouldPlay: false, volume: 0.5 }
      );
      this.sounds.set(type, sound);
      return sound;
    } catch {
      return null;
    }
  }

  async play(type: SoundType, volume: number = 0.5) {
    if (!this.isEnabled) return;

    try {
      let sound = this.sounds.get(type);

      if (!sound) {
        const loadedSound = await this.preloadSound(type);
        if (!loadedSound) return;
        sound = loadedSound;
      }

      if (sound) {
        await sound.setPositionAsync(0);
        await sound.setVolumeAsync(volume);
        await sound.playAsync();
      }
    } catch {
      // Sound playback failed - silently ignore
    }
  }

  async setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    await AsyncStorage.setItem(SOUND_ENABLED_KEY, enabled.toString());
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  async cleanup() {
    for (const sound of this.sounds.values()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    this.sounds.clear();
  }
}

export const soundManager = new SoundManager();

// Convenience functions for common sounds - soft, delicate volumes
export const playTap = () => soundManager.play("tap", 0.15);
export const playWaterDrop = () => soundManager.play("waterDrop", 0.2);
export const playChime = () => soundManager.play("chime", 0.35);
export const playSuccess = () => soundManager.play("success", 0.3);
export const playComplete = () => soundManager.play("complete", 0.4);
export const playCelebration = () => soundManager.play("celebration", 0.4);
export const playLevelUp = () => soundManager.play("levelUp", 0.35);
export const playSwoosh = () => soundManager.play("swoosh", 0.15);
export const playNatureChime = () => soundManager.play("natureChime", 0.25);
export const playStoneClick = () => soundManager.play("stoneClick", 0.15); // Softer volume for gentle click
