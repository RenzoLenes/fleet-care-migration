/**
 * Sound utility for playing notification sounds
 */

class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private soundEnabled = true;

  private constructor() {
    // Initialize on user interaction to comply with browser policies
    if (typeof window !== 'undefined') {
      this.initializeOnUserInteraction();
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initializeOnUserInteraction() {
    const initAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    document.addEventListener('touchstart', initAudio);
  }

  /**
   * Play alert notification sound using Web Audio API
   */
  async playAlertSound(type: 'info' | 'warning' | 'critical' = 'info') {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Generate different tones based on alert type
      const frequencies = {
        info: [800, 1000], // Pleasant notification sound
        warning: [600, 800, 1000], // More urgent
        critical: [400, 600, 800, 1000] // Very urgent
      };

      const freq = frequencies[type];
      const duration = type === 'critical' ? 0.8 : 0.4;

      for (let i = 0; i < freq.length; i++) {
        await this.playTone(freq[i], duration / freq.length, i * (duration / freq.length));
      }
    } catch (error) {
      console.warn('Could not play alert sound:', error);
    }
  }

  private playTone(frequency: number, duration: number, delay: number = 0): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioContext) {
        resolve();
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + delay);
      oscillator.type = 'sine';

      // Envelope for smooth sound
      const startTime = this.audioContext.currentTime + delay;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);

      oscillator.onended = () => resolve();
    });
  }

  /**
   * Enable or disable sound notifications
   */
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fleetcare-sound-enabled', enabled.toString());
    }
  }

  /**
   * Get sound enabled status from localStorage
   */
  getSoundEnabled(): boolean {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fleetcare-sound-enabled');
      if (stored !== null) {
        this.soundEnabled = stored === 'true';
      }
    }
    return this.soundEnabled;
  }

  /**
   * Play a simple click sound for UI interactions
   */
  async playClickSound() {
    if (!this.soundEnabled) return;
    await this.playTone(1200, 0.1);
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();

// Helper functions
export const playAlertSound = (type: 'info' | 'warning' | 'critical' = 'info') => {
  return soundManager.playAlertSound(type);
};

export const playClickSound = () => {
  return soundManager.playClickSound();
};

export const setSoundEnabled = (enabled: boolean) => {
  soundManager.setSoundEnabled(enabled);
};

export const getSoundEnabled = () => {
  return soundManager.getSoundEnabled();
};