// setting/EffectSetting.jsx - 이펙트 관련 설정
const EffectSetting = {
  // 화면 흔들림 효과 설정
  screenShake: {
    // 피격 시 화면 흔들림
    hit: {
      duration: 0.4,    // 흔들림 지속 시간 (초)
      intensity: 8       // 흔들림 강도 (픽셀)
    },
  },

  // 몬스터 사망 효과 설정
  enemyDeath: {
    duration: 0.3,      // 페이드아웃 지속 시간 (초)
    scaleEffect: true   // 크기 축소 효과 활성화 (false면 크기 그대로)
  }


};

export default EffectSetting;