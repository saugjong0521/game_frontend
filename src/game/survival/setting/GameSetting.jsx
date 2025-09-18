// Game balance settings
const GameSetting = {
  player: {
    maxHp: 100,
    invulnSeconds: 0.5,
    speed: 200,
    autoAttackSeconds: 1.0
  },
  enemies: {
    bat: { contactDamage: 10, hp: 20, speed: 70, exp: 10, level: 1 },
    eyeball: { contactDamage: 15, hp: 40, speed: 50, exp: 15, level: 2 },
    dog: { contactDamage: 20, hp: 25, speed: 100, exp: 12, level: 4 }
  },
  // 적 타입별로 드랍되는 경험치량 (UI 색과는 분리)
  expDrop: {
    bat: 8,
    eyeball: 12,
    dog: 15
  },
  exp: {
    baseToLevel: 50,
    perLevelIncrement: 12
  },
  // 레벨업시 몬스터 및 게임 밸런스 스케일링
  levelScaling: {
    enemySpeedPerLevel: 10,     // 레벨당 몬스터 속도 증가량
    enemyHpPerLevel: 3,         // 레벨당 몬스터 체력 증가량
    enemyDamagePerLevel: 5,     // 레벨당 몬스터 데미지 증가량
    levelUpHealPercent: 0.1     // 레벨업시 체력 회복 비율 (10%)
  },
  enemySpawn: {
    baseSeconds: 1.0,  // 기본 스폰 간격
    probabilities: {
      bat: 0.5,      // bat 확률
      eyeball: 0.3,  // eyeball 확률
      dog: 0.2       // dog 확률 (나머지)
    }
  },
  
  // 레벨업 카드 시스템 - 4개 스탯
  levelUpCards: {
    health: {
      name: "체력 증가",
      description: "최대 체력이 10 증가합니다",
      icon: "❤️",
      statIncrease: 10
    },
    speed: {
      name: "이동속도 증가", 
      description: "이동속도가 15 증가합니다",
      icon: "💨",
      statIncrease: 15
    },
    attackSpeed: {
      name: "공격속도 증가",
      description: "공격 간격이 0.05초 감소합니다",
      icon: "⚡",
      statIncrease: 0.05
    },
    damage: {
      name: "공격력 증가",
      description: "공격력이 5 증가합니다", 
      icon: "⚔️",
      statIncrease: 5
    }
  },
  
  // 레벨업 카드 출현 확률 (100분위)
  cardAppearanceRates: {
    health: 30,      // 30%
    speed: 25,       // 25%
    attackSpeed: 25, // 25%
    damage: 20       // 20%
  }
};

export default GameSetting;