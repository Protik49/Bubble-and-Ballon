import React, { useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';

interface BackgroundBubble {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

const BUBBLE_COLORS = [
  'bg-gradient-to-br from-rose-200/40 to-pink-300/40',
  'bg-gradient-to-br from-violet-200/40 to-purple-300/40',
  'bg-gradient-to-br from-cyan-200/40 to-blue-300/40',
  'bg-gradient-to-br from-emerald-200/40 to-green-300/40',
  'bg-gradient-to-br from-amber-200/40 to-yellow-300/40',
];

const LandingBackground: React.FC = () => {
  const [bubbles, setBubbles] = useState<BackgroundBubble[]>([]);

  useEffect(() => {
    const createBubble = () => ({
      id: Math.random().toString(),
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 100,
      size: Math.random() * 100 + 60, // Larger bubbles
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      speed: Math.random() * 1.5 + 0.8, // Slightly faster movement
    });

    // Initial bubbles
    const initialBubbles = Array.from({ length: 20 }, createBubble);
    setBubbles(initialBubbles);

    const addBubbleInterval = setInterval(() => {
      setBubbles(prev => {
        // Remove bubbles that have gone off screen
        const filtered = prev.filter(bubble => bubble.y > -100);
        // Add new bubble if we're below the limit
        return filtered.length < 25 ? [...filtered, createBubble()] : filtered;
      });
    }, 1500); // Slightly faster spawn rate

    return () => clearInterval(addBubbleInterval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Animated bubbles */}
      {bubbles.map(bubble => (
        <BackgroundBubble key={bubble.id} {...bubble} />
      ))}
      
      {/* Light overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent"></div>
    </div>
  );
};

interface BackgroundBubbleProps extends BackgroundBubble {}

const BackgroundBubble: React.FC<BackgroundBubbleProps> = ({ id, x, y, size, color, speed }) => {
  const props = useSpring({
    from: { y, opacity: 0, scale: 0.8 },
    to: { y: -100, opacity: 1, scale: 1 },
    config: {
      tension: 45,
      friction: 18,
    },
    delay: Math.random() * 800,
    duration: 18000 / speed,
  });

  const wobbleProps = useSpring({
    from: { translateX: -15 },
    to: { translateX: 15 },
    config: {
      tension: 8,
      friction: 8,
    },
    loop: { reverse: true },
  });

  return (
    <animated.div
      className={`absolute ${color} rounded-full shadow-lg backdrop-blur-sm`}
      style={{
        width: size,
        height: size,
        left: x,
        top: props.y,
        opacity: props.opacity,
        transform: props.scale.to(s => 
          wobbleProps.translateX.to(tx => 
            `translate(${tx}px, 0px) scale(${s})`
          )
        ),
      }}
    >
      <div className="absolute w-1/3 h-1/3 bg-white/40 rounded-full -top-1 -left-1" />
      <div className="absolute w-full h-full rounded-full bg-gradient-to-t from-white/5 to-white/20" />
    </animated.div>
  );
};

export default LandingBackground;