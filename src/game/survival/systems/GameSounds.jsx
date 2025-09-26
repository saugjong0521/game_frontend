// setting/GameSounds.jsx
import {
  attackSound,
  bgm,
  gameover,
  hit,
  levelselect,
  levelup,
  walk
} from '@/assets';
import { SoundSetting } from '@/game/survival';

class GameSounds {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.currentBGM = null;
    this.walkLoopSource = null;
    this.masterVolume = 0.7;
    this.sfxVolume = 0.8;
    this.bgmVolume = 0.5;
    this.isWalkPlaying = false;
    this.isInitialized = false;
    this.isAudioContextBroken = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.fallbackAudioElements = {};
    this.useFallback = false;
    
    this.initInProgress = false;
    this.fallbackInitInProgress = false;
    this.soundsLoadInProgress = false;
    this.hasBeenInitialized = false;
    
    // BGM 로딩 상태 추적
    this.isBGMLoaded = false;
    this.bgmLoadPromise = null;
    
    this.soundPaths = {
      attackSound,
      bgm,
      gameover,
      hit,
      levelselect,
      levelup,
      walk
    };
    
    this.loadVolumeSettings();
  }

  loadVolumeSettings() {
    // 로컬스토리지 대신 메모리에 저장
    this.masterVolume = 0.7;
    this.bgmVolume = 0.5;
    this.sfxVolume = 0.8;
  }

  saveVolumeSettings() {
    // 로컬스토리지 사용 안 함 - 메모리에만 유지
  }

  async init() {
    // 이미 완전히 초기화됐으면 스킵
    if (this.hasBeenInitialized && this.isInitialized) {
      console.log('GameSounds already fully initialized');
      return;
    }
    
    // 초기화 중이면 완료 대기
    if (this.initInProgress) {
      console.log('GameSounds init in progress, waiting...');
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.initInProgress) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
      });
    }
    
    this.initInProgress = true;
    
    try {
      console.log('Starting GameSounds initialization...');
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        console.log('AudioContext suspended, attempting to resume...');
        await this.audioContext.resume();
      }
      
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.masterVolume;
      this.masterGainNode.connect(this.audioContext.destination);
      
      this.bgmGainNode = this.audioContext.createGain();
      this.bgmGainNode.gain.value = this.bgmVolume;
      this.bgmGainNode.connect(this.masterGainNode);
      
      this.sfxGainNode = this.audioContext.createGain();
      this.sfxGainNode.gain.value = this.sfxVolume;
      this.sfxGainNode.connect(this.masterGainNode);
      
      await this.loadAllSounds();
      
      this.isInitialized = true;
      this.hasBeenInitialized = true;
      this.isAudioContextBroken = false;
      this.retryCount = 0;
      console.log('GameSounds initialized successfully with AudioContext');
      
    } catch (error) {
      console.error('Failed to initialize GameSounds with AudioContext:', error);
      this.isAudioContextBroken = true;
      
      if (!this.fallbackInitInProgress && !this.useFallback) {
        await this.initFallbackSystem();
      }
    } finally {
      this.initInProgress = false;
    }
  }

  async loadAllSounds() {
    if (this.soundsLoadInProgress || Object.keys(this.sounds).length > 0) {
      console.log('Sounds already loaded or loading, skipping...');
      return;
    }
    
    this.soundsLoadInProgress = true;
    
    try {
      console.log('Starting to load all sounds...');
      
      for (const [name, path] of Object.entries(this.soundPaths)) {
        try {
          console.log(`Loading sound: ${name}`);
          
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          
          this.sounds[name] = audioBuffer;
          console.log(`Successfully loaded: ${name}`);
          
          // BGM 로딩 완료 표시
          if (name === 'bgm') {
            this.isBGMLoaded = true;
            console.log('BGM loaded successfully');
          }
          
        } catch (error) {
          console.warn(`Failed to load sound ${name}:`, error);
          
          if (error.name === 'NotSupportedError' || 
              error.message.includes('AudioContext') || 
              error.message.includes('audio device')) {
            throw error;
          }
        }
      }
      
      console.log('Sound loading completed');
      
    } finally {
      this.soundsLoadInProgress = false;
    }
  }

  async initFallbackSystem() {
    if (this.fallbackInitInProgress || (this.useFallback && this.hasBeenInitialized)) {
      console.log('Fallback system already initialized or initializing, skipping...');
      return;
    }
    
    this.fallbackInitInProgress = true;
    
    try {
      console.log('Initializing fallback audio system...');
      
      if (Object.keys(this.fallbackAudioElements).length === 0) {
        for (const [name, path] of Object.entries(this.soundPaths)) {
          const audio = new Audio();
          audio.preload = 'metadata';
          audio.volume = 1.0;
          audio.src = path;
          
          audio.onerror = (e) => {
            console.warn(`Failed to load fallback audio ${name}:`, e);
          };
          
          // BGM 로딩 완료 리스너
          if (name === 'bgm') {
            audio.addEventListener('canplaythrough', () => {
              this.isBGMLoaded = true;
              console.log('Fallback BGM loaded successfully');
            }, { once: true });
          }
          
          this.fallbackAudioElements[name] = audio;
        }
      }
      
      this.useFallback = true;
      this.isInitialized = true;
      this.hasBeenInitialized = true;
      console.log('Fallback audio system initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize fallback audio system:', error);
      this.isInitialized = false;
    } finally {
      this.fallbackInitInProgress = false;
    }
  }

  // BGM 로딩 완료 대기
  async waitForBGMLoad() {
    if (this.isBGMLoaded && this.isInitialized) {
      console.log('BGM already loaded');
      return true;
    }

    console.log('Waiting for BGM to load...');
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.isBGMLoaded && this.isInitialized) {
          clearInterval(checkInterval);
          console.log('BGM load complete');
          resolve(true);
        }
      }, 100);

      // 최대 10초 대기 (5초에서 10초로 증가)
      setTimeout(() => {
        clearInterval(checkInterval);
        if (this.isBGMLoaded && this.isInitialized) {
          console.log('BGM loaded (timeout check)');
          resolve(true);
        } else {
          console.warn('BGM load timeout - proceeding anyway');
          resolve(false);
        }
      }, 10000);
    });
  }

  async recoverAudioContext() {
    if (this.retryCount >= this.maxRetries) {
      console.log('Max retry attempts reached, staying with fallback system');
      return false;
    }
    
    this.retryCount++;
    console.log(`Attempting to recover AudioContext (attempt ${this.retryCount}/${this.maxRetries})`);
    
    try {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
      }
      
      this.isInitialized = false;
      this.isAudioContextBroken = false;
      this.useFallback = false;
      this.hasBeenInitialized = false;
      this.isBGMLoaded = false;
      
      await this.init();
      
      console.log('AudioContext recovered successfully');
      return true;
      
    } catch (error) {
      console.error(`AudioContext recovery failed (attempt ${this.retryCount}):`, error);
      
      this.isAudioContextBroken = true;
      this.useFallback = true;
      await this.initFallbackSystem();
      
      return false;
    }
  }

  async resumeAudioContext() {
    try {
      if (this.useFallback) {
        const recovered = await this.recoverAudioContext();
        if (!recovered) {
          console.log('Staying with fallback audio system');
        }
        return;
      }
      
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('AudioContext resumed successfully');
      } else if (!this.audioContext || this.audioContext.state === 'closed') {
        await this.init();
      }
    } catch (error) {
      console.error('Failed to resume AudioContext:', error);
      this.isAudioContextBroken = true;
      await this.initFallbackSystem();
    }
  }

  checkAudioContextHealth() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      return false;
    }
    
    try {
      return this.audioContext.state === 'running' || this.audioContext.state === 'suspended';
    } catch (error) {
      console.warn('AudioContext health check failed:', error);
      return false;
    }
  }

  playSound(soundName, volume = 1.0) {
    if (!this.isInitialized) {
      console.warn(`Sound system not initialized: ${soundName}`);
      return null;
    }

    const individualVolume = SoundSetting[soundName] || 1.0;
    const finalVolume = volume * individualVolume;

    if (this.useFallback) {
      return this.playSoundFallback(soundName, finalVolume);
    }

    if (!this.sounds[soundName]) {
      console.warn(`Sound not available: ${soundName}`);
      if (!this.useFallback) {
        return this.playSoundFallback(soundName, finalVolume);
      }
      return null;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds[soundName];
      source.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      gainNode.gain.value = finalVolume;
      
      source.start();
      return source;
      
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
      
      if (!this.useFallback) {
        this.isAudioContextBroken = true;
        this.useFallback = true;
        this.initFallbackSystem();
      }
      
      return null;
    }
  }

  playSoundFallback(soundName, volume = 1.0) {
    if (!this.fallbackAudioElements[soundName]) {
      console.warn(`Fallback sound not available: ${soundName}`);
      return null;
    }

    try {
      const audio = this.fallbackAudioElements[soundName];
      
      if (audio.readyState >= 1) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = Math.min(1.0, Math.max(0, volume * this.masterVolume * this.sfxVolume));
        
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(error => {
            console.warn(`Failed to play fallback sound ${soundName}:`, error);
          });
        }
      }
      
      return audio;
      
    } catch (error) {
      console.error(`Error playing fallback sound ${soundName}:`, error);
      return null;
    }
  }

  playBGM(restart = false) {
    if (!this.isInitialized) {
      console.warn('Sound system not initialized - BGM playback skipped');
      return false;
    }

    if (!this.isBGMLoaded) {
      console.warn('BGM not loaded yet - playback skipped');
      return false;
    }

    if (this.currentBGM && !restart) {
      console.log('BGM already playing');
      return true;
    }

    this.stopBGM();

    if (this.useFallback) {
      return this.playBGMFallback();
    }

    if (!this.sounds.bgm) {
      console.warn('BGM not available');
      if (!this.useFallback) {
        return this.playBGMFallback();
      }
      return false;
    }

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds.bgm;
      source.loop = true;
      source.connect(this.bgmGainNode);
      source.start();
      
      this.currentBGM = source;
      console.log('BGM started successfully');
      return true;
      
    } catch (error) {
      console.error('Error playing BGM:', error);
      
      if (!this.useFallback) {
        this.isAudioContextBroken = true;
        this.useFallback = true;
        this.initFallbackSystem();
        return this.playBGMFallback();
      }
      return false;
    }
  }

  playBGMFallback() {
    if (!this.fallbackAudioElements.bgm) {
      console.warn('Fallback BGM not available');
      return false;
    }

    try {
      const audio = this.fallbackAudioElements.bgm;
      
      if (audio.readyState >= 1) {
        audio.loop = true;
        audio.volume = Math.min(1.0, Math.max(0, this.masterVolume * this.bgmVolume));
        audio.currentTime = 0;
        
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            this.currentBGM = audio;
            console.log('Fallback BGM started');
          }).catch(error => {
            console.warn('Failed to play fallback BGM:', error);
          });
          return true;
        } else {
          this.currentBGM = audio;
          console.log('Fallback BGM started');
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('Error playing fallback BGM:', error);
      return false;
    }
  }

  stopBGM() {
    if (this.currentBGM) {
      try {
        if (this.useFallback) {
          this.currentBGM.pause();
          this.currentBGM.currentTime = 0;
        } else {
          this.currentBGM.stop();
        }
      } catch (error) {
        console.warn('Error stopping BGM:', error);
      }
      this.currentBGM = null;
    }
  }

  startWalkSound() {
    if (!this.isInitialized || this.isWalkPlaying) {
      return;
    }

    if (this.useFallback) {
      this.startWalkSoundFallback();
      return;
    }

    if (!this.sounds.walk) {
      console.warn('Walk sound not available');
      if (!this.useFallback) {
        this.startWalkSoundFallback();
      }
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds.walk;
      source.loop = true;
      source.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      gainNode.gain.value = SoundSetting.walk || 1.0;
      
      source.start();
      this.walkLoopSource = source;
      this.isWalkPlaying = true;
      
    } catch (error) {
      console.error('Error playing walk sound:', error);
      
      if (!this.useFallback) {
        this.isAudioContextBroken = true;
        this.useFallback = true;
        this.initFallbackSystem();
        this.startWalkSoundFallback();
      }
    }
  }

  startWalkSoundFallback() {
    if (!this.fallbackAudioElements.walk || this.isWalkPlaying) {
      return;
    }

    try {
      const audio = this.fallbackAudioElements.walk;
      
      if (audio.readyState >= 1) {
        audio.loop = true;
        audio.volume = Math.min(1.0, Math.max(0, (SoundSetting.walk || 1.0) * this.masterVolume * this.sfxVolume));
        audio.currentTime = 0;
        
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            this.walkLoopSource = audio;
            this.isWalkPlaying = true;
          }).catch(error => {
            console.warn('Failed to play fallback walk sound:', error);
          });
        } else {
          this.walkLoopSource = audio;
          this.isWalkPlaying = true;
        }
      }
      
    } catch (error) {
      console.error('Error playing fallback walk sound:', error);
    }
  }

  stopWalkSound() {
    if (this.walkLoopSource) {
      try {
        if (this.useFallback) {
          this.walkLoopSource.pause();
          this.walkLoopSource.currentTime = 0;
        } else {
          this.walkLoopSource.stop();
        }
      } catch (error) {
        console.warn('Error stopping walk sound:', error);
      }
      this.walkLoopSource = null;
      this.isWalkPlaying = false;
    }
  }

  playAttackSound() {
    this.playSound('attackSound', 1.0);
  }

  playHitSound() {
    this.playSound('hit', 1.0);
  }

  playLevelUpSound() {
    this.playSound('levelup', 1.0);
  }

  playLevelSelectSound() {
    this.playSound('levelselect', 1.0);
  }

  playGameOverSound() {
    this.stopBGM();
    this.stopWalkSound();
    this.playSound('gameover', 1.0);
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.masterVolume;
    }
    
    if (this.useFallback) {
      if (this.currentBGM) {
        this.currentBGM.volume = Math.min(1.0, Math.max(0, this.masterVolume * this.bgmVolume));
      }
      if (this.walkLoopSource && this.isWalkPlaying) {
        this.walkLoopSource.volume = Math.min(1.0, Math.max(0, (SoundSetting.walk || 1.0) * this.masterVolume * this.sfxVolume));
      }
    }
  }

  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.bgmVolume;
    }
    
    if (this.useFallback && this.currentBGM) {
      this.currentBGM.volume = Math.min(1.0, Math.max(0, this.masterVolume * this.bgmVolume));
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.sfxVolume;
    }
    
    if (this.useFallback && this.walkLoopSource && this.isWalkPlaying) {
      this.walkLoopSource.volume = Math.min(1.0, Math.max(0, this.masterVolume * this.sfxVolume));
    }
  }

  stopAllSounds() {
    this.stopBGM();
    this.stopWalkSound();
  }

  destroy() {
    this.stopAllSounds();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(error => {
        console.warn('Error closing AudioContext:', error);
      });
    }
    
    Object.values(this.fallbackAudioElements).forEach(audio => {
      try {
        audio.pause();
        audio.src = '';
        audio.load();
      } catch (error) {
        console.warn('Error cleaning up fallback audio:', error);
      }
    });
    
    this.sounds = {};
    this.fallbackAudioElements = {};
    this.isInitialized = false;
    this.hasBeenInitialized = false;
    this.isAudioContextBroken = false;
    this.useFallback = false;
    this.retryCount = 0;
    this.initInProgress = false;
    this.fallbackInitInProgress = false;
    this.soundsLoadInProgress = false;
    this.isBGMLoaded = false;
  }
}

// 싱글톤 인스턴스 생성 및 export
export default new GameSounds();