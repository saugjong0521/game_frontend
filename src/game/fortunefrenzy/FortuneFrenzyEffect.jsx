// FortuneFrenzyEffect.jsx - Fortune Frenzy 게임 이펙트 관리 클래스
export default class FortuneFrenzyEffect {
  constructor(onUpdate) {
    this.onUpdate = onUpdate; // transform 값을 업데이트할 콜백
    this.animationFrameId = null;

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

  // 화면 흔들림 시작
  startScreenShake(intensity = 20, duration = 500) {
    this.screenShake = {
      active: true,
      duration: duration,
      maxDuration: duration,
      intensity: intensity,
      offsetX: 0,
      offsetY: 0
    };
    
    this.updateScreenShake();
  }

  // 화면 흔들림 업데이트
  updateScreenShake() {
    if (!this.screenShake.active) {
      this.onUpdate('translate(0, 0)');
      return;
    }

    this.screenShake.duration -= 16; // ~60fps

    if (this.screenShake.duration <= 0) {
      this.screenShake.active = false;
      this.onUpdate('translate(0, 0)');
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    } else {
      // 시간에 따른 강도 감소 (페이드아웃)
      const progress = this.screenShake.duration / this.screenShake.maxDuration;
      const currentIntensity = this.screenShake.intensity * progress;

      // 랜덤한 오프셋 생성
      this.screenShake.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
      this.screenShake.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

      this.onUpdate(`translate(${this.screenShake.offsetX}px, ${this.screenShake.offsetY}px)`);
      
      // 다음 프레임 예약
      this.animationFrameId = requestAnimationFrame(() => this.updateScreenShake());
    }
  }

  // 화면 흔들림 활성 상태 확인
  isScreenShakeActive() {
    return this.screenShake.active;
  }

  // 모든 이펙트 정리
  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.screenShake.active = false;
    this.screenShake.duration = 0;
    this.screenShake.offsetX = 0;
    this.screenShake.offsetY = 0;
    
    this.onUpdate('translate(0, 0)');
  }

  // 모든 이펙트 초기화 (게임 재시작 시)
  reset() {
    this.cleanup();
  }
}