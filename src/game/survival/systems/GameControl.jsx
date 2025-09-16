import React, { useRef, useEffect, useState } from 'react';
import UI from '../setting/UI.jsx';

// Arrow Pad Component - 영역 벗어남 감지 포함
export const ArrowPad = ({ onMove, position = 'left', offset = { x: 24, y: 24 } }) => {
  const [pressed, setPressed] = useState({ up: false, down: false, left: false, right: false });
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [tracking, setTracking] = useState(false);
  const containerRef = useRef(null);

  const updateCenter = () => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  useEffect(() => {
    updateCenter();
  }, []);

  // 화면 회전 및 리사이즈 감지하여 중심점 업데이트
  useEffect(() => {
    const handleResize = () => {
      setTimeout(updateCenter, 100); // 약간의 지연으로 정확한 위치 계산
    };
    
    const handleOrientationChange = () => {
      setTimeout(updateCenter, 300); // 화면 회전 시 더 긴 지연
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // 추가: screen.orientation change 이벤트
    if (screen.orientation && screen.orientation.addEventListener) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (screen.orientation && screen.orientation.removeEventListener) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  // position이나 offset이 변경될 때도 중심점 업데이트
  useEffect(() => {
    setTimeout(updateCenter, 50);
  }, [position, offset]);

  useEffect(() => {
    const dx = (pressed.right ? 1 : 0) - (pressed.left ? 1 : 0);
    const dy = (pressed.down ? 1 : 0) - (pressed.up ? 1 : 0);
    const mag = Math.hypot(dx, dy);
    const vx = mag > 0 ? dx / mag : 0;
    const vy = mag > 0 ? dy / mag : 0;
    onMove?.({ x: vx, y: vy });
  }, [pressed]);

  const resetAllButtons = () => {
    setPressed({ up: false, down: false, left: false, right: false });
    setTracking(false);
  };

  useEffect(() => {
    if (!tracking) return;

    const handleGlobalMove = (e) => {
      const clientX = e.touches ? e.touches[0]?.clientX : e.clientX;
      const clientY = e.touches ? e.touches[0]?.clientY : e.clientY;
      
      if (clientX && clientY) {
        const allowedRange = 200; // 기존 150에서 200으로 증가
        const dx = clientX - center.x;
        const dy = clientY - center.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > allowedRange) {
          resetAllButtons();
        }
      }
    };

    const handleGlobalEnd = () => {
      resetAllButtons();
    };

    document.addEventListener('touchmove', handleGlobalMove, { passive: false });
    document.addEventListener('touchend', handleGlobalEnd);
    document.addEventListener('touchcancel', handleGlobalEnd);
    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('mouseup', handleGlobalEnd);

    return () => {
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
      document.removeEventListener('touchcancel', handleGlobalEnd);
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
    };
  }, [tracking, center]);

  const containerClasses = `fixed bottom-0 grid gap-1.5 z-30 ${
    position === 'left' ? 'left-0' : 'right-0'
  }`;
  
  const containerStyle = {
    gridTemplateAreas: `". up ." "left center right" ". down ."`,
    transform: `translate(${position === 'left' ? offset.x : -offset.x}px, -${offset.y}px)`
  };

  const buttonClasses = "w-12 h-12 rounded-md bg-white/10 text-white border border-white/20 flex items-center justify-center text-lg transition-colors active:bg-white/20 select-none";

  const handleButtonPress = (direction) => {
    setPressed(p => ({ ...p, [direction]: true }));
    setTracking(true);
  };

  const handleButtonRelease = (direction) => {
    setPressed(p => ({ ...p, [direction]: false }));
  };

  return (
    <div ref={containerRef} className={containerClasses} style={containerStyle}>
      <button 
        className={buttonClasses} 
        style={{ gridArea: 'up' }}
        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('up'); }} 
        onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('up'); }} 
        onMouseDown={(e) => { e.preventDefault(); handleButtonPress('up'); }} 
        onMouseUp={(e) => { e.preventDefault(); handleButtonRelease('up'); }}
      >
        ▲
      </button>
      <button 
        className={buttonClasses} 
        style={{ gridArea: 'left' }}
        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('left'); }} 
        onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('left'); }} 
        onMouseDown={(e) => { e.preventDefault(); handleButtonPress('left'); }} 
        onMouseUp={(e) => { e.preventDefault(); handleButtonRelease('left'); }}
      >
        ◀
      </button>
      <div style={{ gridArea: 'center' }} />
      <button 
        className={buttonClasses} 
        style={{ gridArea: 'right' }}
        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('right'); }} 
        onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('right'); }} 
        onMouseDown={(e) => { e.preventDefault(); handleButtonPress('right'); }} 
        onMouseUp={(e) => { e.preventDefault(); handleButtonRelease('right'); }}
      >
        ▶
      </button>
      <button 
        className={buttonClasses} 
        style={{ gridArea: 'down' }}
        onTouchStart={(e) => { e.preventDefault(); handleButtonPress('down'); }} 
        onTouchEnd={(e) => { e.preventDefault(); handleButtonRelease('down'); }} 
        onMouseDown={(e) => { e.preventDefault(); handleButtonPress('down'); }} 
        onMouseUp={(e) => { e.preventDefault(); handleButtonRelease('down'); }}
      >
        ▼
      </button>
    </div>
  );
};

