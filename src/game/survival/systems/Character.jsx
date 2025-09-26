import {
  GameSetting,
  UI
} from '@/game/survival';


// Player.js
export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = UI.player.radius;
    this.speed = GameSetting.player.speed; // 동적으로 변경 가능
    this.hp = GameSetting.player.maxHp;
    this.maxHp = GameSetting.player.maxHp;
    this.invulnTimer = 0;
    this.invulnDuration = GameSetting.player.invulnSeconds;
    this.facingDirection = 1; // 1: 오른쪽, -1: 왼쪽

    // 움직임 애니메이션 관련 속성 추가
    this.isMoving = false;
    this.animationTimer = 0;
    this.currentFrame = 0;
  }

  move(dx, dy, deltaTime) {
    // 움직임 상태 확인
    this.isMoving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;

    // 실제 이동 - 현재 speed 값 사용 (GameEngine에서 업그레이드 시 동적으로 변경됨)
    this.x += dx * this.speed * deltaTime;
    this.y += dy * this.speed * deltaTime;

    // 좌우 이동 방향에 따라 바라보는 방향 업데이트
    if (dx > 0.1) {
      this.facingDirection = -1; // 오른쪽으로 이동 시 이미지 반전 (왼쪽 보기)
    } else if (dx < -0.1) {
      this.facingDirection = 1; // 왼쪽으로 이동 시 기본 방향 (오른쪽 보기)
    }

    // 움직임 애니메이션 업데이트
    if (this.isMoving) {
      this.animationTimer += deltaTime;
      const animConfig = UI.player.animation;

      if (this.animationTimer >= animConfig.animationSpeed) {
        this.currentFrame = (this.currentFrame + 1) % animConfig.totalFrames;
        this.animationTimer = 0;
      }
    } else {
      // 멈췄을 때 애니메이션 리셋
      this.currentFrame = 0;
      this.animationTimer = 0;
    }
  }

  tryTakeHit(damage) {
    if (this.invulnTimer > 0) return false;
    const dmg = Number.isFinite(damage) ? damage : 10;
    this.hp = Math.max(0, this.hp - dmg);
    this.invulnTimer = this.invulnDuration;
    return true;
  }

  render(ctx) {
    if (this.invulnTimer > 0) {
      this.invulnTimer = Math.max(0, this.invulnTimer - (1 / 60));
    }

    const flashing = this.invulnTimer > 0 && Math.floor(this.invulnTimer * 10) % 2 === 0;

    // 움직임 상태에 따라 다른 이미지 사용
    let img;
    if (this.isMoving && UI.player.moveImages && UI.player.moveImages[this.currentFrame]) {
      // 개별 프레임 이미지 사용
      img = UI.player.moveImages[this.currentFrame];
    } else {
      // 정지 상태: 기본 이미지
      img = UI.player.imagePath;
    }

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.globalAlpha = flashing ? 0.5 : 1.0;

      // 좌우 반전을 위한 변환
      ctx.save();
      ctx.translate(this.x, this.y);
      if (this.facingDirection === -1) {
        ctx.scale(-1, 1); // 좌우 반전
      }

      // 이미지 그리기 (개별 프레임이므로 스프라이트 시트 계산 불필요)
      ctx.drawImage(img,
        -this.radius,
        -this.radius,
        this.radius * 2,
        this.radius * 2
      );

      ctx.restore();
      ctx.globalAlpha = 1.0;
    } else {
      // 이미지 로딩 중이거나 실패했을 때 기본 원으로 표시
      ctx.fillStyle = flashing ? '#81C784' : '#4CAF50';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Enemy.js - 스프라이트 애니메이션 추가
export class Enemy {
  constructor(x, y, type = 'bat') {
    this.x = x;
    this.y = y;
    this.type = type;

    // 애니메이션 관련 속성
    this.animationTimer = 0;
    this.currentFrame = 0;
    this.facingDirection = 1; // 1: 오른쪽, -1: 왼쪽

    if (type === 'bat') {
      this.radius = 12;
      this.speed = GameSetting.enemies.bat.speed;
      this.hp = GameSetting.enemies.bat.hp;
      this.maxHp = GameSetting.enemies.bat.hp;
      this.expValue = GameSetting.enemies.bat.exp;
      this.contactDamage = GameSetting.enemies.bat.contactDamage;
    } else if (type === 'blueslime') {
      this.radius = 14;
      this.speed = GameSetting.enemies.blueslime.speed;
      this.hp = GameSetting.enemies.blueslime.hp;
      this.maxHp = GameSetting.enemies.blueslime.hp;
      this.expValue = GameSetting.enemies.blueslime.exp;
      this.contactDamage = GameSetting.enemies.blueslime.contactDamage;
    } else if (type === 'greenslime') {
      this.radius = 10;
      this.speed = GameSetting.enemies.greenslime.speed;
      this.hp = GameSetting.enemies.greenslime.hp;
      this.maxHp = GameSetting.enemies.greenslime.hp;
      this.expValue = GameSetting.enemies.greenslime.exp;
      this.contactDamage = GameSetting.enemies.greenslime.contactDamage;
    } else if (type === 'wolf') {
      this.radius = 16;
      this.speed = GameSetting.enemies.wolf.speed;
      this.hp = GameSetting.enemies.wolf.hp;
      this.maxHp = GameSetting.enemies.wolf.hp;
      this.expValue = GameSetting.enemies.wolf.exp;
      this.contactDamage = GameSetting.enemies.wolf.contactDamage;
    } else {
      this.radius = 12;
      this.speed = 80;
      this.hp = 30;
      this.maxHp = 30;
      this.expValue = 10;
      this.contactDamage = 10;
    }
  }

  update(deltaTime, player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.x += (dx / distance) * this.speed * deltaTime;
      this.y += (dy / distance) * this.speed * deltaTime;

      // greenslime: 플레이어를 기준으로 오른쪽에 있으면 왼쪽을 바라보도록
      if (this.type === 'greenslime') {
        this.facingDirection = (this.x > player.x) ? -1 : 1;
      }
      // bat: 이동 방향에 따라 좌우 반전
      else if (this.type === 'bat') {
        this.facingDirection = dx > 0 ? 1 : -1;
      }
      // wolf: 플레이어를 기준으로 좌우 반전
      else if (this.type === 'wolf') {
        this.facingDirection = (this.x > player.x) ? -1 : 1;
      }
    }

    // 스프라이트 애니메이션 업데이트 (모든 적 타입에 대해)
    const enemyConfig = UI.enemies[this.type];
    if (enemyConfig && enemyConfig.spriteSheet) {
      this.animationTimer += deltaTime;
      const spriteConfig = enemyConfig.spriteSheet;

      if (this.animationTimer >= spriteConfig.animationSpeed) {
        this.currentFrame = (this.currentFrame + 1) % spriteConfig.totalFrames;
        this.animationTimer = 0;
      }
    }
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
  }

  render(ctx) {
    const enemyConfig = UI.enemies[this.type];
    const img = enemyConfig?.imagePath;

    if (img && img.complete && img.naturalWidth > 0 && enemyConfig.spriteSheet) {
      const sprite = enemyConfig.spriteSheet;

      const sourceX = this.currentFrame * sprite.frameWidth;
      const sourceY = 0;

      // 모든 적이 원본 비율 유지
      const renderWidth = sprite.renderWidth;
      const renderHeight = sprite.renderHeight;

      ctx.save();
      ctx.translate(this.x, this.y);

      if ((this.type === 'bat' || this.type === 'greenslime' || this.type === 'wolf') && this.facingDirection === -1) {
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        img,
        sourceX, sourceY,
        sprite.renderWidth, sprite.renderHeight,
        -renderWidth / 2, -renderHeight / 2,
        renderWidth, renderHeight
      );

      ctx.restore();
    } else {
      // 이미지 로딩 실패 시 기본 원으로 표시
      ctx.fillStyle = enemyConfig?.color || '#999999';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // HP 바
    if (this.hp < this.maxHp) {
      const barWidth = 30;
      const barHeight = 4;
      const barX = this.x - barWidth / 2;
      const barY = this.y - this.radius - 10;

      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);

      ctx.fillStyle = '#F44336';
      ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barWidth, barHeight);
    }
  }
}