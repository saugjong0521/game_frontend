import { useState, useEffect } from 'react';

export const useDeviceRotation = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      setIsLandscape(width > height);
    };

    // 초기 체크
    checkOrientation();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return {
    isLandscape,
    isPortrait: !isLandscape,
    dimensions,
    aspectRatio: dimensions.width / dimensions.height
  };
};

// 네비게이션 숨김 상태를 관리하는 Hook
export const useNavigationVisibility = () => {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const { isLandscape } = useDeviceRotation();

  const toggleNavigation = () => {
    setIsNavVisible(!isNavVisible);
  };

  const showNavigation = () => {
    setIsNavVisible(true);
  };

  const hideNavigation = () => {
    setIsNavVisible(false);
  };

  return {
    isNavVisible,
    isLandscape,
    toggleNavigation,
    showNavigation,
    hideNavigation
  };
};