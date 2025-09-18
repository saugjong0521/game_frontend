import { dico, dicoMove_1, dicoMove_2, dicoMove_3, dicoMove_4, dicoMove_5, bat, wolf, blueslime, greenslime, map, attack } from "@/assets";

const dicoImage = new Image();
const dicoMoveImages = [];
const batImage = new Image();
const blueslimeImg = new Image();
const greenslimeImg = new Image();
const mapImage = new Image();
const attackImage = new Image();
const wolfImage = new Image();

dicoImage.src = dico;

// 개별 프레임 이미지들 로드
dicoMoveImages[0] = new Image();
dicoMoveImages[0].src = dicoMove_1;
dicoMoveImages[1] = new Image();
dicoMoveImages[1].src = dicoMove_2;
dicoMoveImages[2] = new Image();
dicoMoveImages[2].src = dicoMove_3;
dicoMoveImages[3] = new Image();
dicoMoveImages[3].src = dicoMove_4;
dicoMoveImages[4] = new Image();
dicoMoveImages[4].src = dicoMove_5;

batImage.src = bat;
blueslimeImg.src = blueslime;
greenslimeImg.src = greenslime;
mapImage.src = map;
attackImage.src = attack;
wolfImage.src = wolf;

// UI settings (images, sizes, colors)
const UI = {
  // 캔버스 기본 크기 및 종횡비
  canvas: {
    width: 600,
    height: 600,
    aspectRatio: 600 / 600
  },

  // 맵/배경 스킨
  map: {
    backgroundColor: '#bababa',
    gridColor: '#3a3a3a',
    gridSize: 50,
    backgroundImage: mapImage // 맵 이미지 추가
  },

  // 플레이어 스킨
  player: {
    imagePath: dicoImage,
    moveImages: dicoMoveImages, // 개별 프레임 이미지 배열
    radius: 32,
    // 개별 프레임 애니메이션 설정
    animation: {
      totalFrames: 5,       // 총 프레임 수
      animationSpeed: 0.15, // 애니메이션 속도
    }
  },

  // 적 스킨(타입별)
  enemies: {
    bat: {
      color: '#F44336',
      imagePath: batImage,
      // 스프라이트 애니메이션 설정 (41*36, 7px 간격)
      spriteSheet: {
        frameWidth: 48,       // 41 + 7 = 48px (이미지 + 간격)
        frameHeight: 36,      // 프레임 높이
        totalFrames: 4,       // 총 프레임 수
        animationSpeed: 0.2,  // 애니메이션 속도
        renderWidth: 41,      // 실제 이미지 크기 (간격 제외)
        renderHeight: 36
      }
    },
    blueslime: {
      color: '#9C27B0',
      imagePath: blueslimeImg,
      // blueslime 스프라이트 설정 (43*36, 7px 간격)
      spriteSheet: {
        frameWidth: 50,       // 43 + 7 = 50px (이미지 + 간격)
        frameHeight: 36,      // 프레임 높이
        totalFrames: 4,       // 총 프레임 수
        animationSpeed: 0.18, // 애니메이션 속도
        renderWidth: 43,      // 실제 이미지 크기 (간격 제외)
        renderHeight: 36
      }
    },
    greenslime: {
      color: '#FF9800',
      imagePath: greenslimeImg,
      // greenslime 스프라이트 설정 (41*36, 12px 간격)
      spriteSheet: {
        frameWidth: 53,       // 41 + 12 = 53px (이미지 + 간격)
        frameHeight: 36,      // 프레임 높이
        totalFrames: 4,       // 총 프레임 수
        animationSpeed: 0.22, // 애니메이션 속도
        renderWidth: 41,      // 실제 이미지 크기 (간격 제외)
        renderHeight: 36
      }
    },
    wolf: {
      color: '#3568de',
      imagePath: wolfImage,
      // greenslime 스프라이트 설정 (41*36, 12px 간격)
      spriteSheet: {
        frameWidth: 66,       // 41 + 12 = 53px (이미지 + 간격)
        frameHeight: 40,      // 프레임 높이
        totalFrames: 4,       // 총 프레임 수
        animationSpeed: 0.12, // 애니메이션 속도
        renderWidth: 64,      // 실제 이미지 크기 (간격 제외)
        renderHeight: 40
      }
    }
  },

  // 발사체 스킨
  attackObj: {
    imagePath: attackImage,
    renderSize: 36,
    radius: 8          // drawImage용 크기
    // imagePath: '/src/assets/spritesheets/beam.png'
  },

  // 경험치 오브 스킨
  expOrb: {
    fillColor: '#2196F3',
    strokeColor: '#1976D2',
    radius: 8,
    // imagePath: '/src/assets/spritesheets/power-up.png'
  },

  // 적 타입별 경험치 오브 스킨 (색상/크기 차별화)
  expOrbPerEnemy: {
    bat: {
      fillColor: '#64B5F6',
      strokeColor: '#1E88E5',
      radius: 7
    },
    blueslime: {
      fillColor: '#CE93D8',
      strokeColor: '#8E24AA',
      radius: 8
    },
    greenslime: {
      fillColor: '#FFCC80',
      strokeColor: '#FB8C00',
      radius: 9
    },
    wolf: {
      fillColor: '#f6f998',
      strokeColor: '#eeff57',
      radius: 9
    }
  },

  // 조이스틱 사이즈
  joystick: {
    baseSize: 120,
    stickSize: 36,
    margin: 24
  }
};

export default UI;