// setting/GameSounds.jsx
import {
  attackSound,
  bgm,
  gameover,
  hit,
  levelselect,
  levelup,
  walk
} from '@/assets'; // 또는 정확한 경로에 맞게 조정
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
    
    // 사운드 파일 경로 정의 (import된 모듈 사용)
    this.soundPaths = {
      attackSound,
      bgm,
      gameover,
      hit,
      levelselect,
      levelup,
      walk
    };
    
  }

  // 오디오 컨텍스트 초기화 (사용자 상호작용 후 호출)
  async init() {
    if (this.isInitialized) return;
    
    try {
      // AudioContext 생성 시도
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // AudioContext 상태 확인
      if (this.audioContext.state === 'suspended') {
        console.log('AudioContext suspended, attempting to resume...');
        await this.audioContext.resume();
      }
      
      // 마스터 볼륨 노드 생성
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.masterVolume;
      this.masterGainNode.connect(this.audioContext.destination);
      
      // BGM용 게인 노드
      this.bgmGainNode = this.audioContext.createGain();
      this.bgmGainNode.gain.value = this.bgmVolume;
      this.bgmGainNode.connect(this.masterGainNode);
      
      // SFX용 게인 노드
      this.sfxGainNode = this.audioContext.createGain();
      this.sfxGainNode.gain.value = this.sfxVolume;
      this.sfxGainNode.connect(this.masterGainNode);
      
      await this.loadAllSounds();
      this.isInitialized = true;
      this.isAudioContextBroken = false;
      this.retryCount = 0;
      console.log('GameSounds initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GameSounds with AudioContext:', error);
      this.isAudioContextBroken = true;
      
      // 폴백 시스템으로 전환
      await this.initFallbackSystem();
    }
  }

  // 모든 사운드 파일 로드
  async loadAllSounds() {
    console.log('Starting to load all sounds...');
    const loadPromises = Object.entries(this.soundPaths).map(async ([name, path]) => {
      try {
        console.log(`Loading sound: ${name} from ${path}`);
        const response = await fetch(path);
        if (!response.ok) {
          console.warn(`Failed to load sound: ${path}`);
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.sounds[name] = audioBuffer;
        console.log(`Successfully loaded sound: ${name}`);
      } catch (error) {
        console.warn(`Error loading sound ${name}:`, error);
        // AudioContext 에러가 발생하면 전체 시스템을 폴백으로 전환
        if (error.name === 'NotSupportedError' || error.message.includes('AudioContext') || error.message.includes('audio device')) {
          console.error('AudioContext error detected, switching to fallback system');
          throw error; // 상위로 에러 전파하여 폴백 시스템 활성화
        }
      }
    });

    try {
      await Promise.all(loadPromises);
      console.log('All sounds loaded successfully');
    } catch (error) {
      // AudioContext 관련 에러가 발생하면 폴백 시스템으로 전환
      if (error.name === 'NotSupportedError' || error.message.includes('AudioContext') || error.message.includes('audio device')) {
        throw error;
      }
    }
  }

  // 폴백 시스템 초기화 (HTML5 Audio 사용)
  async initFallbackSystem() {
    try {
      console.log('Initializing fallback audio system...');
      
      // HTML5 Audio 요소들 생성
      for (const [name, path] of Object.entries(this.soundPaths)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = 1.0; // 기본 볼륨
        this.fallbackAudioElements[name] = audio;
      }
      
      this.useFallback = true;
      this.isInitialized = true;
      console.log('Fallback audio system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize fallback audio system:', error);
      this.isInitialized = false;
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
      // 기존 AudioContext 정리
      if (this.audioContext) {
        await this.audioContext.close();
      }
      
      // 새로운 AudioContext 생성
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // 게인 노드들 재생성
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.masterVolume;
      this.masterGainNode.connect(this.audioContext.destination);
      
      this.bgmGainNode = this.audioContext.createGain();
      this.bgmGainNode.gain.value = this.bgmVolume;
      this.bgmGainNode.connect(this.masterGainNode);
      
      this.sfxGainNode = this.audioContext.createGain();
      this.sfxGainNode.gain.value = this.sfxVolume;
      this.sfxGainNode.connect(this.masterGainNode);
      
      // 사운드 버퍼들 재로드
      await this.loadAllSounds();
      
      this.isAudioContextBroken = false;
      this.useFallback = false;
      this.retryCount = 0;
      
      console.log('AudioContext recovered successfully');
      return true;
    } catch (error) {
      console.error(`AudioContext recovery failed (attempt ${this.retryCount}):`, error);
      return false;
    }
  }

  // 사용자 상호작용으로 오디오 컨텍스트 재개
  async resumeAudioContext() {
    if (this.useFallback) {
      // 폴백 시스템에서는 복구 시도
      const recovered = await this.recoverAudioContext();
      if (!recovered) {
        console.log('Staying with fallback audio system');
      }
      return;
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
        this.isAudioContextBroken = true;
        await this.initFallbackSystem();
      }
    }
  }

  // AudioContext 상태 확인
  checkAudioContextHealth() {
    if (!this.audioContext) return false;
    
    try {
      // 간단한 테스트로 AudioContext가 작동하는지 확인
      const testSource = this.audioContext.createBufferSource();
      const testGain = this.audioContext.createGain();
      testSource.connect(testGain);
      testGain.connect(this.audioContext.destination);
      return true;
    } catch (error) {
      console.warn('AudioContext health check failed:', error);
      return false;
    }
  }

  // 단발성 사운드 재생
  playSound(soundName, volume = 1.0) {
    if (!this.isInitialized) {
      console.warn(`Sound system not initialized: ${soundName}`);
      return null;
    }

    // 개별 사운드 볼륨 적용
    const individualVolume = SoundSetting[soundName];
    const finalVolume = volume * individualVolume;

    // AudioContext 상태 확인
    if (!this.useFallback && !this.checkAudioContextHealth()) {
      console.log('AudioContext not healthy, switching to fallback system');
      this.isAudioContextBroken = true;
      this.useFallback = true;
      this.initFallbackSystem().catch(err => {
        console.error('Failed to initialize fallback system:', err);
      });
    }

    // 폴백 시스템 사용
    if (this.useFallback) {
      return this.playSoundFallback(soundName, finalVolume);
    }

    // AudioContext 사용
    if (!this.sounds[soundName]) {
      console.warn(`Sound not available: ${soundName}`);
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
      this.isAudioContextBroken = true;
      
      // 폴백으로 전환 시도
      this.useFallback = true;
      this.initFallbackSystem().catch(err => {
        console.error('Failed to initialize fallback system:', err);
      });
      return this.playSoundFallback(soundName, finalVolume);
    }
  }

  // 폴백 사운드 재생 (HTML5 Audio)
  playSoundFallback(soundName, volume = 1.0) {
    if (!this.fallbackAudioElements[soundName]) {
      console.warn(`Fallback sound not available: ${soundName}`);
      return null;
    }

    try {
      const audio = this.fallbackAudioElements[soundName].cloneNode();
      audio.volume = volume * this.masterVolume * this.sfxVolume;
      audio.play().catch(error => {
        console.warn(`Failed to play fallback sound ${soundName}:`, error);
      });
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

    // 이미 재생 중이면 재시작하지 않음 (restart가 false인 경우)
    if (this.currentBGM && !restart) return;

    this.stopBGM();

    // AudioContext 상태 확인
    if (!this.useFallback && !this.checkAudioContextHealth()) {
      console.log('AudioContext not healthy, switching to fallback system');
      this.isAudioContextBroken = true;
      this.useFallback = true;
      this.initFallbackSystem().catch(err => {
        console.error('Failed to initialize fallback system:', err);
      });
    }

    // 폴백 시스템 사용
    if (this.useFallback) {
      this.playBGMFallback();
      return;
    }

    // AudioContext 사용
    if (!this.sounds.bgm) {
      console.warn('BGM not available');
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
      this.isAudioContextBroken = true;
      this.useFallback = true;
      this.initFallbackSystem().catch(err => {
        console.error('Failed to initialize fallback system:', err);
      });
      this.playBGMFallback();
    }
  }

  // 폴백 BGM 재생
  playBGMFallback() {
    if (!this.fallbackAudioElements.bgm) {
      console.warn('Fallback BGM not available');
      return;
    }

    try {
      const audio = this.fallbackAudioElements.bgm.cloneNode();
      audio.loop = true;
      audio.volume = this.masterVolume * this.bgmVolume;
      audio.play().catch(error => {
        console.warn('Failed to play fallback BGM:', error);
      });
      
      this.currentBGM = audio;
      console.log('Fallback BGM started');
    } catch (error) {
      console.error('Error playing fallback BGM:', error);
    }
  }

  // BGM 정지
  stopBGM() {
    if (this.currentBGM) {
      try {
        if (this.useFallback) {
          // HTML5 Audio 요소 정지
          this.currentBGM.pause();
          this.currentBGM.currentTime = 0;
        } else {
          // AudioContext 소스 정지
          this.currentBGM.stop();
        }
      } catch (error) {
        // 이미 정지된 경우 무시
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

    // AudioContext 상태 확인
    if (!this.useFallback && !this.checkAudioContextHealth()) {
      console.log('AudioContext not healthy, switching to fallback system');
      this.isAudioContextBroken = true;
      this.useFallback = true;
      this.initFallbackSystem().catch(err => {
        console.error('Failed to initialize fallback system:', err);
      });
    }

    // 폴백 시스템 사용
    if (this.useFallback) {
      this.startWalkSoundFallback();
      return;
    }

    // AudioContext 사용
    if (!this.sounds.walk) {
      console.warn('Walk sound not available');
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds.walk;
      source.loop = true;
      source.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      gainNode.gain.value = SoundSetting.walk;
      
      source.start();
      this.walkLoopSource = source;
      this.isWalkPlaying = true;
    } catch (error) {
      console.error('Error playing walk sound:', error);
      this.isAudioContextBroken = true;
      this.useFallback = true;
      this.initFallbackSystem().catch(err => {
        console.error('Failed to initialize fallback system:', err);
      });
      this.startWalkSoundFallback();
    }
  }

  // 폴백 걷기 사운드 재생
  startWalkSoundFallback() {
    if (!this.fallbackAudioElements.walk) {
      console.warn('Fallback walk sound not available');
      return;
    }

    try {
      const audio = this.fallbackAudioElements.walk.cloneNode();
      audio.loop = true;
      audio.volume = SoundSetting.walk * this.masterVolume * this.sfxVolume;
      audio.play().catch(error => {
        console.warn('Failed to play fallback walk sound:', error);
      });
      
      this.walkLoopSource = audio;
      this.isWalkPlaying = true;
    } catch (error) {
      console.error('Error playing fallback walk sound:', error);
    }
  }

  // 걷기 사운드 정지
  stopWalkSound() {
    if (this.walkLoopSource) {
      try {
        if (this.useFallback) {
          // HTML5 Audio 요소 정지
          this.walkLoopSource.pause();
          this.walkLoopSource.currentTime = 0;
        } else {
          // AudioContext 소스 정지
          this.walkLoopSource.stop();
        }
      } catch (error) {
        // 이미 정지된 경우 무시
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
    this.stopBGM(); // BGM 정지
    this.stopWalkSound(); // 걷기 소리 정지
    this.playSound('gameover', 1.0);
  }

  // 볼륨 조절
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.masterVolume;
    }
    
    // 폴백 시스템에서 현재 재생 중인 사운드들의 볼륨 업데이트
    if (this.useFallback && this.currentBGM) {
      this.currentBGM.volume = this.masterVolume * this.bgmVolume;
    }
    if (this.useFallback && this.walkLoopSource) {
      this.walkLoopSource.volume = SoundSetting.walk * this.masterVolume * this.sfxVolume;
    }
  }

  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.bgmVolume;
    }
    
    // 폴백 시스템에서 현재 재생 중인 BGM 볼륨 업데이트
    if (this.useFallback && this.currentBGM) {
      this.currentBGM.volume = this.masterVolume * this.bgmVolume;
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.sfxVolume;
    }
    
    // 폴백 시스템에서 현재 재생 중인 걷기 사운드 볼륨 업데이트
    if (this.useFallback && this.walkLoopSource) {
      this.walkLoopSource.volume = 1.0 * this.masterVolume * this.sfxVolume;
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
    
    // AudioContext 정리
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        console.warn('Error closing AudioContext:', error);
      }
    }
    
    // 폴백 오디오 요소들 정리
    Object.values(this.fallbackAudioElements).forEach(audio => {
      try {
        audio.pause();
        audio.src = '';
      } catch (error) {
        console.warn('Error cleaning up fallback audio:', error);
      }
    });
    
    this.sounds = {};
    this.fallbackAudioElements = {};
    this.isInitialized = false;
    this.isAudioContextBroken = false;
    this.useFallback = false;
    this.retryCount = 0;
  }
}

// 싱글톤 인스턴스 생성
let gameSoundsInstance = null;

// 싱글톤 패턴으로 인스턴스 생성
function getGameSoundsInstance() {
  if (!gameSoundsInstance) {
    gameSoundsInstance = new GameSounds();
  }
  return gameSoundsInstance;
}

export default getGameSoundsInstance;