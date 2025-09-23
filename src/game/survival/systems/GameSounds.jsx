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
import SoundSetting from '../setting/SoundSetting';

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
    
    // 완전한 무한루프 방지
    this.initInProgress = false;
    this.fallbackInitInProgress = false;
    this.soundsLoadInProgress = false;
    this.hasBeenInitialized = false; // 한 번이라도 초기화되었는지 추적
    
    // 사운드 파일 경로 정의
    this.soundPaths = {
      attackSound,
      bgm,
      gameover,
      hit,
      levelselect,
      levelup,
      walk
    };
    
    // 볼륨 로컬스토리지에서 불러오기
    this.loadVolumeSettings();
  }

  // 볼륨 설정 로드
  loadVolumeSettings() {
    try {
      const savedMaster = localStorage.getItem('gameSounds_masterVolume');
      const savedBGM = localStorage.getItem('gameSounds_bgmVolume');
      const savedSFX = localStorage.getItem('gameSounds_sfxVolume');
      
      if (savedMaster !== null) this.masterVolume = parseFloat(savedMaster);
      if (savedBGM !== null) this.bgmVolume = parseFloat(savedBGM);
      if (savedSFX !== null) this.sfxVolume = parseFloat(savedSFX);
    } catch (error) {
      console.warn('Failed to load volume settings:', error);
    }
  }

  // 볼륨 설정 저장
  saveVolumeSettings() {
    try {
      localStorage.setItem('gameSounds_masterVolume', this.masterVolume.toString());
      localStorage.setItem('gameSounds_bgmVolume', this.bgmVolume.toString());
      localStorage.setItem('gameSounds_sfxVolume', this.sfxVolume.toString());
    } catch (error) {
      console.warn('Failed to save volume settings:', error);
    }
  }

  // 오디오 컨텍스트 초기화 - 완전한 중복 방지
  async init() {
    // 이미 초기화되었거나 초기화 중이면 스킵
    if (this.initInProgress || (this.isInitialized && this.hasBeenInitialized)) {
      console.log('GameSounds init skipped - already initialized or in progress');
      return;
    }
    
    this.initInProgress = true;
    
    try {
      console.log('Starting GameSounds initialization...');
      
      // AudioContext 생성 시도
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        console.log('AudioContext suspended, attempting to resume...');
        await this.audioContext.resume();
      }
      
      // 게인 노드들 생성
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.masterVolume;
      this.masterGainNode.connect(this.audioContext.destination);
      
      this.bgmGainNode = this.audioContext.createGain();
      this.bgmGainNode.gain.value = this.bgmVolume;
      this.bgmGainNode.connect(this.masterGainNode);
      
      this.sfxGainNode = this.audioContext.createGain();
      this.sfxGainNode.gain.value = this.sfxVolume;
      this.sfxGainNode.connect(this.masterGainNode);
      
      // 사운드 로딩 (중복 방지)
      await this.loadAllSounds();
      
      this.isInitialized = true;
      this.hasBeenInitialized = true;
      this.isAudioContextBroken = false;
      this.retryCount = 0;
      console.log('GameSounds initialized successfully with AudioContext');
      
    } catch (error) {
      console.error('Failed to initialize GameSounds with AudioContext:', error);
      this.isAudioContextBroken = true;
      
      // 폴백 시스템으로 전환 (한 번만)
      if (!this.fallbackInitInProgress && !this.useFallback) {
        await this.initFallbackSystem();
      }
    } finally {
      this.initInProgress = false;
    }
  }

  // 사운드 로딩 - 완전한 중복 방지
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
          
        } catch (error) {
          console.warn(`Failed to load sound ${name}:`, error);
          
          // AudioContext 관련 에러인 경우 전체 로딩 중단
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

  // 폴백 시스템 초기화 - 완전한 중복 방지
  async initFallbackSystem() {
    if (this.fallbackInitInProgress || (this.useFallback && this.hasBeenInitialized)) {
      console.log('Fallback system already initialized or initializing, skipping...');
      return;
    }
    
    this.fallbackInitInProgress = true;
    
    try {
      console.log('Initializing fallback audio system...');
      
      // 기존 폴백 요소들이 없는 경우에만 생성
      if (Object.keys(this.fallbackAudioElements).length === 0) {
        for (const [name, path] of Object.entries(this.soundPaths)) {
          const audio = new Audio();
          audio.preload = 'metadata'; // 'auto' 대신 'metadata'로 변경하여 무한로딩 방지
          audio.volume = 1.0;
          audio.src = path;
          
          // 로드 에러 핸들링
          audio.onerror = (e) => {
            console.warn(`Failed to load fallback audio ${name}:`, e);
          };
          
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

  // AudioContext 복구 시도
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
      
      // 새로운 초기화 시도
      this.isInitialized = false;
      this.isAudioContextBroken = false;
      this.useFallback = false;
      this.hasBeenInitialized = false;
      
      await this.init();
      
      console.log('AudioContext recovered successfully');
      return true;
      
    } catch (error) {
      console.error(`AudioContext recovery failed (attempt ${this.retryCount}):`, error);
      
      // 복구 실패 시 폴백으로 되돌리기
      this.isAudioContextBroken = true;
      this.useFallback = true;
      await this.initFallbackSystem();
      
      return false;
    }
  }

  // 사용자 상호작용으로 오디오 컨텍스트 재개
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
        // AudioContext가 없거나 닫혀있으면 초기화 시도
        await this.init();
      }
    } catch (error) {
      console.error('Failed to resume AudioContext:', error);
      this.isAudioContextBroken = true;
      await this.initFallbackSystem();
    }
  }

  // AudioContext 상태 확인 - 더 안전하게
  checkAudioContextHealth() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      return false;
    }
    
    try {
      // 더 간단한 health check
      return this.audioContext.state === 'running' || this.audioContext.state === 'suspended';
    } catch (error) {
      console.warn('AudioContext health check failed:', error);
      return false;
    }
  }

  // 단발성 사운드 재생 - 무한루프 완전 차단
  playSound(soundName, volume = 1.0) {
    if (!this.isInitialized) {
      console.warn(`Sound system not initialized: ${soundName}`);
      return null;
    }

    const individualVolume = SoundSetting[soundName] || 1.0;
    const finalVolume = volume * individualVolume;

    // 폴백 시스템 사용
    if (this.useFallback) {
      return this.playSoundFallback(soundName, finalVolume);
    }

    // AudioContext 사용
    if (!this.sounds[soundName]) {
      console.warn(`Sound not available: ${soundName}`);
      // 폴백으로 시도해보기 (한 번만)
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
      
      // 한 번만 폴백으로 전환 시도
      if (!this.useFallback) {
        this.isAudioContextBroken = true;
        this.useFallback = true;
        // 비동기로 폴백 초기화하되 기다리지 않음
        this.initFallbackSystem();
      }
      
      return null;
    }
  }

  // 폴백 사운드 재생
  playSoundFallback(soundName, volume = 1.0) {
    if (!this.fallbackAudioElements[soundName]) {
      console.warn(`Fallback sound not available: ${soundName}`);
      return null;
    }

    try {
      const audio = this.fallbackAudioElements[soundName];
      
      // 안전한 재생 제어
      if (audio.readyState >= 1) { // HAVE_METADATA
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

  // BGM 재생 (루프)
  playBGM(restart = false) {
    if (!this.isInitialized) {
      console.warn('Sound system not initialized');
      return;
    }

    if (this.currentBGM && !restart) return;

    this.stopBGM();

    // 폴백 시스템 사용
    if (this.useFallback) {
      this.playBGMFallback();
      return;
    }

    if (!this.sounds.bgm) {
      console.warn('BGM not available');
      // 폴백으로 시도
      if (!this.useFallback) {
        this.playBGMFallback();
      }
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds.bgm;
      source.loop = true;
      source.connect(this.bgmGainNode);
      source.start();
      
      this.currentBGM = source;
      console.log('BGM started');
      
    } catch (error) {
      console.error('Error playing BGM:', error);
      
      if (!this.useFallback) {
        this.isAudioContextBroken = true;
        this.useFallback = true;
        this.initFallbackSystem();
        this.playBGMFallback();
      }
    }
  }

  // 폴백 BGM 재생
  playBGMFallback() {
    if (!this.fallbackAudioElements.bgm) {
      console.warn('Fallback BGM not available');
      return;
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
        } else {
          this.currentBGM = audio;
          console.log('Fallback BGM started');
        }
      }
      
    } catch (error) {
      console.error('Error playing fallback BGM:', error);
    }
  }

  // BGM 정지
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

  // 걷기 사운드 재생 (루프)
  startWalkSound() {
    if (!this.isInitialized || this.isWalkPlaying) {
      return;
    }

    // 폴백 시스템 사용
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

  // 폴백 걷기 사운드 재생
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

  // 걷기 사운드 정지
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

  // 게임 특화 사운드 메서드들
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

  // 볼륨 조절 - 로컬스토리지 저장 추가
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveVolumeSettings();
    
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
    this.saveVolumeSettings();
    
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.bgmVolume;
    }
    
    if (this.useFallback && this.currentBGM) {
      this.currentBGM.volume = Math.min(1.0, Math.max(0, this.masterVolume * this.bgmVolume));
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveVolumeSettings();
    
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.sfxVolume;
    }
    
    if (this.useFallback && this.walkLoopSource && this.isWalkPlaying) {
      this.walkLoopSource.volume = Math.min(1.0, Math.max(0, this.masterVolume * this.sfxVolume));
    }
  }

  // 모든 사운드 정지
  stopAllSounds() {
    this.stopBGM();
    this.stopWalkSound();
  }

  // 리소스 정리
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
    
    // 모든 상태 리셋
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
  }
}

// 싱글톤 인스턴스 생성
let gameSoundsInstance = null;

function getGameSoundsInstance() {
  if (!gameSoundsInstance) {
    gameSoundsInstance = new GameSounds();
  }
  return gameSoundsInstance;
}

export default getGameSoundsInstance;