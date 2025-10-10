import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from "react-router-dom";
import Navigation from './Navigation.jsx';
import TokenProvider from '@/provider/TokenProvider';

import {
  Home,
  GameLayout,
  LeaderBoardLayout,
  GameTicketBuy
} from '@/layout';
import { Game } from '@/game/survival';
import { MobileUseModal } from '@/modal';
import { FortuneFrenzy } from '@/game/fortunefrenzy';
import { TokenCrush } from '@/game/tokencrush';

import {
  SurvivalLeaderBoard,
  FortuneLeaderBoard
} from '@/layout';


function AppContent() {
  const [searchParams] = useSearchParams();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  
  // URL 파라미터로 네비게이션 숨김 제어
  const hideNavByParam = searchParams.get('hideNav') === 'true';

  // 화면 크기 체크 함수
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1100);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // 화면 회전 감지 (모바일 최적화)
  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // 1. window 크기 기준
      const isLandscapeByWindow = width > height;

      // 2. screen.orientation API 사용 (지원되는 경우)
      let isLandscapeByOrientation = false;
      if (screen.orientation) {
        isLandscapeByOrientation = screen.orientation.angle === 90 || screen.orientation.angle === -90;
      } else if (window.orientation !== undefined) {
        isLandscapeByOrientation = Math.abs(window.orientation) === 90;
      }

      // 우선순위: screen.orientation > window 크기
      let newIsLandscape;
      if (screen.orientation || window.orientation !== undefined) {
        newIsLandscape = isLandscapeByOrientation;
      } else {
        newIsLandscape = isLandscapeByWindow;
      }

      setIsLandscape(newIsLandscape);

      // 세로 모드로 돌아가면 네비게이션 자동 표시
      if (!newIsLandscape && isNavHidden) {
        setIsNavHidden(false);
      }
    };

    checkOrientation();

    const handleResize = () => {
      setTimeout(checkOrientation, 100);
    };

    const handleOrientationChange = () => {
      setTimeout(checkOrientation, 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

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
  }, [isNavHidden]);

  const toggleNavigation = () => {
    setIsNavHidden(!isNavHidden);
  };

  return (
    <>
      {/* 데스크톱(1100px 이상)에서 모바일 전용 모달을 최상위에 표시 */}
      {isDesktop && <MobileUseModal />}

      {/* 기존 앱 컨텐츠 - 모달이 있을 때는 숨김 처리 */}
      <div style={{ display: isDesktop ? 'none' : 'block' }}>
        {/* 네비게이션 숨김/보이기 버튼 (가로 모드일 때만, hideNav 파라미터가 없을 때만) */}
        {isLandscape && !hideNavByParam && (
          <button
            onClick={toggleNavigation}
            className="fixed top-3.5 right-16 z-[1000] bg-black/80 backdrop-blur-md text-white p-2 rounded-lg border border-purple-500/30 hover:bg-purple-500/20 transition-all duration-300"
            aria-label={isNavHidden ? "Show navigation" : "Hide navigation"}
            title={isNavHidden ? "Show Navigation" : "Hide Navigation"}
          >
            {isNavHidden ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        {/* Navigation - hideNav 파라미터가 true면 완전히 숨김 */}
        {!hideNavByParam && (
          <Navigation isHidden={isLandscape && isNavHidden} />
        )}

        {/* Main content with dynamic margin */}
        <div
          className="transition-all duration-300"
          style={{
            marginTop: hideNavByParam ? '0' : (isLandscape && isNavHidden ? '0' : '4rem')
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />

            {/* 게임 관련 라우트 */}
            <Route path="/game" element={<GameLayout />}>
              <Route
                path="survival"
                element={
                  <Game
                    isLandscape={isLandscape}
                    isNavHidden={isNavHidden}
                  />
                }
              />
              <Route
                path="fortune"
                element={
                  <FortuneFrenzy
                    isLandscape={isLandscape}
                    isNavHidden={isNavHidden}
                  />
                }
              />
              <Route
                path="tokencrush"
                element={
                  <TokenCrush
                    isLandscape={isLandscape}
                    isNavHidden={isNavHidden}
                  />
                }
              />
            </Route>

            {/* 가이드 관련 라우트 */}
            <Route path="/ticket" element={<GameTicketBuy />}>
              <Route path="survival" element={<div>Survival Ticket</div>} />
            </Route>

            {/* 리더보드 관련 라우트 */}
            <Route path="/leaderboard" element={<LeaderBoardLayout />}>
              <Route path="survival" element={<SurvivalLeaderBoard />} />
              <Route path="fortune" element={<FortuneLeaderBoard />} />
            </Route>
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <TokenProvider>
      <Router>
        <AppContent />
      </Router>
    </TokenProvider>
  );
}

export default App;