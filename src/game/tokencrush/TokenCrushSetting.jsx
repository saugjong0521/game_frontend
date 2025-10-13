// Token Crush Game Settings
const TokenCrushSetting = {
  // 게임 보드 설정
  board: {
    gridSize: 7
  },

  // 토큰 설정
  tokens: {
    types: ['BTC', 'ETH', 'BNB', 'SOL', 'USDT'],
    colors: {
      BTC: 'bg-orange-500',
      ETH: 'bg-blue-500',
      BNB: 'bg-yellow-500',
      SOL: 'bg-purple-500',
      USDT: 'bg-green-500'
    }
  },

  // 시간 설정
  time: {
    initial: 90,    // 초기 시간 (초)
    max: 90         // 최대 시간 (초)
  },

  // 점수 설정
  score: {
    points: {
      THREE: 10,    // 3개 매칭: 개당 10점
      FOUR: 12,     // 4개 매칭: 개당 12점
      TL: 13,       // T/L 매칭: 개당 13점
      LINE5: 15     // 5개 이상 일직선: 개당 15점
    }
  },

  // 콤보 설정
  combo: {
    scoreMultiplier: 1.1,   // 콤보 점수 배율 (1.1배씩 증가)
    timeMultiplier: 1.5,    // 콤보 시간 보너스 배율 (1.5배씩 증가)
    startIndex: 2           // 콤보 시작 (2콤보부터)
  },

  // 애니메이션 타이밍 (ms)
  animation: {
    blink: 300,      // 깜빡임 시간
    explode: 400,    // 폭발 시간
    fall: 600,       // 떨어지는 시간
    swap: 300,       // 스왑 시간
    shuffle: 1000,   // 섞기 알림 시간
    hint: 1500,      // 힌트 반짝임 시간
    pulse: 4000,     // 타이틀 펄스 시간
    fadeIn: 300      // 페이드인 시간
  },

  specialBlocks: {
    LINE: 'LINE_BLOCK',      // 4개: 줄 지우기 블록
    BOMB: 'BOMB_BLOCK',      // TL: 폭탄 (주변 8칸)
    MEGA: 'MEGA_BLOCK'       // 5개 이상: 3줄 지우기
  },

  specialBlockColors: {
    LINE_BLOCK: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    BOMB_BLOCK: 'bg-gradient-to-br from-red-500 to-orange-500',
    MEGA_BLOCK: 'bg-gradient-to-br from-purple-500 to-pink-500'
  }
  
};

export default TokenCrushSetting;