// Joystick Component - 영역 벗어남 감지 포함
export const Joystick = ({ onMove, position = 'right', offset = { x: 24, y: 24 } }) => {
  const stickRef = useRef(null);
  const baseRef = useRef(null);
  const [active, setActive] = useState(false);
  const [center, setCenter] = useState({ x: 0, y: 0 });

  const updateCenter = () => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    setCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  useEffect(() => {
    updateCenter();
  }, []);

  // 화면 회전 및 리사이즈 감지하여 중심점 업데이트
  useEffect(() => {
    const handleResize = () => {
      setTimeout(updateCenter, 100); // 약간의 지연으로 정확한 위치 계산
    };
    
    const handleOrientationChange = () => {
      setTimeout(updateCenter, 300); // 화면 회전 시 더 긴 지연
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // 추가: screen.orientation change 이벤트
    if (screen.orientation && screen.orientation.addEventListener) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (screen.orientation && screen.orientation.removeEventListener) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, []);

  // position이나 offset이 변경될 때도 중심점 업데이트
  useEffect(() => {
    setTimeout(updateCenter, 50);
  }, [position, offset]);

  const updateVector = (clientX, clientY) => {
    const maxDist = 50; // 조이스틱 기본 반지름
    const allowedRange = 220; // 허용 범위
    
    let dx = clientX - center.x;
    let dy = clientY - center.y;
    const dist = Math.hypot(dx, dy);
    
    // 허용 범위를 벗어나면 조이스틱 리셋
    if (dist > allowedRange) {
      resetStick();
      return;
    }
    
    // 기본 반지름 내에서는 정상 동작
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    
    const nx = dx / maxDist;
    const ny = dy / maxDist;
    
    if (stickRef.current) {
      stickRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    onMove?.({ x: nx, y: ny });
  };

  const resetStick = () => {
    if (stickRef.current) {
      stickRef.current.style.transform = 'translate(0px, 0px)';
    }
    onMove?.({ x: 0, y: 0 });
    setActive(false);
  };

  // 전역 마우스/터치 이벤트 리스너 (영역 벗어남 감지용)
  useEffect(() => {
    if (!active) return;

    const handleGlobalMove = (e) => {
      const clientX = e.touches ? e.touches[0]?.clientX : e.clientX;
      const clientY = e.touches ? e.touches[0]?.clientY : e.clientY;
      
      if (clientX && clientY) {
        updateVector(clientX, clientY);
      }
    };

    const handleGlobalEnd = () => {
      resetStick();
    };

    // 터치 이벤트
    document.addEventListener('touchmove', handleGlobalMove, { passive: false });
    document.addEventListener('touchend', handleGlobalEnd);
    document.addEventListener('touchcancel', handleGlobalEnd);
    
    // 마우스 이벤트
    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('mouseup', handleGlobalEnd);

    return () => {
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
      document.removeEventListener('touchcancel', handleGlobalEnd);
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
    };
  }, [active, center]);

  const baseSize = UI.joystick.baseSize;
  const stickSize = UI.joystick.stickSize;

  return (
    <div
      ref={baseRef}
      className={`fixed bottom-0 rounded-full bg-white/10 border border-white/20 select-none z-30 ${
        position === 'left' ? 'left-0' : 'right-0'
      }`}
      style={{
        width: baseSize,
        height: baseSize,
        transform: `translate(${position === 'left' ? offset.x : -offset.x}px, -${offset.y}px)`,
        touchAction: 'none'
      }}
      onTouchStart={(e) => { 
        e.preventDefault(); // 스크롤 방지
        setActive(true); 
        const t = e.touches[0]; 
        updateVector(t.clientX, t.clientY); 
      }}
      onMouseDown={(e) => { 
        e.preventDefault(); // 기본 드래그 방지
        setActive(true); 
        updateVector(e.clientX, e.clientY); 
      }}
    >
      <div
        ref={stickRef}
        className={`absolute rounded-full transition-colors pointer-events-none ${
          active ? 'bg-white/40' : 'bg-white/25'
        }`}
        style={{ 
          left: baseSize/2 - stickSize/2, 
          top: baseSize/2 - stickSize/2, 
          width: stickSize, 
          height: stickSize,
          transform: 'translate(0px, 0px)', 
          transition: active ? 'none' : 'transform 120ms ease-out, background 200ms ease'
        }}
      />
    </div>
  );
};