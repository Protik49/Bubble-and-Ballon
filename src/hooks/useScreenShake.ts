import { useState, useEffect } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';

export function useScreenShake() {
  const [shake, setShake] = useState({
    active: false,
    intensity: GAME_CONFIG.SCREEN_SHAKE.DEFAULT_INTENSITY,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!shake.active) return;

    let startTime = Date.now();
    let animationId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / GAME_CONFIG.SCREEN_SHAKE.DURATION);
      
      if (progress < 1) {
        // Apply diminishing intensity as the shake progresses
        const currentIntensity = shake.intensity * (1 - progress);
        setShake((prev) => ({
          ...prev,
          x: (Math.random() - 0.5) * 2 * currentIntensity,
          y: (Math.random() - 0.5) * 2 * currentIntensity,
        }));
        animationId = requestAnimationFrame(animate);
      } else {
        // Reset shake when done
        setShake((prev) => ({
          ...prev,
          active: false,
          x: 0,
          y: 0,
        }));
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [shake.active, shake.intensity]);

  const triggerShake = (intensity?: number) => {
    setShake({
      active: true,
      intensity: intensity ?? GAME_CONFIG.SCREEN_SHAKE.DEFAULT_INTENSITY,
      x: 0,
      y: 0,
    });
  };

  return {
    shakeStyle: {
      transform: `translate(${shake.x}px, ${shake.y}px)`,
    },
    triggerShake,
  };
}