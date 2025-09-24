import React, { useState, useEffect } from 'react';
import PlayerSetting from './setting/PlayerSetting.jsx';
import getGameSoundsInstance from './systems/GameSounds.jsx';

// 싱글톤 인스턴스 가져오기
const gameSounds = getGameSoundsInstance();

const SettingsModal = ({ onClose, gameEngineRef }) => {
    // 컨트롤 설정
    const [controlScheme, setControlScheme] = useState(() => PlayerSetting.controlScheme);
    const [joystickSide, setJoystickSide] = useState(() => PlayerSetting.joystickPosition);
    const [offsetX, setOffsetX] = useState(() => PlayerSetting.joystickOffset?.x);
    const [offsetY, setOffsetY] = useState(() => PlayerSetting.joystickOffset?.y);
    const [arrowSide, setArrowSide] = useState(() => PlayerSetting.arrowPadPosition);
    const [arrowX, setArrowX] = useState(() => PlayerSetting.arrowPadOffset?.x);
    const [arrowY, setArrowY] = useState(() => PlayerSetting.arrowPadOffset?.y);

    // 사운드 볼륨 상태 - 실제 값 가져오기
    const [masterVolume, setMasterVolume] = useState(0);
    const [bgmVolume, setBgmVolume] = useState(0);
    const [sfxVolume, setSfxVolume] = useState(0);

    // 컴포넌트 마운트 시 실제 볼륨 값 로드
    useEffect(() => {
        const loadCurrentVolumes = () => {
            // GameSounds 인스턴스에서 현재 볼륨 가져오기
            const currentMaster = gameSounds.masterVolume * 100;
            const currentBGM = gameSounds.bgmVolume * 100;
            const currentSFX = gameSounds.sfxVolume * 100;
            
            setMasterVolume(currentMaster);
            setBgmVolume(currentBGM);
            setSfxVolume(currentSFX);

        };

        loadCurrentVolumes();
    }, []);

    const apply = () => {
        // 컨트롤 설정 적용
        PlayerSetting.controlScheme = controlScheme;
        PlayerSetting.joystickPosition = joystickSide;
        PlayerSetting.joystickOffset = { x: Number(offsetX) || 0, y: Number(offsetY) || 0 };
        PlayerSetting.arrowPadPosition = arrowSide;
        PlayerSetting.arrowPadOffset = { x: Number(arrowX) || 0, y: Number(arrowY) || 0 };

        // 사운드 설정 적용 (이미 handleVolumeChange에서 실시간으로 적용됨)
        console.log('Applied settings:', {
            master: masterVolume,
            bgm: bgmVolume,
            sfx: sfxVolume
        });

        // GameEngine에도 볼륨 설정 전달 (있는 경우)
        if (gameEngineRef?.current) {
            const masterVol = masterVolume / 100;
            const bgmVol = bgmVolume / 100;
            const sfxVol = sfxVolume / 100;

            if (typeof gameEngineRef.current.setMasterVolume === 'function') {
                gameEngineRef.current.setMasterVolume(masterVol);
            }
            if (typeof gameEngineRef.current.setBGMVolume === 'function') {
                gameEngineRef.current.setBGMVolume(bgmVol);
            }
            if (typeof gameEngineRef.current.setSFXVolume === 'function') {
                gameEngineRef.current.setSFXVolume(sfxVol);
            }
        }

        onClose?.();
    };

    // 볼륨 변경 시 즉시 적용 (미리보기) + 로컬 상태 업데이트
    const handleVolumeChange = (type, value) => {
        const numValue = Math.max(0, Math.min(100, Number(value) || 0));
        const volume = numValue / 100;

        switch (type) {
            case 'master':
                setMasterVolume(numValue);
                gameSounds.setMasterVolume(volume);
                console.log('Master volume set to:', numValue);
                break;
            case 'bgm':
                setBgmVolume(numValue);
                gameSounds.setBGMVolume(volume);
                console.log('BGM volume set to:', numValue);
                break;
            case 'sfx':
                setSfxVolume(numValue);
                gameSounds.setSFXVolume(volume);
                console.log('SFX volume set to:', numValue);
                break;
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-md bg-gray-800 p-4 md:p-6 rounded-lg text-white max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg md:text-xl font-bold mb-4">Game Settings</h3>

                    <div className="space-y-6">
                        {/* Control Settings */}
                        <div className="border-b border-gray-600 pb-4">
                            <h4 className="text-md font-semibold mb-3 text-gray-300">Controls</h4>

                            {/* Control Scheme Selection */}
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium">Control Scheme</label>
                                <select
                                    value={controlScheme}
                                    onChange={(e) => setControlScheme(e.target.value)}
                                    className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                                >
                                    <option value="joystick">Joystick</option>
                                    <option value="arrows">Arrow Pad</option>
                                </select>
                            </div>

                            {/* Joystick Settings */}
                            {controlScheme === 'joystick' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block mb-2 text-sm font-medium">Joystick Position</label>
                                        <select
                                            value={joystickSide}
                                            onChange={(e) => setJoystickSide(e.target.value)}
                                            className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                                        >
                                            <option value="left">Left</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium">Offset X</label>
                                            <input
                                                type="number"
                                                value={offsetX}
                                                onChange={(e) => setOffsetX(e.target.value)}
                                                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                                                placeholder="48"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium">Offset Y</label>
                                            <input
                                                type="number"
                                                value={offsetY}
                                                onChange={(e) => setOffsetY(e.target.value)}
                                                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                                                placeholder="48"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Arrow Pad Settings */}
                            {controlScheme === 'arrows' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block mb-2 text-sm font-medium">Arrow Pad Position</label>
                                        <select
                                            value={arrowSide}
                                            onChange={(e) => setArrowSide(e.target.value)}
                                            className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                                        >
                                            <option value="left">Left</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2 text-sm font-medium">Arrow Offset X</label>
                                            <input
                                                type="number"
                                                value={arrowX}
                                                onChange={(e) => setArrowX(e.target.value)}
                                                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                                                placeholder="48"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium">Arrow Offset Y</label>
                                            <input
                                                type="number"
                                                value={arrowY}
                                                onChange={(e) => setArrowY(e.target.value)}
                                                className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                                                placeholder="48"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Sound Settings */}
                        <div>
                            <h4 className="text-md font-semibold mb-3 text-gray-300">Audio</h4>

                            {/* Master Volume */}
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium">
                                    Master Volume: {Math.round(masterVolume)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={masterVolume}
                                    onChange={(e) => handleVolumeChange('master', e.target.value)}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* BGM Volume */}
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium">
                                    Background Music: {Math.round(bgmVolume)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={bgmVolume}
                                    onChange={(e) => handleVolumeChange('bgm', e.target.value)}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* SFX Volume */}
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium">
                                    Sound Effects: {Math.round(sfxVolume)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={sfxVolume}
                                    onChange={(e) => handleVolumeChange('sfx', e.target.value)}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* 현재 볼륨 표시 (디버그용) */}
                            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-700 rounded">
                                Current: M={Math.round(masterVolume)}% | BGM={Math.round(bgmVolume)}% | SFX={Math.round(sfxVolume)}%
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row justify-end gap-4 mt-6">
                        <button
                            onClick={onClose}
                            className="w-full md:w-auto px-4 py-3 bg-gray-600 rounded hover:bg-gray-500 transition-colors text-base"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={apply}
                            className="w-full md:w-auto px-4 py-3 bg-blue-600 rounded hover:bg-blue-500 transition-colors text-base"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    border: 2px solid #1E40AF;
                }

                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3B82F6;
                    cursor: pointer;
                    border: 2px solid #1E40AF;
                }

                .slider::-webkit-slider-track {
                    background: #374151;
                    height: 8px;
                    border-radius: 4px;
                }

                .slider::-moz-range-track {
                    background: #374151;
                    height: 8px;
                    border-radius: 4px;
                }
            `}</style>
        </>
    );
};

export default SettingsModal;