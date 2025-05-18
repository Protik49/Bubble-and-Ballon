import React from 'react';
import { useSpring, animated } from 'react-spring';
import { ComboMessage as ComboMessageType } from '../types/game';

interface ComboMessageProps {
  message: ComboMessageType;
}

const ComboMessage: React.FC<ComboMessageProps> = ({ message }) => {
  const { x, y, text } = message;
  
  // Animation for the combo message - float up and fade out
  const messageAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(0px) scale(0.5)' },
    to: { opacity: 1, transform: 'translateY(-40px) scale(1.2)' },
    config: { tension: 200, friction: 20 },
    delay: 50,
  });

  // Determine text color based on combo level for visual hierarchy
  const getTextColor = () => {
    if (text.includes('INFINITY')) return 'text-rose-500 font-bold';
    if (text.includes('Ultra')) return 'text-purple-500 font-bold';
    if (text.includes('Super')) return 'text-indigo-500 font-bold';
    return 'text-blue-500';
  };

  return (
    <animated.div
      className={`absolute pointer-events-none ${getTextColor()} text-xl font-semibold drop-shadow-md z-20`}
      style={{
        ...messageAnimation,
        left: x,
        top: y,
        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}
    >
      {text}
    </animated.div>
  );
};

export default ComboMessage;