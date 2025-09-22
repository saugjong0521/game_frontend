import { GiWalkingBoot } from "react-icons/gi";
import { GiHeartPlus } from "react-icons/gi";
import { GiBladeDrag } from "react-icons/gi";
import { GiBladeFall } from "react-icons/gi";


// Game balance settings
const GameSetting = {
  player: {
    maxHp: 100,
    invulnSeconds: 0.5,
    speed: 200,
    autoAttackSeconds: 1.0,
    damage: 25,
    levelUpHealPercent: 0.1     // 레벨업시 체력 회복 비율 (10%)
  },
  enemies: {
    bat: { contactDamage: 10, hp: 20, speed: 70, exp: 10, unlockTime: 0 },
    blueslime: { contactDamage: 15, hp: 40, speed: 50, exp: 15, unlockTime: 30 },
    greenslime: { contactDamage: 20, hp: 25, speed: 90, exp: 12, unlockTime: 60 },
    wolf: { contactDamage: 30, hp: 30, speed: 130, exp: 18, unlockTime: 120 }
  },
  exp: {
    baseToLevel: 50,
    perLevelIncrement: 12
  },
  
  // 시간 기반 스케일링 시스템
  timeScaling: {
    scalingInterval: 20,        // 30초마다 난이도 증가
    enemySpeedPerInterval: 8,   // 주기당 몬스터 속도 증가량
    enemyHpPerInterval: 5,      // 주기당 몬스터 체력 증가량
    enemyDamagePerInterval: 3,  // 주기당 몬스터 데미지 증가량
    spawnRateIncrease: 0.05,    // 주기당 스폰 속도 증가 (5% 더 빨리)
    maxSpawnRate: 0.2,          // 최소 스폰 간격 (초)
  },
  
  enemySpawn: {
    baseSeconds: 1.5,  // 기본 스폰 간격
    probabilities: {
      bat: 0.4,         // bat 확률
      blueslime: 0.3,   // blueslime 확률
      greenslime: 0.2,  // greenslime 확률
      wolf: 0.1         // wolf 확률
    }
  },

  // 레벨업 카드 시스템 - 4개 스탯
  levelUpCards: {
    health: {
      name: "Health Up",
      description: "Max health increases by 10",
      icon: <GiHeartPlus />,
      color: "from-red-500 to-red-700",
      statIncrease: 10
    },
    speed: {
      name: "Movement Speed Up",
      description: "Movement speed increases by 15",
      icon: <GiWalkingBoot />,
      color: "from-blue-500 to-blue-700",
      statIncrease: 15
    },
    attackSpeed: {
      name: "Attack Speed Up",
      description: "Attack speed increases by 5%",
      icon: <GiBladeFall />,
      color: "from-yellow-500 to-yellow-700",
      statIncrease: 0.05
    },
    damage: {
      name: "Damage Up",
      description: "Damage increases by 5",
      icon: <GiBladeDrag />,
      color: "from-orange-500 to-orange-700",
      statIncrease: 5
    }
  },

  // 레벨업 카드 출현 확률 (100분위)
  cardAppearanceRates: {
    health: 20,      // 30%
    speed: 25,       // 25%
    attackSpeed: 25, // 25%
    damage: 30       // 20%
  }
};

export default GameSetting;