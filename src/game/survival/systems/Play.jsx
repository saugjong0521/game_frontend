import { UI } from '@/game/survival';

export class AttackObj {
  constructor(startX, startY, targetX, targetY) {
    this.x = startX;
    this.y = startY;

    // 충돌용 radius와 렌더 크기 분리
    this.radius = UI.attackObj.radius || 6;       // 충돌용
    this.renderSize = UI.attackObj.renderSize || 36; // drawImage용

    this.speed = 300;   // px/s
    this.damage = 20;
    this.lifetime = 2.0;
    this.shouldDestroy = false;

    // 타겟 방향 계산
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.hypot(dx, dy);

    if (distance > 0) {
      this.vx = (dx / distance) * this.speed;
      this.vy = (dy / distance) * this.speed;
    } else {
      this.vx = 0;
      this.vy = -this.speed;
    }

    // 이미지 설정
    this.image = UI.attackObj.imagePath;

    // 이미지가 225도(좌하단) 방향을 기준으로 되어 있으므로 
    // 실제 날아가는 방향에서 225도를 빼고, 추가로 90도를 더 빼서 올바른 회전각 계산
    const targetAngle = Math.atan2(this.vy, this.vx); // 실제 날아가는 방향
    const imageBaseAngle = (5 * Math.PI) / 4; // 225도 (이미지 기본 방향)
    const rotationCorrection = Math.PI / 2; // 90도 추가 보정
    this.renderAngle = targetAngle - imageBaseAngle + rotationCorrection;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.lifetime -= deltaTime;

    // 수명 종료 시 제거
    if (this.lifetime <= 0) this.shouldDestroy = true;
  }

  destroy() {
    this.shouldDestroy = true;
  }

  render(ctx) {
    if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
      // 이미지 렌더링
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.renderAngle);
      ctx.drawImage(
        this.image,
        -this.renderSize / 2,
        -this.renderSize / 2,
        this.renderSize,
        this.renderSize
      );
      ctx.restore();
    } else {
      // 이미지 없으면 원(circle)으로 fallback
      ctx.fillStyle = UI.attackObj.color || '#FFEB3B';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ExpOrb.js - 경험치 오브
export class ExpOrb {
  constructor(x, y, value, skinOverride) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.collected = false;
    this.attractRadius = 60;
    this.attractSpeed = 200;
    
    // UI 설정에서만 가져오기 (skinOverride가 있으면 우선 사용)
    this.radius = skinOverride ? skinOverride.radius : UI.expOrb.radius;
    this.fillColor = skinOverride ? skinOverride.fillColor : UI.expOrb.fillColor;
    this.strokeColor = skinOverride ? skinOverride.strokeColor : UI.expOrb.strokeColor;
  }

  update(deltaTime, player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 플레이어가 가까이 있으면 자동으로 끌려감
    if (distance < this.attractRadius && distance > 0) {
      this.x += (dx / distance) * this.attractSpeed * deltaTime;
      this.y += (dy / distance) * this.attractSpeed * deltaTime;
    }
  }

  render(ctx) {
    // UI 설정에서만 색상 가져오기
    ctx.fillStyle = this.fillColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}