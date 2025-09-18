// systems/GameHandle.js
import GameSetting from '../setting/GameSetting.jsx';
import GameEngine from './GameEngine.jsx';

export default class GameHandle {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    this.gameState = 'menu';
    this.lastTime = 0;
    this.deltaTime = 0;
    this.gameStartTime = 0;

    // 테스트 모드 플래그
    this.isTestMode = false;

    // 게임 통계 - 초기값은 null로 설정
    this.stats = null;
    this.finalStats = null; // 게임 종료 시 저장될 최종 stats

    // 게임 엔진 인스턴스
    this.gameEngine = new GameEngine(canvas, this);

    this.setupEventListeners();
  }

  init() {
    try {
      this.gameEngine.init();
      this.gameLoop();
    } catch (error) {
      console.error('Error in GameHandle init:', error);
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.gameEngine.setKey(e.key.toLowerCase(), true);
      if (e.key === 'Escape' && this.gameState === 'playing') {
        this.pauseGame();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.gameEngine.setKey(e.key.toLowerCase(), false);
    });
  }

  gameLoop = (currentTime) => {
    try {
      this.deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      if (this.gameState === 'playing' && this.stats) {
        this.gameEngine.update(this.deltaTime);
        this.gameEngine.render();

        this.stats.time = Math.floor((currentTime - this.gameStartTime) / 1000);
        this.callbacks.onStatsUpdate({ ...this.stats });
      }
    } catch (error) {
      console.error('Error in game loop:', error);
    }

    requestAnimationFrame(this.gameLoop);
  };

  startGame() {
    console.log('Starting game with test mode:', this.isTestMode);

    // 게임 시작 시 시간 초기화
    this.gameStartTime = performance.now();

    // 게임 시작 시 stats 초기화
    this.stats = {
      level: 1,
      kills: 0,
      time: 0,
      hp: GameSetting.player.maxHp,
      maxHp: GameSetting.player.maxHp,
      exp: 0,
      maxExp: GameSetting.exp.baseToLevel
    };

    // 이전 게임의 finalStats 완전히 초기화
    this.finalStats = null;

    // 게임 엔진 초기화
    this.gameEngine.startGame();

    this.gameState = 'playing';
    this.callbacks.onStateChange('playing');
    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  pauseGame() {
    this.gameState = 'paused';
    this.callbacks.onStateChange('paused');
  }

  resumeGame() {
    this.gameState = 'playing';
    this.callbacks.onStateChange('playing');
  }

  levelUp() {
    this.gameState = 'playing';
    this.callbacks.onStateChange('playing');
  }

  // GameEngine에서 호출될 콜백 메서드들
  onPlayerDeath() {
    // 최종 stats 저장 (현재 stats의 스냅샷)
    this.finalStats = { ...this.stats };
    console.log('Player died - Final stats saved:', this.finalStats);
    console.log('Test mode flag at death:', this.isTestMode);
    this.gameState = 'gameover';
    this.callbacks.onStateChange('gameover');
  }

  onStatsChange(newStats) {
    Object.assign(this.stats, newStats);
    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  onLevelUp() {
    this.gameState = 'levelup';
    this.callbacks.onStateChange('levelup');
  }

  getFinalStats() {
    // finalStats가 있고 유효한 게임 진행이 있었는지 확인
    if (this.finalStats && (this.finalStats.kills > 0 || this.finalStats.level > 1 || this.finalStats.time > 5)) {
      return this.finalStats;
    }

    // 현재 stats가 있고 유효한 게임 진행이 있었는지 확인
    if (this.stats && (this.stats.kills > 0 || this.stats.level > 1 || this.stats.time > 5)) {
      return this.stats;
    }

    return null;
  }

  // 게임이 진행 중인지 확인하는 메서드
  isGameActive() {
    return this.gameState === 'playing' && this.stats !== null;
  }

  // GameEngine에서 사용할 수 있는 getter들
  getStats() {
    return this.stats;
  }

  getGameState() {
    return this.gameState;
  }

  // 외부 입력 설정 (모바일 조이스틱 등)
  setInputVector(x, y) {
    this.gameEngine.setInputVector(x, y);
  }

  destroy() {
    // 정리 작업
    this.finalStats = null;
    this.stats = null;
    this.gameStartTime = 0;
    this.isTestMode = false;
    
    if (this.gameEngine) {
      this.gameEngine.destroy();
    }
  }
}