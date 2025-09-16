import React, { useState } from 'react';
import { useSignIn } from '../hooks/useSingIn';

const Home = () => {
    const [showLogin, setShowLogin] = useState(false);
    const {
        formData,
        handleChange,
        handleSignIn,
        handleSignOut,
        loading,
        error,
        success
    } = useSignIn();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSignIn();
        }
    };

    // 로그인 성공 시 메인 화면 표시
    if (success) {
        return (
            <div className="w-screen h-[calc(100vh-4rem)] relative bg-gradient-to-br from-purple-900 via-purple-700 to-amber-500 flex items-center justify-center overflow-hidden" style={{ marginTop: '4rem' }}>
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
                
                {/* Energy rings */}
                <div className="absolute border-2 border-blue-500/30 rounded-full animate-pulse w-75 h-75" style={{ top: 'calc(50% - 4rem)', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
                <div className="absolute border-2 border-purple-500/30 rounded-full animate-pulse w-96 h-96" style={{ top: 'calc(50% - 4rem)', left: '50%', transform: 'translate(-50%, -50%)', animationDelay: '1s' }}></div>
                <div className="absolute border-2 border-amber-500/30 rounded-full animate-pulse w-[28rem] h-[28rem]" style={{ top: 'calc(50% - 4rem)', left: '50%', transform: 'translate(-50%, -50%)', animationDelay: '2s' }}></div>
                
                {/* Lightning effects */}
                <div className="absolute -top-[10%] left-[15%] w-0.5 h-[30%] bg-gradient-to-b from-transparent via-blue-500 to-transparent transform rotate-[15deg] origin-top animate-pulse"></div>
                <div className="absolute top-[20%] right-[10%] w-0.5 h-[40%] bg-gradient-to-b from-transparent via-amber-500 to-transparent transform -rotate-[25deg] origin-top animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-[10%] left-[25%] w-0.5 h-[25%] bg-gradient-to-b from-transparent via-purple-500 to-transparent transform rotate-[35deg] origin-top animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-[10%] left-[70%] w-0.5 h-[35%] bg-gradient-to-b from-transparent via-cyan-500 to-transparent transform -rotate-[15deg] origin-top animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Title */}
                <div className="relative z-10 text-center text-white font-black" style={{ transform: 'translateY(-4rem)' }}>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-wider m-0 font-black bg-gradient-to-r from-white via-blue-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                        K STADIUM<br/>GAME<br/>FESTA
                    </h1>
                </div>
                
                {/* Subtitle */}
                <div className="absolute left-1/2 transform -translate-x-1/2 text-xs sm:text-sm md:text-xl lg:text-2xl text-white/80 text-center font-light tracking-[0.2em]" style={{ bottom: 'calc(15% + 4rem)' }}>
                    THE ULTIMATE GAMING EXPERIENCE
                </div>

                {/* Logout button */}
                <button
                    onClick={handleSignOut}
                    className="absolute top-8 right-8 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg transition-all duration-200"
                >
                    로그아웃
                </button>
            </div>
        );
    }

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

            {!showLogin ? (
                // 초기 화면 - 타이틀과 로그인 버튼
                <>
                    {/* Title */}
                    <div className="relative z-10 text-center text-white font-black">
                        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-wider m-0 font-black bg-gradient-to-r from-white via-blue-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                            K STADIUM<br/>GAME<br/>FESTA
                        </h1>
                    </div>
                    
                    {/* Subtitle */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 text-xs sm:text-sm md:text-xl lg:text-2xl text-white/80 text-center font-light tracking-[0.2em]" style={{ bottom: '20%' }}>
                        THE ULTIMATE GAMING EXPERIENCE
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={() => setShowLogin(true)}
                        className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                        게임 시작하기
                    </button>
                </>
            ) : (
                // 로그인 폼 화면
                <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">로그인</h2>
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
                                disabled={loading}
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
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowLogin(false)}
                                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSignIn}
                                disabled={loading}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>로그인</span>
                                    </div>
                                ) : (
                                    '로그인'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;