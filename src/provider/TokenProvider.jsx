// provider/TokenProvider.jsx
import { useEffect } from 'react';
import { useTokenStore } from '@/store'; // 게임 프로젝트의 토큰 store

const TokenProvider = ({ children }) => {
  const { setToken, token, isAuthenticated } = useTokenStore();

  useEffect(() => {
    console.log('🔐 TokenProvider initialized');

    // postMessage 리스너
    const handleMessage = (event) => {
      // 🔒 보안: origin 체크 - 신뢰할 수 있는 도메인만 허용
      const allowedOrigins = [
        'http://localhost:3000',           // 로컬 개발 환경
        'http://bbimt13.duckdns.org:10003' // 프로덕션 부모 앱
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('⚠️ Untrusted origin blocked:', event.origin);
        return; // 신뢰할 수 없는 출처는 무시
      }
      
      if (event.data.type === 'AUTH_TOKEN' && event.data.token) {
        console.log('✅ Token received from trusted origin:', event.origin);
        
        // useTokenStore의 setToken 형식에 맞게 변환
        setToken({
          access_token: event.data.token,
          token_type: 'bearer'
        });
        
        // 부모에게 토큰 수신 확인 응답 (선택사항)
        if (window.parent !== window) {
          window.parent.postMessage(
            { type: 'TOKEN_RECEIVED', success: true },
            event.origin
          );
        }
      }
    };

    // 메시지 리스너 등록
    window.addEventListener('message', handleMessage);

    // 부모에게 준비 완료 신호 보내기
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'GAME_READY' },
        '*'
      );
      console.log('📤 Sent GAME_READY signal to parent');
    }

    // 클린업
    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('🔐 TokenProvider unmounted');
    };
  }, [setToken]);

  // 토큰 상태 로깅 (개발 환경에서만)
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('🔑 Token authenticated');
      console.log('Token preview:', token.substring(0, 20) + '...');
    } else {
      console.log('⏳ Waiting for token from parent...');
    }
  }, [token, isAuthenticated]);

  // children을 그대로 렌더링
  return <>{children}</>;
};

export default TokenProvider;