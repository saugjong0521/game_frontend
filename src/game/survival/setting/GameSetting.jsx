// Game balance settings
const GameSetting = {
  player: {
    maxHp: 100,
    invulnSeconds: 0.5,
    speed: 200
  },
  enemies: {
    bat: { contactDamage: 10, hp: 20, speed: 70, exp: 10 },
    eyeball: { contactDamage: 15, hp: 40, speed: 50, exp: 15 },
    dog: { contactDamage: 20, hp: 25, speed: 100, exp: 12 }
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
    enemyHpPerLevel: 0,        // 나중에 필요하면 체력도 증가 가능
    enemyDamagePerLevel: 0,    // 나중에 필요하면 데미지도 증가 가능
    levelUpHealPercent: 0.1    // 레벨업시 체력 회복 비율 (10%)
  },
  // 적 스폰 확률 설정
  enemySpawn: {
    baseSeconds: 1.0,  // 기본 스폰 간격
    probabilities: {
      bat: 0.5,      // bat 확률
      eyeball: 0.3,  // eyeball 확률
      dog: 0.2       // dog 확률 (나머지)
    }
  },
  autoAttackSeconds: 1.0
};

export default GameSetting;