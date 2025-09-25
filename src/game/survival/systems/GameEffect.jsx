// systems/GameEffect.jsx - 게임 이펙트 관리 클래스
import EffectSetting from "../setting/EffectSetting";


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
      // 흔들림 종료
      this.screenShake.active = false;
      this.screenShake.offsetX = 0;
      this.screenShake.offsetY = 0;
    } else {
      // 시간에 따라 강도 감소 (부드러운 감쇠)
      const progress = this.screenShake.duration / this.screenShake.maxDuration;
      const currentIntensity = this.screenShake.intensity * progress;

      // 랜덤한 방향으로 흔들림
      this.screenShake.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
      this.screenShake.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;
    }
  }

  // 모든 이펙트 업데이트
  update(deltaTime) {
    this.updateScreenShake(deltaTime);
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
  }
}