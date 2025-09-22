// systems/GameEngine.js - 사운드 시스템 통합 버전
import GameSetting from '../setting/GameSetting.jsx';
import UI from '../setting/UI.jsx';
import { Player, Enemy } from './Character.jsx';
import getGameSounds from './GameSounds.jsx';
import { AttackObj, ExpOrb } from './Play.jsx';

export default class GameEngine {
  constructor(canvas, gameHandle) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gameHandle = gameHandle;

    // 게임 오브젝트들
    this.player = null;
    this.enemies = [];
    this.attackObjs = [];
    this.expOrbs = [];

    this.camera = { x: 0, y: 0 };
    this.enemySpawnTimer = 0;
    this.attackTimer = 0;

    // 시간 기반 난이도 시스템
    this.gameTime = 0;
    this.currentSpawnRate = GameSetting.enemySpawn.baseSeconds;

    // 일시정지 시스템
    this.isPaused = false;

    // 외부 입력(모바일 조이스틱 등)
    this.inputVector = { x: 0, y: 0 };

    // 키보드 입력
    this.keys = {};

    // 플레이어 스탯 (레벨업으로 증가)
    this.playerStats = {
      maxHp: GameSetting.player.maxHp,
      speed: GameSetting.player.speed,
      attackSpeed: GameSetting.player.autoAttackSeconds,
      damage: GameSetting.player.damage,
    };

