import React, { useState } from 'react';
import PlayerSetting from './setting/PlayerSetting.jsx';

const SettingsModal = ({ onClose }) => {
    const [controlScheme, setControlScheme] = useState(PlayerSetting.controlScheme);
    const [joystickSide, setJoystickSide] = useState(PlayerSetting.joystickPosition);
    const [offsetX, setOffsetX] = useState(PlayerSetting.joystickOffset.x);
    const [offsetY, setOffsetY] = useState(PlayerSetting.joystickOffset.y);
    const [arrowSide, setArrowSide] = useState(PlayerSetting.arrowPadPosition);
    const [arrowX, setArrowX] = useState(PlayerSetting.arrowPadOffset.x);
    const [arrowY, setArrowY] = useState(PlayerSetting.arrowPadOffset.y);

    const apply = () => {
        PlayerSetting.controlScheme = controlScheme;
        PlayerSetting.joystickPosition = joystickSide;
        PlayerSetting.joystickOffset = { x: Number(offsetX) || 0, y: Number(offsetY) || 0 };
        PlayerSetting.arrowPadPosition = arrowSide;
        PlayerSetting.arrowPadOffset = { x: Number(arrowX) || 0, y: Number(arrowY) || 0 };
        onClose?.();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-gray-800 p-4 md:p-6 rounded-lg text-white max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg md:text-xl font-bold mb-4">Player Settings</h3>

                <div className="space-y-4">
                    {/* Control Scheme Selection */}
                    <div>
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
                            <div>
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
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium">Offset Y</label>
                                    <input
                                        type="number"
                                        value={offsetY}
                                        onChange={(e) => setOffsetY(e.target.value)}
                                        className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Arrow Pad Settings */}
                    {controlScheme === 'arrows' && (
                        <>
                            <div>
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
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium">Arrow Offset Y</label>
                                    <input
                                        type="number"
                                        value={arrowY}
                                        onChange={(e) => setArrowY(e.target.value)}
                                        className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white text-base"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </>
                    )}
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
    );
};

export default SettingsModal;