// Player-specific preferences (joystick position, etc.)
const PlayerSetting = {
  // 조작 방식: 'joystick' | 'arrows'
  controlScheme: 'joystick',

  // 조이스틱 위치 설정
  joystickPosition: 'right', // 'right' | 'left'
  joystickOffset: { x: 48, y: 48 },

  // 방향패드(ArrowPad) 위치 설정
  arrowPadPosition: 'right', // 'left' | 'right'
  arrowPadOffset: { x: 48, y: 48 }
};

export default PlayerSetting;