    // 사운드 관련 상태
    this.wasPlayerMoving = false;
    this.soundInitialized = false;
  }

  async init() {
    try {
      this.player = new Player(400, 300);
      this.applyStatsToPlayer();
      this.gameTime = 0;
      this.currentSpawnRate = GameSetting.enemySpawn.baseSeconds;
      this.isPaused = false;

      // 사운드 시스템 초기화 (첫 사용자 상호작용 시)
      this.initSoundsOnFirstInteraction();
    } catch (error) {
      console.error('Error in GameEngine init:', error);
    }
  }

  // 첫 사용자 상호작용 시 사운드 초기화
  async initSoundsOnFirstInteraction() {
    if (this.soundInitialized) return;

    try {
      const gameSounds = getGameSounds();
      await gameSounds.init();
      await gameSounds.resumeAudioContext();
      this.soundInitialized = true;
      console.log('Sound system initialized');
    } catch (error) {
      console.error('Failed to initialize sound system:', error);
    }
  }

  applyStatsToPlayer() {
    if (this.player) {
      this.player.maxHp = this.playerStats.maxHp;
      this.player.speed = this.playerStats.speed;
      this.player.hp = Math.min(this.player.hp, this.playerStats.maxHp);
    }
  }

  update(deltaTime) {
    // 일시정지 상태에서는 게임 로직 업데이트 중단
    if (this.isPaused) {
      return;
    }

    // 게임 시간 업데이트
    this.gameTime += deltaTime;

    // 시간에 따른 스폰 속도 업데이트
    this.updateSpawnRate();

    // 플레이어 업데이트 (사운드 포함)
    this.updatePlayer(deltaTime);

    // 적 스폰
    this.updateEnemySpawn(deltaTime);

    // 적들 업데이트
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player);
    });

    // 자동 공격 (사운드 포함)
    this.updateAutoAttack(deltaTime);

    // 발사체 업데이트
    this.attackObjs.forEach(attackObj => {
      attackObj.update(deltaTime);
    });

    // 경험치 오브 업데이트
    this.expOrbs.forEach(orb => {
      orb.update(deltaTime, this.player);
    });

    // 충돌 검사 (사운드 포함)
    this.handleCollisions();

    // 카메라 업데이트
    this.updateCamera();

    // 죽은 오브젝트 제거
    this.cleanupObjects();
  }

  updateSpawnRate() {
    const scaling = GameSetting.timeScaling;
    const intervals = Math.floor(this.gameTime / scaling.scalingInterval);

    const spawnRateMultiplier = 1 - (intervals * scaling.spawnRateIncrease);
    this.currentSpawnRate = Math.max(
      scaling.maxSpawnRate,
      GameSetting.enemySpawn.baseSeconds * spawnRateMultiplier
    );
  }

  updatePlayer(deltaTime) {
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

    // 플레이어 이동
    this.player.move(dx, dy, deltaTime);

    // 걷기 사운드 처리
    this.handleWalkSound(dx, dy);
  }

  // 걷기 사운드 처리
  handleWalkSound(dx, dy) {
    if (!this.soundInitialized) return;

    const isMoving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;

    if (isMoving && !this.wasPlayerMoving) {
      // 이동 시작 시 걷기 사운드 재생
      getGameSounds().startWalkSound();
    } else if (!isMoving && this.wasPlayerMoving) {
      // 이동 중지 시 걷기 사운드 정지
      getGameSounds().stopWalkSound();
    }

    this.wasPlayerMoving = isMoving;
  }

  updateEnemySpawn(deltaTime) {
    this.enemySpawnTimer += deltaTime;

    if (this.enemySpawnTimer >= this.currentSpawnRate) {
      this.spawnEnemy();
      this.enemySpawnTimer = 0;
    }
  }

  spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 500;
    const x = this.player.x + Math.cos(angle) * distance;
    const y = this.player.y + Math.sin(angle) * distance;

    const type = this.getEnemyType();
    const enemy = new Enemy(x, y, type);
    enemy.speed = this.getEnemySpeed(type);
    enemy.hp = this.getEnemyHp(type);
    enemy.maxHp = enemy.hp;
    enemy.contactDamage = this.getEnemyDamage(type);

    this.enemies.push(enemy);
  }

  getEnemyType() {
    const availableEnemies = [];
    const probabilities = GameSetting.enemySpawn.probabilities;

    Object.keys(probabilities).forEach(enemyType => {
      const enemyData = GameSetting.enemies[enemyType];
      if (enemyData && this.gameTime >= enemyData.unlockTime) {
        availableEnemies.push({
          type: enemyType,
          probability: probabilities[enemyType]
        });
      }
    });

    if (availableEnemies.length === 0) {
      return 'bat';
    }

    const totalProbability = availableEnemies.reduce((sum, enemy) => sum + enemy.probability, 0);
    const roll = Math.random();
    let cumulativeProbability = 0;

    for (const enemy of availableEnemies) {
      const normalizedProbability = enemy.probability / totalProbability;
      cumulativeProbability += normalizedProbability;

      if (roll <= cumulativeProbability) {
        return enemy.type;
      }
    }

    return availableEnemies[0].type;
  }

  getEnemySpeed(enemyType) {
    const baseSpeed = GameSetting.enemies[enemyType].speed;
    const scaling = GameSetting.timeScaling;
    const intervals = Math.floor(this.gameTime / scaling.scalingInterval);
    const speedIncrease = scaling.enemySpeedPerInterval * intervals;
    return baseSpeed + speedIncrease;
  }

  getEnemyHp(enemyType) {
    const baseHp = GameSetting.enemies[enemyType].hp;
    const scaling = GameSetting.timeScaling;
    const intervals = Math.floor(this.gameTime / scaling.scalingInterval);
    const hpIncrease = scaling.enemyHpPerInterval * intervals;
    return baseHp + hpIncrease;
  }

  getEnemyDamage(enemyType) {
    const baseDamage = GameSetting.enemies[enemyType].contactDamage;
    const scaling = GameSetting.timeScaling;
    const intervals = Math.floor(this.gameTime / scaling.scalingInterval);
    const damageIncrease = scaling.enemyDamagePerInterval * intervals;
    return baseDamage + damageIncrease;
  }

  getLevelUpHealAmount() {
    return Math.floor(this.playerStats.maxHp * GameSetting.player.levelUpHealPercent);
  }

  updateAutoAttack(deltaTime) {
    this.attackTimer += deltaTime;

    if (this.attackTimer >= this.playerStats.attackSpeed) {
      this.autoAttack();
      this.attackTimer = 0;
    }
  }

  autoAttack() {
    if (this.enemies.length === 0) return;

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
      attackObj.damage = this.playerStats.damage;
      this.attackObjs.push(attackObj);

      // 공격 사운드 재생
      if (this.soundInitialized) {
        getGameSounds().playAttackSound();
      }
    }
  }

  handleCollisions() {
    const stats = this.gameHandle.getStats();

    // 플레이어와 적 충돌
    this.enemies.forEach(enemy => {
      if (this.checkCollision(this.player, enemy)) {
        if (this.player.tryTakeHit(enemy.contactDamage)) {
          // 피격 사운드 재생
          if (this.soundInitialized) {
            getGameSounds().playHitSound();
          }

          this.gameHandle.onStatsChange({ hp: this.player.hp });
          if (this.player.hp <= 0) {
            this.gameHandle.onPlayerDeath();
            return;
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
            const dropExp = GameSetting.enemies[enemy.type]?.exp || enemy.expValue;
            const orbSkin = UI.expOrbPerEnemy[enemy.type] ?? UI.expOrb;
            this.expOrbs.push(new ExpOrb(enemy.x, enemy.y, dropExp, orbSkin));
            this.enemies.splice(eIndex, 1);
            this.gameHandle.onStatsChange({ kills: stats.kills + 1 });
          }
        }
      });
    });

    // 플레이어와 경험치 오브 충돌
    this.expOrbs.forEach((orb, index) => {
      if (this.checkCollision(this.player, orb)) {
        const newExp = stats.exp + orb.value;
        this.expOrbs.splice(index, 1);
        this.gameHandle.onStatsChange({ exp: newExp });

        // 레벨업 체크
        if (newExp >= stats.maxExp) {
          const newLevel = stats.level + 1;
          const newMaxExp = stats.maxExp + GameSetting.exp.perLevelIncrement;

          let carriedExp = newExp - stats.maxExp;
          if (carriedExp >= newMaxExp) {
            carriedExp = newMaxExp - 1;
          }

          const healAmount = this.getLevelUpHealAmount();
          this.player.hp = Math.min(this.player.hp + healAmount, this.playerStats.maxHp);

          this.gameHandle.onStatsChange({
            level: newLevel,
            exp: carriedExp,
            maxExp: newMaxExp,
            hp: this.player.hp,
            maxHp: this.playerStats.maxHp
          });

          // 레벨업 사운드 재생
          if (this.soundInitialized) {
            getGameSounds().playLevelUpSound();
          }

          this.gameHandle.onLevelUp();
        }
      }
    });
  }

  generateLevelUpCards() {
    const cardTypes = ['health', 'speed', 'attackSpeed', 'damage'];
    const appearanceRates = GameSetting.cardAppearanceRates;

    const weightedCards = [];
    cardTypes.forEach(cardType => {
      const weight = appearanceRates[cardType];
      for (let i = 0; i < weight; i++) {
        weightedCards.push(cardType);
      }
    });

    const selectedCards = [];
    const availableCards = [...cardTypes];

    for (let i = 0; i < 3 && availableCards.length > 0; i++) {
      const currentWeightedCards = [];
      availableCards.forEach(cardType => {
        const weight = appearanceRates[cardType];
        for (let j = 0; j < weight; j++) {
          currentWeightedCards.push(cardType);
        }
      });

      const randomIndex = Math.floor(Math.random() * currentWeightedCards.length);
      const selectedCard = currentWeightedCards[randomIndex];

      selectedCards.push(selectedCard);

      const cardIndex = availableCards.indexOf(selectedCard);
      availableCards.splice(cardIndex, 1);
    }

    return selectedCards;
  }

  applyStatUpgrade(cardType) {
    const cards = GameSetting.levelUpCards;

    // 레벨 선택 사운드 재생
    if (this.soundInitialized) {
      getGameSounds().playLevelSelectSound();
    }

    switch (cardType) {
      case 'health':
        this.playerStats.maxHp += cards.health.statIncrease;
        this.player.maxHp = this.playerStats.maxHp;
        this.player.hp += cards.health.statIncrease;
        break;

      case 'speed':
        this.playerStats.speed += cards.speed.statIncrease;
        this.player.speed = this.playerStats.speed;
        break;

      case 'attackSpeed':
        this.playerStats.attackSpeed = Math.max(0.1, this.playerStats.attackSpeed - cards.attackSpeed.statIncrease);
        break;

      case 'damage':
        this.playerStats.damage += cards.damage.statIncrease;
        break;
    }

    this.gameHandle.onStatsChange({
      hp: this.player.hp,
      maxHp: this.playerStats.maxHp
    });
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
    this.camera.x = this.player.x - this.canvas.width / 2;
    this.camera.y = this.player.y - this.canvas.height / 2;
  }

  cleanupObjects() {
    this.attackObjs = this.attackObjs.filter(p => !p.shouldDestroy);
    this.enemies = this.enemies.filter(e => e.hp > 0);
    this.expOrbs = this.expOrbs.filter(orb => !orb.collected);
  }

  render() {
    this.ctx.fillStyle = UI.map.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);

    this.drawBackground();
    this.drawGrid();

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
      const imageWidth = backgroundImage.width;
      const imageHeight = backgroundImage.height;

      const startX = Math.floor(this.camera.x / imageWidth) * imageWidth;
      const startY = Math.floor(this.camera.y / imageHeight) * imageHeight;
      const endX = this.camera.x + this.canvas.width + imageWidth;
      const endY = this.camera.y + this.canvas.height + imageHeight;

      for (let x = startX; x < endX; x += imageWidth) {
        for (let y = startY; y < endY; y += imageHeight) {
          this.ctx.drawImage(backgroundImage, x, y);
        }
      }
    }
  }

  drawGrid() {
    const shouldDrawGrid = true;

    if (!shouldDrawGrid) return;

    this.ctx.strokeStyle = UI.map.gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.3;

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

    this.ctx.globalAlpha = 1.0;
  }

  // 게임 시작 시 호출
  async startGame() {
    // 스탯 초기화
    this.playerStats = {
      maxHp: GameSetting.player.maxHp,
      speed: GameSetting.player.speed,
      attackSpeed: GameSetting.player.autoAttackSeconds,
      damage: GameSetting.player.damage,
    };

    // 게임 오브젝트들 초기화
    this.player = new Player(400, 300);
    this.applyStatsToPlayer();

    this.enemies = [];
    this.attackObjs = [];
    this.expOrbs = [];
    this.enemySpawnTimer = 0;
    this.attackTimer = 0;

    // 게임 시간 초기화
    this.gameTime = 0;
    this.currentSpawnRate = GameSetting.enemySpawn.baseSeconds;
    this.isPaused = false;
    this.wasPlayerMoving = false;

    // 사운드 시스템 초기화 및 BGM 시작
    await this.initSoundsOnFirstInteraction();
    if (this.soundInitialized) {
      getGameSounds().playBGM();
    }
  }

  // 게임오버 처리
  onGameOver() {
    if (this.soundInitialized) {
      getGameSounds().playGameOverSound();
    }
  }

  // 키 입력 설정
  setKey(key, value) {
    this.keys[key] = value;

    // 첫 키 입력 시 사운드 시스템 초기화
    if (!this.soundInitialized) {
      this.initSoundsOnFirstInteraction();
    }
  }

  // 외부 입력 설정 (모바일 조이스틱 등)
  setInputVector(x, y) {
    this.inputVector.x = x;
    this.inputVector.y = y;

    // 첫 입력 시 사운드 시스템 초기화
    if (!this.soundInitialized) {
      this.initSoundsOnFirstInteraction();
    }
  }

  // 일시정지 제어 메서드들
  pause() {
    this.isPaused = true;
    // 일시정지 시 걷기 사운드 정지
    if (this.soundInitialized) {
      getGameSounds().stopWalkSound();
      this.wasPlayerMoving = false;
    }
  }

  resume() {
    this.isPaused = false;
    // 재개 시 사운드 컨텍스트 재개
    if (this.soundInitialized) {
      getGameSounds().resumeAudioContext();
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.pause();
    } else {
      this.resume();
    }
  }

  getPauseState() {
    return this.isPaused;
  }

  // 현재 게임 시간 반환
  getGameTime() {
    return this.gameTime;
  }

  // 사운드 볼륨 조절 메서드들
  setMasterVolume(volume) {
    if (this.soundInitialized) {
      getGameSounds().setMasterVolume(volume);
    }
  }

  setBGMVolume(volume) {
    if (this.soundInitialized) {
      getGameSounds().setBGMVolume(volume);
    }
  }

  setSFXVolume(volume) {
    if (this.soundInitialized) {
      getGameSounds().setSFXVolume(volume);
    }
  }

  destroy() {
    // 게임 오브젝트들 정리
    this.player = null;
    this.enemies = [];
    this.attackObjs = [];
    this.expOrbs = [];
    this.keys = {};
    this.inputVector = { x: 0, y: 0 };
    this.gameTime = 0;
    this.isPaused = false;
    this.wasPlayerMoving = false;

    // 사운드 정리
    if (this.soundInitialized) {
      getGameSounds().stopAllSounds();
    }
  }
}