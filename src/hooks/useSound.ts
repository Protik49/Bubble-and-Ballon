import { useRef, useEffect } from 'react';
import { Howl } from 'howler';
import { GAME_CONFIG } from '../constants/gameConfig';

export function useSound() {
  const soundsRef = useRef<{
    pop: Howl | null;
    combo: Howl | null;
  }>({
    pop: null,
    combo: null,
  });

  useEffect(() => {
    // Create sounds
    soundsRef.current.pop = new Howl({
      src: ['/sounds/pop.mp3'],
      volume: GAME_CONFIG.BUBBLE.POP_SOUND_VOLUME,
      preload: true,
      html5: true,
    });

    soundsRef.current.combo = new Howl({
      src: ['/sounds/combo.mp3'],
      volume: 0.6,
      preload: true,
      html5: true,
    });

    return () => {
      // Clean up sounds
      if (soundsRef.current.pop) {
        soundsRef.current.pop.unload();
      }
      if (soundsRef.current.combo) {
        soundsRef.current.combo.unload();
      }
    };
  }, []);

  const playPopSound = () => {
    if (soundsRef.current.pop) {
      // Clone sound to allow overlapping plays
      soundsRef.current.pop.play();
    }
  };

  const playComboSound = () => {
    if (soundsRef.current.combo) {
      soundsRef.current.combo.play();
    }
  };

  return {
    playPopSound,
    playComboSound,
  };
}