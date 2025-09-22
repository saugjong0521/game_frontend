import React, { useState } from 'react';
import PlayerSetting from './setting/PlayerSetting.jsx';
import getGameSoundsInstance from './systems/GameSounds.jsx';

// 싱글톤 인스턴스 가져오기
const gameSounds = getGameSoundsInstance();

const SettingsModal = ({ onClose, gameEngineRef }) => {
    // useState에 함수를 전달하여 컴포넌트가 마운트될 때마다 현재 값을 가져오도록 함
    const [controlScheme, setControlScheme] = useState(() => PlayerSetting.controlScheme);
    const [joystickSide, setJoystickSide] = useState(() => PlayerSetting.joystickPosition);
    const [offsetX, setOffsetX] = useState(() => PlayerSetting.joystickOffset?.x);
    const [offsetY, setOffsetY] = useState(() => PlayerSetting.joystickOffset?.y);
    const [arrowSide, setArrowSide] = useState(() => PlayerSetting.arrowPadPosition);
    const [arrowX, setArrowX] = useState(() => PlayerSetting.arrowPadOffset?.x);
    const [arrowY, setArrowY] = useState(() => PlayerSetting.arrowPadOffset?.y);
    
    // 사운드 볼륨 상태 - 컴포넌트 마운트 시 현재 값 가져오기
    const [masterVolume, setMasterVolume] = useState(() => (gameSounds.masterVolume || 0.5) * 100);
    const [bgmVolume, setBgmVolume] = useState(() => (gameSounds.bgmVolume || 0.5) * 100);
    const [sfxVolume, setSfxVolume] = useState(() => (gameSounds.sfxVolume || 0.5) * 100);

    const apply = () => {
        // 컨트롤 설정 적용
        PlayerSetting.controlScheme = controlScheme;
        PlayerSetting.joystickPosition = joystickSide;
        PlayerSetting.joystickOffset = { x: Number(offsetX) || 0, y: Number(offsetY) || 0 };
        PlayerSetting.arrowPadPosition = arrowSide;
        PlayerSetting.arrowPadOffset = { x: Number(arrowX) || 0, y: Number(arrowY) || 0 };
        
        // 사운드 설정 적용
        const masterVol = masterVolume / 100;
        const bgmVol = bgmVolume / 100;
        const sfxVol = sfxVolume / 100;
        
        gameSounds.setMasterVolume(masterVol);
        gameSounds.setBGMVolume(bgmVol);
        gameSounds.setSFXVolume(sfxVol);
        
        // GameEngine에도 볼륨 설정 전달 (있는 경우)
        if (gameEngineRef?.current) {
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

    // 볼륨 변경 시 즉시 적용 (미리보기)
    const handleVolumeChange = (type, value) => {
        const numValue = Number(value) || 0;
        const volume = numValue / 100;
        
        switch(type) {
            case 'master':
                setMasterVolume(numValue);
                gameSounds.setMasterVolume(volume);
                break;
            case 'bgm':
                setBgmVolume(numValue);
                gameSounds.setBGMVolume(volume);
                break;
            case 'sfx':
                setSfxVolume(numValue);
                gameSounds.setSFXVolume(volume);

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
                                    value={masterVolume}
                                    onChange={(e) => handleVolumeChange('master', e.target.value)}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                />
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
                                    value={bgmVolume}
                                    onChange={(e) => handleVolumeChange('bgm', e.target.value)}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                />
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
                                    value={sfxVolume}
                                    onChange={(e) => handleVolumeChange('sfx', e.target.value)}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                />
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
            `}</style>
        </>
    );
};

export default SettingsModal;