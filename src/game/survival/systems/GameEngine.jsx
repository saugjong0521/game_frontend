// systems/GameEngine.js
import GameSetting from '../setting/GameSetting.jsx';
import UI from '../setting/UI.jsx';
import { Player, Enemy } from './Character.jsx';
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

    // 외부 입력(모바일 조이스틱 등)
    this.inputVector = { x: 0, y: 0 };

    // 키보드 입력
    this.keys = {};

    // 플레이어 스탯 (레벨업으로 증가)
    this.playerStats = {
      maxHp: GameSetting.player.maxHp,
      speed: GameSetting.player.speed,
      attackSpeed: GameSetting.player.autoAttackSeconds,
      damage: 25 // 기본 공격력
    };
  }

  init() {
    try {
      this.player = new Player(400, 300);
      // 플레이어 초기 스탯 적용
      this.applyStatsToPlayer();
    } catch (error) {
      console.error('Error in GameEngine init:', error);
    }
  }

  // 플레이어에게 현재 스탯 적용
  applyStatsToPlayer() {
    if (this.player) {
      this.player.maxHp = this.playerStats.maxHp;
      this.player.speed = this.playerStats.speed;
      // HP는 현재 값 유지하되 최대치를 넘지 않도록
      this.player.hp = Math.min(this.player.hp, this.playerStats.maxHp);
    }
  }

  update(deltaTime) {
    // 플레이어 업데이트
    this.updatePlayer(deltaTime);

    // 적 스폰
    this.updateEnemySpawn(deltaTime);

    // 적들 업데이트
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player);
    });

    // 자동 공격
    this.updateAutoAttack(deltaTime);

    // 발사체 업데이트
    this.attackObjs.forEach(attackObj => {
      attackObj.update(deltaTime);
    });

    // 경험치 오브 업데이트
    this.expOrbs.forEach(orb => {
      orb.update(deltaTime, this.player);
    });

    // 충돌 검사
    this.handleCollisions();

    // 카메라 업데이트
    this.updateCamera();

    // 죽은 오브젝트 제거
    this.cleanupObjects();
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

    this.player.move(dx, dy, deltaTime);
  }

  updateEnemySpawn(deltaTime) {
    this.enemySpawnTimer += deltaTime;

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

    // 레벨에 따른 속도, 체력, 데미지로 적 생성
    const enemy = new Enemy(x, y, type);
    enemy.speed = this.getEnemySpeed(type);
    enemy.hp = this.getEnemyHp(type);
    enemy.maxHp = enemy.hp;
    enemy.contactDamage = this.getEnemyDamage(type);
    
    this.enemies.push(enemy);
  }

  // 확률에 따른 적 타입 결정 함수 (레벨 제한 포함)
  getEnemyType() {
    const stats = this.gameHandle.getStats();
    const currentLevel = stats.level;
    
    // 현재 레벨에서 등장 가능한 적들만 필터링
    const availableEnemies = [];
    const probabilities = GameSetting.enemySpawn.probabilities;
    
    Object.keys(probabilities).forEach(enemyType => {
      const enemyData = GameSetting.enemies[enemyType];
      if (enemyData && enemyData.level <= currentLevel) {
        availableEnemies.push({
          type: enemyType,
          probability: probabilities[enemyType]
        });
      }
    });
    
    // 사용 가능한 적이 없으면 기본적으로 bat 반환
    if (availableEnemies.length === 0) {
      return 'bat';
    }
    
    // 확률 정규화 (사용 가능한 적들의 확률 합이 1이 되도록)
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
    
    // 폴백: 첫 번째 사용 가능한 적 반환
    return availableEnemies[0].type;
  }

  // 레벨별 몬스터 속도 계산 함수
  getEnemySpeed(enemyType) {
    const stats = this.gameHandle.getStats();
    const baseSpeed = GameSetting.enemies[enemyType].speed;
    const speedIncrease = GameSetting.levelScaling.enemySpeedPerLevel * (stats.level - 1);
    return baseSpeed + speedIncrease;
  }

  // 레벨별 몬스터 체력 계산 함수
  getEnemyHp(enemyType) {
    const stats = this.gameHandle.getStats();
    const baseHp = GameSetting.enemies[enemyType].hp;
    const hpIncrease = GameSetting.levelScaling.enemyHpPerLevel * (stats.level - 1);
    return baseHp + hpIncrease;
  }

  // 레벨별 몬스터 데미지 계산 함수
  getEnemyDamage(enemyType) {
    const stats = this.gameHandle.getStats();
    const baseDamage = GameSetting.enemies[enemyType].contactDamage;
    const damageIncrease = GameSetting.levelScaling.enemyDamagePerLevel * (stats.level - 1);
    return baseDamage + damageIncrease;
  }

  // 레벨업시 체력 회복량 계산 함수
  getLevelUpHealAmount() {
    return Math.floor(this.playerStats.maxHp * GameSetting.levelScaling.levelUpHealPercent);
  }

  updateAutoAttack(deltaTime) {
    this.attackTimer += deltaTime;

    // 플레이어의 현재 공격속도 사용
    if (this.attackTimer >= this.playerStats.attackSpeed) {
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
      // 플레이어의 현재 공격력 적용
      attackObj.damage = this.playerStats.damage;
      this.attackObjs.push(attackObj);
    }
  }

  handleCollisions() {
    const stats = this.gameHandle.getStats();

    // 플레이어와 적 충돌
    this.enemies.forEach(enemy => {
      if (this.checkCollision(this.player, enemy)) {
        if (this.player.tryTakeHit(enemy.contactDamage)) {
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
            // 적 사망 시 경험치 오브 생성 (타입별 색/크기/경험치량)
            const dropExp = GameSetting.expDrop[enemy.type] ?? enemy.expValue;
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

          // 레벨업 시 체력 회복
          const healAmount = this.getLevelUpHealAmount();
          this.player.hp = Math.min(this.player.hp + healAmount, this.playerStats.maxHp);

          this.gameHandle.onStatsChange({
            level: newLevel,
            exp: 0,
            maxExp: newMaxExp,
            hp: this.player.hp,
            maxHp: this.playerStats.maxHp // 현재 최대 체력도 업데이트
          });

          this.gameHandle.onLevelUp();
        }
      }
    });
  }

  // 레벨업 카드 3개 랜덤 선택 (확률 기반)
  generateLevelUpCards() {
    const cardTypes = ['health', 'speed', 'attackSpeed', 'damage'];
    const appearanceRates = GameSetting.cardAppearanceRates;
    
    // 확률에 따른 가중치 배열 생성
    const weightedCards = [];
    cardTypes.forEach(cardType => {
      const weight = appearanceRates[cardType];
      for (let i = 0; i < weight; i++) {
        weightedCards.push(cardType);
      }
    });
    
    // 중복 없이 3개 선택
    const selectedCards = [];
    const availableCards = [...cardTypes]; // 모든 카드 타입 복사
    
    for (let i = 0; i < 3 && availableCards.length > 0; i++) {
      // 현재 사용 가능한 카드들에 대해서만 가중치 계산
      const currentWeightedCards = [];
      availableCards.forEach(cardType => {
        const weight = appearanceRates[cardType];
        for (let j = 0; j < weight; j++) {
          currentWeightedCards.push(cardType);
        }
      });
      
      // 랜덤 선택
      const randomIndex = Math.floor(Math.random() * currentWeightedCards.length);
      const selectedCard = currentWeightedCards[randomIndex];
      
      selectedCards.push(selectedCard);
      
      // 선택된 카드는 사용 가능한 목록에서 제거
      const cardIndex = availableCards.indexOf(selectedCard);
      availableCards.splice(cardIndex, 1);
    }
    
    return selectedCards;
  }
  applyStatUpgrade(cardType) {
    const cards = GameSetting.levelUpCards;
    
    switch(cardType) {
      case 'health':
        this.playerStats.maxHp += cards.health.statIncrease;
        // 체력 증가시 현재 체력도 같이 증가
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

    // 스탯 변경을 게임 핸들에 알림
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

  // 게임 시작 시 호출
  startGame() {
    // 스탯 초기화
    this.playerStats = {
      maxHp: GameSetting.player.maxHp,
      speed: GameSetting.player.speed,
      attackSpeed: GameSetting.player.autoAttackSeconds,
      damage: 25
    };

    // 게임 오브젝트들 초기화
    this.player = new Player(400, 300);
    this.applyStatsToPlayer();
    
    this.enemies = [];
    this.attackObjs = [];
    this.expOrbs = [];
    this.enemySpawnTimer = 0;
    this.attackTimer = 0;
  }

  // 키 입력 설정
  setKey(key, value) {
    this.keys[key] = value;
  }

  // 외부 입력 설정 (모바일 조이스틱 등)
  setInputVector(x, y) {
    this.inputVector.x = x;
    this.inputVector.y = y;
  }

  destroy() {
    // 게임 오브젝트들 정리
    this.player = null;
    this.enemies = [];
    this.attackObjs = [];
    this.expOrbs = [];
    this.keys = {};
    this.inputVector = { x: 0, y: 0 };
  }
}