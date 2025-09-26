// systems/GameEffect.jsx - 게임 이펙트 관리 클래스
import { EffectSetting } from '@/game/survival';

export default class GameEffect {
  constructor() {
    // 화면 흔들림 효과
    this.screenShake = {
      active: false,
      duration: 0,
      maxDuration: 0,
      intensity: 0,
      offsetX: 0,
      offsetY: 0
    };

    // 몬스터 사망 효과 목록
    this.enemyDeathEffects = [];
  }

  // 화면 흔들림 시작 (설정값 사용)
  startScreenShake(effectType = 'hit') {
    const setting = EffectSetting.screenShake[effectType];
    if (!setting) {
      console.warn(`Unknown screen shake effect type: ${effectType}`);
      return;
    }

    this.screenShake.active = true;
    this.screenShake.duration = setting.duration;
    this.screenShake.maxDuration = setting.duration;
    this.screenShake.intensity = setting.intensity;
  }

  // 화면 흔들림 업데이트
  updateScreenShake(deltaTime) {
    if (!this.screenShake.active) {
      this.screenShake.offsetX = 0;
      this.screenShake.offsetY = 0;
      return;
    }

    this.screenShake.duration -= deltaTime;

    if (this.screenShake.duration <= 0) {
      this.screenShake.active = false;
      this.screenShake.offsetX = 0;
      this.screenShake.offsetY = 0;
    } else {
      const progress = this.screenShake.duration / this.screenShake.maxDuration;
      const currentIntensity = this.screenShake.intensity * progress;

      this.screenShake.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
      this.screenShake.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;
    }
  }

  // 몬스터 사망 효과 시작
  startEnemyDeathEffect(enemy) {
    const setting = EffectSetting.enemyDeath;
    
    this.enemyDeathEffects.push({
      x: enemy.x,
      y: enemy.y,
      type: enemy.type,
      sprite: enemy.currentFrame,
      facingDirection: enemy.facingDirection,
      duration: setting.duration,
      maxDuration: setting.duration,
      scaleEffect: setting.scaleEffect
    });
  }

  // 몬스터 사망 효과 업데이트
  updateEnemyDeathEffects(deltaTime) {
    this.enemyDeathEffects = this.enemyDeathEffects.filter(effect => {
      effect.duration -= deltaTime;
      return effect.duration > 0;
    });
  }

  // 몬스터 사망 효과 렌더링
  renderEnemyDeathEffects(ctx, UI) {
    this.enemyDeathEffects.forEach(effect => {
      const progress = effect.duration / effect.maxDuration;
      const alpha = progress; // 페이드아웃
      const scale = effect.scaleEffect ? 0.5 + (progress * 0.5) : 1; // 축소 효과

      const enemyConfig = UI.enemies[effect.type];
      const img = enemyConfig?.imagePath;

      if (img && img.complete && img.naturalWidth > 0 && enemyConfig.spriteSheet) {
        const sprite = enemyConfig.spriteSheet;
        const sourceX = effect.sprite * sprite.frameWidth;
        const sourceY = 0;

        const renderWidth = sprite.renderWidth * scale;
        const renderHeight = sprite.renderHeight * scale;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(effect.x, effect.y);

        if ((effect.type === 'bat' || effect.type === 'greenslime' || effect.type === 'wolf') && effect.facingDirection === -1) {
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
      }
    });
  }

  // 모든 이펙트 업데이트
  update(deltaTime) {
    this.updateScreenShake(deltaTime);
    this.updateEnemyDeathEffects(deltaTime);
  }

  // 화면 흔들림 오프셋 반환
  getScreenShakeOffset() {
    return {
      x: this.screenShake.offsetX,
      y: this.screenShake.offsetY
    };
  }

  // 화면 흔들림 활성 상태 확인
  isScreenShakeActive() {
    return this.screenShake.active;
  }

  // 모든 이펙트 초기화
  reset() {
    this.screenShake.active = false;
    this.screenShake.duration = 0;
    this.screenShake.offsetX = 0;
    this.screenShake.offsetY = 0;
    this.enemyDeathEffects = [];
  }
}