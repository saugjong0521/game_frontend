import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    useTokenStore,
    useUserInfoStore
} from '@/store';
import { useGetUserInfo } from '@/hooks';

const Navigation = ({ isHidden = false, onMenuStateChange }) => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { userInfo } = useUserInfoStore();
    const { isAuthenticated } = useTokenStore();
    const { getUserInfo, loading } = useGetUserInfo();

    useEffect(() => {
        if (isAuthenticated && !userInfo) {
            getUserInfo();
        }
    }, [isAuthenticated, userInfo]);

    useEffect(() => {
        if (onMenuStateChange) {
            onMenuStateChange(mobileMenuOpen);
        }
    }, [mobileMenuOpen, onMenuStateChange]);

    const toggleDropdown = (menu) => {
        setActiveDropdown(activeDropdown === menu ? null : menu);
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
            <nav className={`fixed top-0 left-0 w-full bg-black/90 backdrop-blur-md border-b border-purple-500/30 z-[100] px-4 lg:px-8 transition-transform duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center h-16 md:h-18">
                    <Link
                        to="/"
                        className="text-xl md:text-2xl font-black text-white no-underline bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 bg-clip-text text-transparent bg-[length:200%_200%] animate-pulse tracking-wide"
                        onClick={closeMobileMenu}
                    >
                        OVER101
                    </Link>

                    {/* Hamburger Button */}
                    <button
                        className={`flex flex-col bg-black/95 items-center justify-center w-8 h-8 space-y-1 group ${mobileMenuOpen ? 'z-[1003]' : 'z-[999]'}`}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
                        <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                    </button>
                </div>
            </nav>

            {/* Menu Modal */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[1001]">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeMobileMenu}
                    ></div>

                    <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-purple-500/30 shadow-2xl animate-in slide-in-from-top-4 duration-300 max-h-[calc(100vh-4rem)] overflow-y-auto">
                        <div className="px-4 py-6 space-y-4">
                            <div className="border-b border-white/10 pb-4 space-y-3">
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

                            <div className="space-y-2">
                                {/* Game Dropdown */}
                                <div>
                                    <button
                                        className="w-full text-left text-white font-semibold text-lg px-2 py-2 uppercase tracking-wider flex items-center justify-between hover:bg-white/5 rounded transition-all"
                                        onClick={() => toggleDropdown('game')}
                                    >
                                        GAME
                                        <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'game' ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    {activeDropdown === 'game' && (
                                        <div className="mt-1 space-y-1">
                                            <Link
                                                to="/game/survival"
                                                className="block text-white/80 no-underline px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-500"
                                                onClick={closeMobileMenu}
                                            >
                                                SURVIVAL
                                            </Link>
                                            <Link
                                                to="/game/fortune"
                                                className="block text-white/80 no-underline px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:text-purple-500"
                                                onClick={closeMobileMenu}
                                            >
                                                FORTUNE FRENZY
                                            </Link>
                                            <Link
                                                to="/game/tokencrush"
                                                className="block text-white/80 no-underline px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:text-purple-500"
                                                onClick={closeMobileMenu}
                                            >
                                                TOKEN CRUSH
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Ticket Dropdown */}
                                <div>
                                    <button
                                        className="w-full text-left text-white font-semibold text-lg px-2 py-2 uppercase tracking-wider flex items-center justify-between hover:bg-white/5 rounded transition-all"
                                        onClick={() => toggleDropdown('ticket')}
                                    >
                                        Ticket Buy
                                        <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'ticket' ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    {activeDropdown === 'ticket' && (
                                        <div className="mt-1 space-y-1">
                                            <Link
                                                to="/ticket/survival"
                                                className="block text-white/80 no-underline px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-500"
                                                onClick={closeMobileMenu}
                                            >
                                                SURVIVAL
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Leaderboard Dropdown */}
                                <div>
                                    <button
                                        className="w-full text-left text-white font-semibold text-lg px-2 py-2 uppercase tracking-wider flex items-center justify-between hover:bg-white/5 rounded transition-all"
                                        onClick={() => toggleDropdown('leaderboard')}
                                    >
                                        LEADERBOARD
                                        <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'leaderboard' ? 'rotate-180' : ''}`}>▼</span>
                                    </button>
                                    {activeDropdown === 'leaderboard' && (
                                        <div className="mt-1 space-y-1">
                                            <Link
                                                to="/leaderboard/survival"
                                                className="block text-white/80 no-underline px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-blue-500"
                                                onClick={closeMobileMenu}
                                            >
                                                SURVIVAL
                                            </Link>
                                            <Link
                                                to="/leaderboard/fortune"
                                                className="block text-white/80 no-underline px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 hover:text-purple-500"
                                                onClick={closeMobileMenu}
                                            >
                                                FORTUNE FRENZY
                                            </Link>
                                        </div>
                                    )}
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