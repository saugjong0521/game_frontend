import {
  GameSetting,
  GameEngine
} from '@/game/survival';

export default class GameHandle {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    this.gameState = 'menu';
    this.lastTime = 0;
    this.deltaTime = 0;
    this.gameStartTime = 0;
    this.elapsedTime = 0; // 누적 진행 시간(재생 중에만 증가)

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

      // 게임 엔진 업데이트 및 렌더링
      if (this.gameState === 'playing' && this.stats) {
        // 전체 게임 로직 업데이트 (이펙트 포함)
        this.gameEngine.update(this.deltaTime);
        this.gameEngine.render();

        // 일시정지/레벨업 동안은 시간이 증가하지 않도록 누적
        this.elapsedTime += this.deltaTime;
        this.stats.time = Math.floor(this.elapsedTime);
        this.callbacks.onStatsUpdate({ ...this.stats });
      } else if (this.gameState === 'paused' || this.gameState === 'levelup' || this.gameState === 'gameover') {
        // 일시정지, 레벨업, 게임오버 상태에서도 이펙트는 계속 업데이트하고 렌더링
        this.gameEngine.update(this.deltaTime);
        this.gameEngine.render();
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
    this.elapsedTime = 0;

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
    this.gameEngine.pause(); // 게임 엔진에 일시정지 알림
    this.callbacks.onStateChange('paused');
  }

  resumeGame() {
    this.gameState = 'playing';
    this.gameEngine.resume(); // 게임 엔진에 재개 알림
    this.callbacks.onStateChange('playing');
  }

  // 레벨업 시 호출
  onLevelUp() {
    this.gameState = 'levelup';
    this.callbacks.onStateChange('levelup');
  }

  // 스탯 업그레이드 선택
  selectStatUpgrade(cardType) {
    // 게임 엔진에 스탯 업그레이드 적용
    this.gameEngine.applyStatUpgrade(cardType);
    
    // 게임 재개
    this.levelUp();
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
    
    // 게임오버 처리 (게임 엔진에서 처리)
    this.gameEngine.onGameOver();
    
    this.gameState = 'gameover';
    this.callbacks.onStateChange('gameover');
  }

  onStatsChange(newStats) {
    Object.assign(this.stats, newStats);
    this.callbacks.onStatsUpdate({ ...this.stats });
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