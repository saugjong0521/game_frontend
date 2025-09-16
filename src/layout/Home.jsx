import React, { useState } from 'react';
import { useSignIn } from '../hooks/useSingIn';
import { useGetUserInfo } from '../hooks/useGetUserInfo';

const Home = () => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const {
        formData,
        handleChange,
        handleSignIn,
        handleSignOut,
        loading: signInLoading,
        error: signInError,
        success
    } = useSignIn();

    const {
        getUserInfo,
        userInfo,
        loading: userInfoLoading,
        error: userInfoError,
        isAuthenticated
    } = useGetUserInfo();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !signInLoading && !isLoggingIn) {
            handleLogin();
        }
    };

    const handleLogin = async () => {
        setIsLoggingIn(true);
        
        try {
            // 1. 로그인 실행
            console.log('Starting sign in...');
            const signInResult = await handleSignIn();
            console.log('Sign in result:', signInResult);
            
            if (signInResult !== false) {
                // 2. 로그인 성공 시 사용자 정보 조회
                console.log('Getting user info...');
                const userInfoResult = await getUserInfo();
                console.log('User info result:', userInfoResult);
            }
        } catch (error) {
            console.error('Login process failed:', error);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const isLoading = signInLoading || userInfoLoading || isLoggingIn;

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

                    {/* 디버그 정보 표시 */}
                    {userInfo && (
                        <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-blue-200 text-sm">
                            <div>사용자 정보 로드 완료!</div>
                            <div>인증 상태: {isAuthenticated ? '인증됨' : '미인증'}</div>
                            <div>사용자 ID: {userInfo.id || 'N/A'}</div>
                        </div>
                    )}

                    {/* 에러 메시지 표시 */}
                    {(signInError || userInfoError) && (
                        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                            {signInError || userInfoError}
                        </div>
                    )}

                    {/* 성공 메시지 표시 */}
                    {success && !userInfoError && !userInfo && (
                        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
                            로그인 성공! 사용자 정보를 불러오는 중...
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
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

                    {/* 디버그용 로그아웃 버튼 (로그인 성공 시에만 표시) */}
                    {success && (
                        <button
                            onClick={handleSignOut}
                            className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white/80 text-sm rounded-lg transition-all duration-200"
                        >
                            로그아웃
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;