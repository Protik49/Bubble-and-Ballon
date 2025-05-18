import React, { useRef, useState, useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { BubbleProps } from '../types/game';

const Bubble: React.FC<BubbleProps> = ({ id, x, y, size, color: initialColor, velocity, type, isSpecial, points, onPop }) => {
  const [popped, setPopped] = useState(false);
  const [color, setColor] = useState(initialColor);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [animatedX, setAnimatedX] = useState(x);
  const [animatedY, setAnimatedY] = useState(y);
  const lastFrameTime = useRef(performance.now());
  const isAnimating = useRef(true);
  
  // Enhanced pop animation with burst effect
  const popAnimation = useSpring({
    from: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      blur: 0,
      spread: 0
    },
    to: async (next) => {
      if (popped) {
        // First phase: Quick expansion
        await next({ 
          scale: 1.2, 
          opacity: 0.8,
          rotate: 0,
          blur: 2,
          spread: 0,
          config: { tension: 400, friction: 20 }
        });
        // Second phase: Burst and fade
        await next({ 
          scale: 1.5, 
          opacity: 0,
          rotate: Math.random() > 0.5 ? 45 : -45,
          blur: 8,
          spread: 20,
          config: { tension: 200, friction: 10 }
        });
      }
    },
    config: config.gentle,
    onRest: () => {
      if (popped && bubbleRef.current) {
        bubbleRef.current.style.display = 'none';
        isAnimating.current = false;
      }
    },
  });

  // Floating animation for idle state
  const floatAnimation = useSpring({
    from: { 
      translateY: 0,
      rotate: type === 'balloon' ? -5 : 0
    },
    to: { 
      translateY: type === 'balloon' ? -10 : 10,
      rotate: type === 'balloon' ? 5 : 0
    },
    config: {
      tension: 100,
      friction: 10,
      mass: 1
    },
    loop: { reverse: true },
    pause: popped
  });

  // Color changing effect for special bubbles
  useEffect(() => {
    if (popped || !isSpecial) return;

    const colorChangeInterval = setInterval(() => {
      const colors = [
        'bg-gradient-to-br from-rose-400 to-pink-600',
        'bg-gradient-to-br from-amber-400 to-orange-600',
        'bg-gradient-to-br from-emerald-400 to-green-600'
      ];
      const currentIndex = colors.indexOf(color);
      const nextIndex = (currentIndex + 1) % colors.length;
      setColor(colors[nextIndex]);
    }, 2000);

    return () => clearInterval(colorChangeInterval);
  }, [popped, color, isSpecial]);

  // Movement animation with smooth transitions
  useEffect(() => {
    if (popped) return;
    
    let animationFrameId: number;
    isAnimating.current = true;
    
    const animate = (timestamp: number) => {
      if (!isAnimating.current) return;
      
      const deltaTime = timestamp - lastFrameTime.current;
      lastFrameTime.current = timestamp;
      
      if (deltaTime > 0) {
        setAnimatedX((prev) => {
          const newX = prev + (velocity.x || 0) * deltaTime * 0.05;
          if (newX > window.innerWidth) return -size;
          if (newX < -size) return window.innerWidth;
          return newX;
        });
        
        setAnimatedY((prev) => {
          const newY = type === 'balloon' 
            ? prev - Math.abs(velocity.y || 0) * deltaTime * 0.05
            : prev + (velocity.y || 0) * deltaTime * 0.05;
          
          if (type === 'balloon' && newY < -size * 2) {
            return window.innerHeight + size;
          }
          if (type === 'bubble' && (newY > window.innerHeight + size * 2 || newY < -size * 2)) {
            return window.innerHeight / 2;
          }
          return newY;
        });
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      isAnimating.current = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [popped, velocity.x, velocity.y, type, size]);
  
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!popped && isAnimating.current) {
      setPopped(true);
      onPop(id, animatedX, animatedY, points || 1);
    }
  };

  // Particle burst effect
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return useSpring({
      from: { x: 0, y: 0, opacity: 0 },
      to: popped ? {
        x: Math.cos(angle) * size,
        y: Math.sin(angle) * size,
        opacity: 0
      } : { x: 0, y: 0, opacity: 0 },
      config: { tension: 200, friction: 20 },
    });
  });

  return (
    <div className="absolute" style={{ left: `${animatedX}px`, top: `${animatedY}px` }}>
      <animated.div
        ref={bubbleRef}
        className={`cursor-pointer ${color} shadow-lg will-change-transform select-none transition-colors duration-500`}
        style={{
          width: `${size}px`,
          height: type === 'balloon' ? `${size * 1.2}px` : `${size}px`,
          opacity: popAnimation.opacity,
          filter: popAnimation.blur.to(b => `blur(${b}px)`),
          transform: floatAnimation.translateY.to((y) => 
            popAnimation.scale.to((s) => 
              popAnimation.rotate.to((r) => 
                `translate3d(0,${y}px,0) scale(${s}) rotate(${r}deg)`
              )
            )
          ),
          borderRadius: type === 'balloon' ? '50% 50% 50% 50% / 60% 60% 40% 40%' : '50%',
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
        }}
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
      >
        {type === 'balloon' && (
          <animated.div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-opacity-40 transition-colors duration-500"
            style={{
              backgroundColor: color.includes('pink') ? '#F472B6' :
                           color.includes('purple') ? '#A78BFA' :
                           color.includes('blue') ? '#60A5FA' :
                           color.includes('green') ? '#34D399' :
                           color.includes('yellow') ? '#FBBF24' :
                           color.includes('indigo') ? '#818CF8' : '#2DD4BF',
              borderRadius: '0 0 50% 50%',
              transform: floatAnimation.rotate.to(r => `rotate(${r}deg)`)
            }}
          />
        )}
        
        <animated.div 
          className="absolute w-1/3 h-1/3 bg-white bg-opacity-40 rounded-full -top-1 -left-1"
          style={{
            transform: floatAnimation.rotate.to(r => `rotate(${-r * 0.5}deg)`)
          }}
        />
      </animated.div>

      {/* Particle burst effect */}
      {popped && particles.map((props, i) => (
        <animated.div
          key={i}
          className={`absolute ${color} rounded-full`}
          style={{
            width: size / 8,
            height: size / 8,
            opacity: props.opacity,
            transform: props.x.to((x, y) => `translate(${x}px, ${y}px)`),
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(Bubble);