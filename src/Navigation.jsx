import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTokenStore } from './store/useTokenStore';
import { useGetUserInfo } from './hooks/useGetUserInfo';
import { useUserInfoStore } from './store/useUserinfoStore';

const Navigation = ({ isHidden = false }) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // store에서 사용자 정보와 토큰 정보 가져오기
    const { userInfo } = useUserInfoStore();
    const { isAuthenticated } = useTokenStore();
    
    // 사용자 정보를 가져오는 hook
    const { getUserInfo, loading } = useGetUserInfo();
    
    // 토큰이 있고 사용자 정보가 없을 때 사용자 정보 가져오기
    useEffect(() => {
        if (isAuthenticated && !userInfo) {
            getUserInfo();
        }
    }, [isAuthenticated, userInfo]);

    const toggleDropdown = (menu) => {
        setActiveDropdown(activeDropdown === menu ? null : menu);
    };

    const closeDropdown = () => {
        setActiveDropdown(null);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        setActiveDropdown(null);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full bg-black/90 backdrop-blur-md border-b border-purple-500/30 z-[1000] px-4 lg:px-8 transition-transform duration-300 ${
                isHidden ? '-translate-y-full' : 'translate-y-0'
            }`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center h-16 md:h-18">
                    {/* 로고 */}
                    <Link
                        to="/"
                        className="text-xl md:text-2xl font-black text-white no-underline bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 bg-clip-text text-transparent bg-[length:200%_200%] animate-pulse tracking-wide"
                        onClick={closeMobileMenu}
                    >
                        OVER101
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden xl:flex gap-4 md:gap-8 items-center">
                        <div className="flex gap-4 md:gap-8 items-center">
                            {/* GAME 메뉴 */}
                            <div className="relative">
                                <button
                                    className={`bg-none border-none text-white text-sm md:text-base font-semibold px-3 md:px-4 py-2 cursor-pointer uppercase tracking-wider flex items-center gap-2 transition-all duration-300 rounded hover:text-blue-500 hover:bg-blue-500/10 hover:-translate-y-0.5 ${activeDropdown === 'game' ? 'text-purple-500 bg-purple-500/20' : ''
                                        }`}
                                    onClick={() => toggleDropdown('game')}
                                >
                                    GAME
                                    <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'game' ? 'rotate-180' : ''
                                        }`}>▼</span>
                                </button>
                                {activeDropdown === 'game' && (
                                    <div className="absolute top-full left-0 bg-black/95 backdrop-blur-md border border-purple-500/30 rounded-lg min-w-[200px] shadow-2xl animate-in slide-in-from-top-2 duration-300 mt-2">
                                        <Link
                                            to="/game/survival"
                                            className="block text-white no-underline px-4 py-3 font-medium transition-all duration-300 rounded-md m-1 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-500 hover:translate-x-1"
                                            onClick={closeDropdown}
                                        >
                                            SURVIVAL
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* GUIDE 메뉴 */}
                            <div className="relative">
                                <button
                                    className={`bg-none border-none text-white text-sm md:text-base font-semibold px-3 md:px-4 py-2 cursor-pointer uppercase tracking-wider flex items-center gap-2 transition-all duration-300 rounded hover:text-blue-500 hover:bg-blue-500/10 hover:-translate-y-0.5 ${activeDropdown === 'guide' ? 'text-purple-500 bg-purple-500/20' : ''
                                        }`}
                                    onClick={() => toggleDropdown('guide')}
                                >
                                    GUIDE
                                    <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'guide' ? 'rotate-180' : ''
                                        }`}>▼</span>
                                </button>
                                {activeDropdown === 'guide' && (
                                    <div className="absolute top-full left-0 bg-black/95 backdrop-blur-md border border-purple-500/30 rounded-lg min-w-[200px] shadow-2xl animate-in slide-in-from-top-2 duration-300 mt-2">
                                        <Link
                                            to="/guide/survival"
                                            className="block text-white no-underline px-4 py-3 font-medium transition-all duration-300 rounded-md m-1 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-500 hover:translate-x-1"
                                            onClick={closeDropdown}
                                        >
                                            SURVIVAL
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* LEADERBOARD 메뉴 */}
                            <div className="relative">
                                <button
                                    className={`bg-none border-none text-white text-sm md:text-base font-semibold px-3 md:px-4 py-2 cursor-pointer uppercase tracking-wider flex items-center gap-2 transition-all duration-300 rounded hover:text-blue-500 hover:bg-blue-500/10 hover:-translate-y-0.5 ${activeDropdown === 'leaderboard' ? 'text-purple-500 bg-purple-500/20' : ''
                                        }`}
                                    onClick={() => toggleDropdown('leaderboard')}
                                >
                                    LEADERBOARD
                                    <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'leaderboard' ? 'rotate-180' : ''
                                        }`}>▼</span>
                                </button>
                                {activeDropdown === 'leaderboard' && (
                                    <div className="absolute top-full left-0 bg-black/95 backdrop-blur-md border border-purple-500/30 rounded-lg min-w-[200px] shadow-2xl animate-in slide-in-from-top-2 duration-300 mt-2">
                                        <Link
                                            to="/leaderboard/survival"
                                            className="block text-white no-underline px-4 py-3 font-medium transition-all duration-300 rounded-md m-1 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-500 hover:translate-x-1"
                                            onClick={closeDropdown}
                                        >
                                            SURVIVAL
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 티켓 정보와 사용자 정보 표시 */}
                        <div className="flex items-center gap-3 md:gap-4">

                            {/* 사용자 정보 - 인증 상태만 표시 */}
                            <div className="flex items-center">
                                {isAuthenticated ? (
                                    <div className="flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 rounded-lg px-3 md:px-4 py-2 transition-all duration-300 hover:bg-blue-500/25">
                                        <span className="text-base">👤</span>
                                        <span className="text-white font-medium text-sm md:text-base">
                                            {userInfo?.user_id || 'Authenticated'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-white/60 text-sm">
                                        Not signed in
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button 
                        className="xl:hidden flex flex-col bg-black/95 items-center justify-center w-8 h-8 space-y-1 group"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle mobile menu"
                    >
                        <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Modal */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[1001] xl:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeMobileMenu}
                    ></div>
                    
                    {/* Menu Content */}
                    <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-purple-500/30 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                        <div className="px-4 py-6 space-y-4">
                            {/* Mobile User Info */}
                            <div className="border-b border-white/10 pb-4 space-y-3">

                                {/* 사용자 정보 */}
                                {isAuthenticated ? (
                                    <div className="flex items-center gap-3 bg-blue-500/15 border border-blue-500/30 rounded-lg px-4 py-3">
                                        <span className="text-base">👤</span>
                                        <span className="text-white font-medium text-sm">
                                            {userInfo?.user_id || 'Authenticated'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-white/60 text-sm px-4 py-2">
                                        Not signed in
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Items */}
                            <div className="space-y-2">
                                <div>
                                    <div className="text-white font-semibold text-lg mb-2 px-2 uppercase tracking-wider">Game</div>
                                    <Link
                                        to="/game/survival"
                                        className="block text-white/80 no-underline px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-500"
                                        onClick={closeMobileMenu}
                                    >
                                        SURVIVAL
                                    </Link>
                                </div>

                                <div>
                                    <div className="text-white font-semibold text-lg mb-2 px-2 uppercase tracking-wider">TICKET BUY</div>
                                    <Link
                                        to="/ticket/survival"
                                        className="block text-white/80 no-underline px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-500"
                                        onClick={closeMobileMenu}
                                    >
                                        SURVIVAL
                                    </Link>
                                </div>

                                <div>
                                    <div className="text-white font-semibold text-lg mb-2 px-2 uppercase tracking-wider">Leaderboard</div>
                                    <Link
                                        to="/leaderboard/survival"
                                        className="block text-white/80 no-underline px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-500"
                                        onClick={closeMobileMenu}
                                    >
                                        SURVIVAL
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navigation;