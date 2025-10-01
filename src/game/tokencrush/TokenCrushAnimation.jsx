import React from 'react';
import { TokenCrushSetting } from '@/game/tokencrush';

const TokenCrushAnimation = ({ children }) => {
    const animationStyles = {
        '--anim-explode': `${TokenCrushSetting.animation.explode}ms`,
        '--anim-blink': `${TokenCrushSetting.animation.blink}ms`,
        '--anim-fall': `${TokenCrushSetting.animation.fall}ms`,
        '--anim-swap': `${TokenCrushSetting.animation.swap}ms`,
        '--anim-hint': `${TokenCrushSetting.animation.hint}ms`,
        '--anim-pulse': `${TokenCrushSetting.animation.pulse}ms`,
        '--anim-fadeIn': `${TokenCrushSetting.animation.fadeIn}ms`,
    };

    return (
        <div style={animationStyles}>
            {children}
        </div>
    );
};

export default TokenCrushAnimation;