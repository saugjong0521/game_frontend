// systems/GameEngine.js
import GameSetting from '../setting/GameSetting.jsx';
import UI from '../setting/UI.jsx';
import { Player, Enemy } from './Character.jsx';
import { AttackObj, ExpOrb } from './Play.jsx'

export default class GameEngine {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;

    this.gameState = 'menu';
    this.lastTime = 0;
    this.deltaTime = 0;
    this.gameStartTime = 0; // 게임 시작 시점 추가

    // 테스트 모드 플래그 (클로저 문제 해결을 위한 확실한 방법)
    this.isTestMode = false;

    // 게임 오브젝트들
    this.player = null;
    this.enemies = [];
    this.attackObjs = [];
    this.expOrbs = [];

    // 게임 통계 - 초기값은 null로 설정
    this.stats = null;
    this.finalStats = null; // 게임 종료 시 저장될 최종 stats

    this.camera = { x: 0, y: 0 };
    this.enemySpawnTimer = 0;
    this.attackTimer = 0;

    // 외부 입력(모바일 조이스틱 등)
    this.inputVector = { x: 0, y: 0 };

    // 키보드 입력
    this.keys = {};
    this.setupEventListeners();
  }

  init() {
    try {
      this.player = new Player(400, 300);
      this.gameLoop();
    } catch (error) {
      console.error('Error in GameEngine init:', error);
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'Escape' && this.gameState === 'playing') {
        this.pauseGame();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  gameLoop = (currentTime) => {
    try {
      this.deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      if (this.gameState === 'playing' && this.stats) {
        this.update();
        this.render();

        this.stats.time = Math.floor((currentTime - this.gameStartTime) / 1000);
        this.callbacks.onStatsUpdate({ ...this.stats });
      }
    } catch (error) {
      console.error('Error in game loop:', error);
    }

    requestAnimationFrame(this.gameLoop);
  };

  update() {
    // 플레이어 업데이트
    this.updatePlayer();

    // 적 스폰
    this.updateEnemySpawn();

    // 적들 업데이트
    this.enemies.forEach(enemy => {
      enemy.update(this.deltaTime, this.player);
    });

    // 자동 공격
    this.updateAutoAttack();

    // 발사체 업데이트
    this.attackObjs.forEach(attackObj => {
      attackObj.update(this.deltaTime);
    });

    // 경험치 오브 업데이트
    this.expOrbs.forEach(orb => {
      orb.update(this.deltaTime, this.player);
    });

    // 충돌 검사
    this.handleCollisions();

    // 카메라 업데이트
    this.updateCamera();

    // 죽은 오브젝트 제거
    this.cleanupObjects();
  }

  updatePlayer() {
    let dx = 0, dy = 0;

    if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dx += 1;

    // 외부 입력(조이스틱)이 존재하면 우선 사용
    if (Math.abs(this.inputVector.x) > 0.1 || Math.abs(this.inputVector.y) > 0.1) {
      dx = this.inputVector.x;
      dy = this.inputVector.y;
    }

    // 정규화
    const mag = Math.hypot(dx, dy);
    if (mag > 1) {
      dx /= mag;
      dy /= mag;
    }

    this.player.move(dx, dy, this.deltaTime);
  }

  updateEnemySpawn() {
    this.enemySpawnTimer += this.deltaTime;

    if (this.enemySpawnTimer >= GameSetting.enemySpawn.baseSeconds) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }
  }

  spawnEnemy() {
    // 화면 밖에서 적 스폰
    const angle = Math.random() * Math.PI * 2;
    const distance = 500; // 화면에서 충분히 멀리
    const x = this.player.x + Math.cos(angle) * distance;
    const y = this.player.y + Math.sin(angle) * distance;

    // 확률에 따른 적 타입 결정
    const type = this.getEnemyType();

    // 레벨에 따른 속도로 적 생성
    const enemy = new Enemy(x, y, type);
    enemy.speed = this.getEnemySpeed(type);
    this.enemies.push(enemy);
  }

  // 확률에 따른 적 타입 결정 함수
  getEnemyType() {
    const probabilities = GameSetting.enemySpawn.probabilities;
    const roll = Math.random();

    if (roll < probabilities.bat) return 'bat';
    else if (roll < probabilities.bat + probabilities.eyeball) return 'eyeball';
    else return 'dog';
  }

  // 레벨별 몬스터 속도 계산 함수
  getEnemySpeed(enemyType) {
    const baseSpeed = GameSetting.enemies[enemyType].speed;
    const speedIncrease = GameSetting.levelScaling.enemySpeedPerLevel * (this.stats.level - 1);
    return baseSpeed + speedIncrease;
  }

  // 레벨업시 체력 회복량 계산 함수
  getLevelUpHealAmount() {
    return Math.floor(this.stats.maxHp * GameSetting.levelScaling.levelUpHealPercent);
  }

  updateAutoAttack() {
    this.attackTimer += this.deltaTime;

    if (this.attackTimer >= GameSetting.autoAttackSeconds) {
      this.autoAttack();
      this.attackTimer = 0;
    }
  }

  autoAttack() {
    if (this.enemies.length === 0) return;

    // 가장 가까운 적 찾기
    let closestEnemy = null;
    let closestDistance = Infinity;

    this.enemies.forEach(enemy => {
      const distance = this.getDistance(this.player, enemy);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      const attackObj = new AttackObj(
        this.player.x,
        this.player.y,
        closestEnemy.x,
        closestEnemy.y
      );
      this.attackObjs.push(attackObj);
    }
  }

  handleCollisions() {
    // 플레이어와 적 충돌
    this.enemies.forEach(enemy => {
      if (this.checkCollision(this.player, enemy)) {
        if (this.player.tryTakeHit(enemy.contactDamage)) {
          this.stats.hp = this.player.hp;
          this.callbacks.onStatsUpdate({ ...this.stats });
          if (this.player.hp <= 0) {
            // 최종 stats 저장 (현재 stats의 스냅샷)
            this.finalStats = { ...this.stats };
            console.log('Player died - Final stats saved:', this.finalStats);
            console.log('Test mode flag at death:', this.isTestMode);
            this.gameState = 'gameover';
            this.callbacks.onStateChange('gameover');
          }
        }
      }
    });

    // 발사체와 적 충돌
    this.attackObjs.forEach((attackObj, pIndex) => {
      this.enemies.forEach((enemy, eIndex) => {
        if (this.checkCollision(attackObj, enemy)) {
          enemy.takeDamage(attackObj.damage);
          attackObj.destroy();

          if (enemy.hp <= 0) {
            // 적 사망 시 경험치 오브 생성 (타입별 색/크기/경험치량)
            const dropExp = GameSetting.expDrop[enemy.type] ?? enemy.expValue;
            const orbSkin = UI.expOrbPerEnemy[enemy.type] ?? UI.expOrb;
            this.expOrbs.push(new ExpOrb(enemy.x, enemy.y, dropExp, orbSkin));
            this.enemies.splice(eIndex, 1);
            this.stats.kills += 1;
            this.callbacks.onStatsUpdate({ ...this.stats });
          }
        }
      });
    });

    // 플레이어와 경험치 오브 충돌
    this.expOrbs.forEach((orb, index) => {
      if (this.checkCollision(this.player, orb)) {
        this.stats.exp += orb.value;
        this.expOrbs.splice(index, 1);
        this.callbacks.onStatsUpdate({ ...this.stats });

        // 레벨업 체크
        if (this.stats.exp >= this.stats.maxExp) {
          this.stats.level += 1;
          this.stats.exp = 0;
          this.stats.maxExp += GameSetting.exp.perLevelIncrement;

          // 레벨업 시 체력 회복
          const healAmount = this.getLevelUpHealAmount();
          this.player.hp = Math.min(this.player.hp + healAmount, this.stats.maxHp);
          this.stats.hp = this.player.hp;

          this.callbacks.onStatsUpdate({ ...this.stats });
          this.gameState = 'levelup';
          this.callbacks.onStateChange('levelup');
        }
      }
    });
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

  // 게임이 진행 중인지 확인하는 메서드 추가
  isGameActive() {
    return this.gameState === 'playing' && this.stats !== null;
  }

  checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius + obj2.radius);
  }

  getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  updateCamera() {
    // 플레이어를 중심으로 카메라 위치 설정
    this.camera.x = this.player.x - this.canvas.width / 2;
    this.camera.y = this.player.y - this.canvas.height / 2;
  }

  cleanupObjects() {
    this.attackObjs = this.attackObjs.filter(p => !p.shouldDestroy);
    this.enemies = this.enemies.filter(e => e.hp > 0);
    this.expOrbs = this.expOrbs.filter(orb => !orb.collected);
  }

  render() {
    // 화면 클리어
    this.ctx.fillStyle = UI.map.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 카메라 변환 적용
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // 배경 이미지 렌더링 (타일링)
    this.drawBackground();

    // 배경 그리드 (옵션)
    this.drawGrid();

    // 게임 오브젝트들 렌더링
    this.player.render(this.ctx);

    this.enemies.forEach(enemy => {
      enemy.render(this.ctx);
    });

    this.attackObjs.forEach(attackObj => {
      attackObj.render(this.ctx);
    });

    this.expOrbs.forEach(orb => {
      orb.render(this.ctx);
    });

    this.ctx.restore();
  }

  drawBackground() {
    const backgroundImage = UI.map.backgroundImage;

    if (backgroundImage && backgroundImage.complete && backgroundImage.naturalHeight !== 0) {
      // 이미지가 로드되었을 때만 그리기
      const imageWidth = backgroundImage.width;
      const imageHeight = backgroundImage.height;

      // 카메라 위치를 기준으로 타일링할 범위 계산
      const startX = Math.floor(this.camera.x / imageWidth) * imageWidth;
      const startY = Math.floor(this.camera.y / imageHeight) * imageHeight;
      const endX = this.camera.x + this.canvas.width + imageWidth;
      const endY = this.camera.y + this.canvas.height + imageHeight;

      // 배경 이미지를 타일링해서 그리기
      for (let x = startX; x < endX; x += imageWidth) {
        for (let y = startY; y < endY; y += imageHeight) {
          this.ctx.drawImage(backgroundImage, x, y);
        }
      }
    }
  }

  drawGrid() {
    // 그리드를 그릴지 여부 (배경 이미지가 있으면 그리드는 선택사항)
    const shouldDrawGrid = true; // 필요에 따라 false로 변경 가능

    if (!shouldDrawGrid) return;

    this.ctx.strokeStyle = UI.map.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.3; // 배경 이미지 위에 그리드를 반투명하게

    const gridSize = UI.map.gridSize;
    const startX = Math.floor(this.camera.x / gridSize) * gridSize;
    const startY = Math.floor(this.camera.y / gridSize) * gridSize;

    for (let x = startX; x < this.camera.x + this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.camera.y);
      this.ctx.lineTo(x, this.camera.y + this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = startY; y < this.camera.y + this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.camera.x, y);
      this.ctx.lineTo(this.camera.x + this.canvas.width, y);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1.0; // 투명도 복원
  }

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

    // 게임 오브젝트들 초기화
    this.player = new Player(400, 300);
    this.enemies = [];
    this.attackObjs = [];
    this.expOrbs = [];
    this.enemySpawnTimer = 0;
    this.attackTimer = 0;

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

  destroy() {
    // 정리 작업
    this.finalStats = null;
    this.stats = null;
    this.gameStartTime = 0;
    this.isTestMode = false;
  }
}