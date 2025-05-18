import React, { useEffect, useState } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

interface GameBackgroundProps {
  children: React.ReactNode;
  backgroundHue: number;
}

const GameBackground: React.FC<GameBackgroundProps> = ({ children, backgroundHue }) => {
  const [bgStyle, setBgStyle] = useState({
    backgroundColor: `hsl(${backgroundHue}, 100%, 97%)`,
  });

  useEffect(() => {
    setBgStyle({
      backgroundColor: `hsl(${backgroundHue}, 100%, 97%)`,
    });
  }, [backgroundHue]);

  return (
    <div 
      className="w-full h-screen overflow-hidden relative"
      style={bgStyle}
    >
      {/* Light patterns for visual interest */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-t from-white to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-white to-transparent"></div>
        <div className="absolute top-0 left-0 w-96 h-full bg-gradient-to-r from-white to-transparent"></div>
      </div>
      
      {children}
    </div>
  );
};

export default GameBackground;