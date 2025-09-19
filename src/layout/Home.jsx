import React, { useState, useEffect } from 'react';
import { useSignIn } from '../hooks/useSingIn';
import { useGetUserInfo } from '../hooks/useGetUserInfo';

const Home = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isInitializing, setIsInitializing] = useState(true);
    
    const {
        formData: signInFormData,
        handleChange: signInHandleChange,
        handleSignIn,
        handleSignOut,
        loading: signInLoading,
        error: signInError,
        success: signInSuccess
    } = useSignIn();

    const {
        getUserInfo,
        userInfo,
        loading: userInfoLoading,
        error: userInfoError,
        isAuthenticated
    } = useGetUserInfo();

    // 폼 데이터 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 컴포넌트 마운트 시 항상 사용자 정보 가져오기
    useEffect(() => {
        const initializeSession = async () => {
            console.log('Home component mounted - fetching user info...');
            setIsInitializing(true);
            
            try {
                // 인증된 상태라면 사용자 정보 가져오기
                if (isAuthenticated) {
                    await getUserInfo();
                    console.log('✅ User info loaded');
                } else {
                    console.log('ℹ️ Not authenticated - skipping user info fetch');
                }
            } catch (error) {
                console.error('Failed to load user info:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeSession();
    }, []); // 빈 의존성 배열로 마운트 시에만 실행

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !signInLoading && !userInfoLoading) {
            handleLogin();
        }
    };

    const handleLogin = async () => {
        if (!formData.username.trim() || !formData.password.trim()) {
            console.error('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            console.log('Starting sign in...');
            await handleSignIn();
            
            // 로그인 성공 시 사용자 정보 가져오기
            if (signInSuccess) {
                await getUserInfo();
            }
            
            // 폼 데이터 초기화
            setFormData({ username: '', password: '' });
        } catch (error) {
            console.error('Login process failed:', error);
        }
    };

    const handleLogout = async () => {
        try {
            handleSignOut();
            console.log('✅ Successfully logged out');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // 만료 날짜 포맷팅 함수
    const formatExpiresAt = (expiresAt) => {
        if (!expiresAt || expiresAt === 'string') return 'N/A';
        try {
            const date = new Date(expiresAt);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const isCurrentlyLoading = signInLoading || userInfoLoading;

    // 초기화 중일 때 로딩 화면
    if (isInitializing) {
        return (
            <div className="w-screen h-screen relative bg-gradient-to-br from-purple-900 via-purple-700 to-amber-500 flex items-center justify-center overflow-hidden">
                {/* Background overlay effects */}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
                        `
                    }}
                ></div>
                
                {/* Loading content */}
                <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-white mb-2">세션 확인 중...</h2>
                        <p className="text-white/80">잠시만 기다려주세요</p>
                    </div>
                </div>
            </div>
        );
    }

    // 로그인 성공 후 사용자 정보가 있으면 대시보드 표시
    if (userInfo && isAuthenticated) {
        return (
            <div className="w-screen h-screen relative bg-gradient-to-br from-purple-900 via-purple-700 to-amber-500 flex items-center justify-center overflow-hidden">
                {/* Background overlay effects */}
                <div 
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
                        `
                    }}
                ></div>
                
                {/* Particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(9)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white/80 rounded-full animate-bounce"
                            style={{
                                left: `${(i + 1) * 10}%`,
                                animationDelay: `${i * 0.5}s`,
                                animationDuration: '6s',
                            }}
                        />
                    ))}
                </div>

                {/* 사용자 정보 대시보드 */}
                <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-blue-300 to-purple-300 bg-clip-text text-transparent">
                            환영합니다!
                        </h1>
                        <p className="text-white/80">사용자 정보</p>
                    </div>

                    <div className="space-y-6">
                        {/* 사용자 ID */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-white/70 text-sm font-medium">사용자 ID</span>
                                <span className="text-white text-lg font-semibold">{userInfo.user_id}</span>
                            </div>
                        </div>

                        {/* 티켓 정보 */}
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <h3 className="text-white/90 text-lg font-semibold mb-4">티켓 정보</h3>
                            
                            <div className="space-y-3">
                                {/* 횟수권 (ONE) */}
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span className="text-white font-medium">횟수권</span>
                                    </div>
                                    <span className="text-blue-200 text-lg font-bold">
                                        {userInfo?.ticket_info?.ONE || 0}회
                                    </span>
                                </div>

                                {/* 기간권 */}
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg border border-green-500/30">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        <span className="text-white font-medium">기간권</span>
                                    </div>
                                    <span className="text-green-200 text-sm">
                                        {userInfo?.ticket_info?.expires_at && userInfo.ticket_info.expires_at !== null 
                                            ? `${formatExpiresAt(userInfo.ticket_info.expires_at)}까지` 
                                            : '없음'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 로그아웃 버튼 */}
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200 border border-white/20"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 로그인 폼 (기본 상태)
    return (
        <div className="w-screen h-screen relative bg-gradient-to-br from-purple-900 via-purple-700 to-amber-500 flex items-center justify-center overflow-hidden">
            {/* Background overlay effects */}
            <div 
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
                    `
                }}
            ></div>
            
            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(9)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/80 rounded-full animate-bounce"
                        style={{
                            left: `${(i + 1) * 10}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: '6s',
                        }}
                    />
                ))}
            </div>

            {/* 로그인 폼 */}
            <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-blue-300 to-purple-300 bg-clip-text text-transparent">
                        Test
                    </h1>
                    <h2 className="text-xl font-bold text-white mb-2">로그인</h2>
                    <p className="text-white/80">계정 정보를 입력하세요</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            아이디
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="아이디를 입력하세요"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="비밀번호를 입력하세요"
                            disabled={isLoading}
                        />
                    </div>

                    {/* 에러 메시지 표시 */}
                    {(signInError || userInfoError) && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                            {signInError || userInfoError}
                        </div>
                    )}

                    {/* 성공 메시지 표시 */}
                    {signInSuccess && !userInfoError && !userInfo && (
                        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
                            로그인 성공! 사용자 정보를 불러오는 중...
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={isCurrentlyLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                    >
                        {isCurrentlyLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>
                                    {signInLoading ? '로그인 중...' : 
                                     userInfoLoading ? '정보 불러오는 중...' : 
                                     '처리 중...'}
                                </span>
                            </div>
                        ) : (
                            '로그인'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
