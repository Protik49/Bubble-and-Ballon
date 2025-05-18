import React, { useState, useReducer, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Bubble from './Bubble';
import ComboMessage from './ComboMessage';
import ScoreBoard from './ScoreBoard';
import GameBackground from './GameBackground';
import LandingBackground from './LandingBackground';
import { useSound } from '../hooks/useSound';
import { useScreenShake } from '../hooks/useScreenShake';
import { BubbleProps, GameState, ComboMessage as ComboMessageType } from '../types/game';
import { GAME_CONFIG } from '../constants/gameConfig';
import { Pause, Play, RotateCcw } from 'lucide-react';

const GAME_DURATION = 30; // 30 seconds

const getStoredHighScore = () => {
  const stored = localStorage.getItem('bubblePopHighScore');
  return stored ? parseInt(stored, 10) : 0;
};

const initialState: GameState = {
  score: 0,
  highScore: getStoredHighScore(),
  bubbles: [],
  comboMessages: [],
  comboCount: 0,
  lastPopTime: 0,
  backgroundHue: Math.floor(Math.random() * 360),
  screenShake: {
    active: false,
    intensity: GAME_CONFIG.SCREEN_SHAKE.DEFAULT_INTENSITY,
  },
  timeRemaining: GAME_DURATION,
  gameOver: false,
};

type GameAction =
  | { type: 'ADD_BUBBLE'; payload: BubbleProps }
  | { type: 'POP_BUBBLE'; payload: { id: string; x: number; y: number; points: number } }
  | { type: 'ADD_COMBO_MESSAGE'; payload: ComboMessageType }
  | { type: 'REMOVE_COMBO_MESSAGE'; payload: string }
  | { type: 'UPDATE_BACKGROUND_HUE'; payload: number }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'END_GAME' }
  | { type: 'RESET_COMBO' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_BUBBLE':
      return {
        ...state,
        bubbles: [...state.bubbles, action.payload],
      };
    case 'POP_BUBBLE':
      if (state.gameOver) return state;
      
      const now = Date.now();
      const timeSinceLastPop = now - state.lastPopTime;
      const isCombo = timeSinceLastPop < GAME_CONFIG.COMBO.TIMEOUT;
      const newComboCount = isCombo ? state.comboCount + 1 : 1;
      const newScore = state.score + action.payload.points;
      const newHighScore = Math.max(state.highScore, newScore);
      
      if (newHighScore > state.highScore) {
        localStorage.setItem('bubblePopHighScore', newHighScore.toString());
      }
      
      return {
        ...state,
        score: newScore,
        highScore: newHighScore,
        bubbles: state.bubbles.filter((bubble) => bubble.id !== action.payload.id),
        comboCount: newComboCount,
        lastPopTime: now,
      };
    case 'ADD_COMBO_MESSAGE':
      return {
        ...state,
        comboMessages: [...state.comboMessages, action.payload],
      };
    case 'REMOVE_COMBO_MESSAGE':
      return {
        ...state,
        comboMessages: state.comboMessages.filter(
          (message) => message.id !== action.payload
        ),
      };
    case 'UPDATE_BACKGROUND_HUE':
      return {
        ...state,
        backgroundHue: action.payload,
      };
    case 'UPDATE_TIME':
      const newTimeRemaining = action.payload;
      if (newTimeRemaining === 0 && !state.gameOver) {
        return {
          ...state,
          timeRemaining: 0,
          gameOver: true,
          bubbles: [], // Clear all bubbles when game ends
        };
      }
      return {
        ...state,
        timeRemaining: newTimeRemaining,
      };
    case 'END_GAME':
      return {
        ...state,
        gameOver: true,
        comboCount: 0,
        bubbles: [], // Clear all bubbles
      };
    case 'RESET_COMBO':
      return {
        ...state,
        comboCount: 0,
      };
    default:
      return state;
  }
}

const Game: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const [isPaused, setIsPaused] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const { playPopSound, playComboSound } = useSound();
  const { shakeStyle, triggerShake } = useScreenShake();
  const gameStartTime = useRef(Date.now());
  const pausedTimeRef = useRef(0);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (isPaused) return;
    
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime.current - pausedTimeRef.current) / 1000);
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      
      dispatch({ type: 'UPDATE_TIME', payload: remaining });
      
      if (remaining === 0) {
        dispatch({ type: 'END_GAME' });
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isPaused]);
  
  const createRandomBubble = useCallback(() => {
    if (gameState.gameOver) return;
    
    if (gameState.bubbles.length < GAME_CONFIG.BUBBLE.MIN_COUNT) {
      const bubblesNeeded = GAME_CONFIG.BUBBLE.MIN_COUNT - gameState.bubbles.length;
      for (let i = 0; i < bubblesNeeded; i++) {
        const size = Math.floor(
          Math.random() * (GAME_CONFIG.BUBBLE.MAX_SIZE - GAME_CONFIG.BUBBLE.MIN_SIZE) + 
          GAME_CONFIG.BUBBLE.MIN_SIZE
        );
        
        const type = Math.random() > 0.5 ? 'bubble' : 'balloon';
        const x = Math.random() * (windowSize.width - size);
        const y = type === 'balloon' ? windowSize.height + size : Math.random() * windowSize.height;
        
        const velocityX = (Math.random() * 2 - 1) * 
          (GAME_CONFIG.BUBBLE.VELOCITY.MIN + 
            Math.random() * (GAME_CONFIG.BUBBLE.VELOCITY.MAX - GAME_CONFIG.BUBBLE.VELOCITY.MIN));
        
        const velocityY = (GAME_CONFIG.BUBBLE.VELOCITY.MIN + 
          Math.random() * (GAME_CONFIG.BUBBLE.VELOCITY.MAX - GAME_CONFIG.BUBBLE.VELOCITY.MIN));
        
        const isSpecial = Math.random() < GAME_CONFIG.BUBBLE.SPECIAL_CHANCE;
        const colorArray = isSpecial ? GAME_CONFIG.BUBBLE.SPECIAL_COLORS : GAME_CONFIG.BUBBLE.COLORS;
        const colorIndex = Math.floor(Math.random() * colorArray.length);
        
        const newBubble: BubbleProps = {
          id: uuidv4(),
          x,
          y,
          size,
          type,
          color: colorArray[colorIndex],
          velocity: { x: velocityX, y: velocityY },
          isSpecial,
          points: isSpecial ? GAME_CONFIG.BUBBLE.SPECIAL_POINTS : GAME_CONFIG.BUBBLE.REGULAR_POINTS,
          onPop: handlePopBubble,
        };
        
        dispatch({ type: 'ADD_BUBBLE', payload: newBubble });
      }
    }
    
    if (gameState.bubbles.length >= GAME_CONFIG.BUBBLE.MAX_COUNT) {
      return;
    }
    
    const size = Math.floor(
      Math.random() * (GAME_CONFIG.BUBBLE.MAX_SIZE - GAME_CONFIG.BUBBLE.MIN_SIZE) + 
      GAME_CONFIG.BUBBLE.MIN_SIZE
    );
    
    const type = Math.random() > 0.5 ? 'bubble' : 'balloon';
    const x = Math.random() * (windowSize.width - size);
    const y = type === 'balloon' ? windowSize.height + size : Math.random() * windowSize.height;
    
    const velocityX = (Math.random() * 2 - 1) * 
      (GAME_CONFIG.BUBBLE.VELOCITY.MIN + 
        Math.random() * (GAME_CONFIG.BUBBLE.VELOCITY.MAX - GAME_CONFIG.BUBBLE.VELOCITY.MIN));
    
    const velocityY = (GAME_CONFIG.BUBBLE.VELOCITY.MIN + 
      Math.random() * (GAME_CONFIG.BUBBLE.VELOCITY.MAX - GAME_CONFIG.BUBBLE.VELOCITY.MIN));
    
    const isSpecial = Math.random() < GAME_CONFIG.BUBBLE.SPECIAL_CHANCE;
    const colorArray = isSpecial ? GAME_CONFIG.BUBBLE.SPECIAL_COLORS : GAME_CONFIG.BUBBLE.COLORS;
    const colorIndex = Math.floor(Math.random() * colorArray.length);
    
    const newBubble: BubbleProps = {
      id: uuidv4(),
      x,
      y,
      size,
      type,
      color: colorArray[colorIndex],
      velocity: { x: velocityX, y: velocityY },
      isSpecial,
      points: isSpecial ? GAME_CONFIG.BUBBLE.SPECIAL_POINTS : GAME_CONFIG.BUBBLE.REGULAR_POINTS,
      onPop: handlePopBubble,
    };
    
    dispatch({ type: 'ADD_BUBBLE', payload: newBubble });
  }, [gameState.bubbles.length, windowSize, gameState.gameOver]);
  
  useEffect(() => {
    if (isPaused) return;
    
    const spawnInterval = setInterval(() => {
      if (!gameState.gameOver) {
        createRandomBubble();
      }
    }, GAME_CONFIG.BUBBLE.SPAWN_INTERVAL);
    
    return () => clearInterval(spawnInterval);
  }, [createRandomBubble, gameState.gameOver, isPaused]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({
        type: 'UPDATE_BACKGROUND_HUE',
        payload: (gameState.backgroundHue + GAME_CONFIG.BACKGROUND.HUE_SHIFT_SPEED) % 360,
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState.backgroundHue]);
  
  useEffect(() => {
    if (gameState.comboCount === 0) return;
    
    const timeout = setTimeout(() => {
      dispatch({ type: 'RESET_COMBO' });
    }, GAME_CONFIG.COMBO.TIMEOUT);
    
    return () => clearTimeout(timeout);
  }, [gameState.lastPopTime, gameState.comboCount]);
  
  const handlePopBubble = (id: string, x: number, y: number, points: number) => {
    if (gameState.gameOver || isPaused) return;
    
    dispatch({ type: 'POP_BUBBLE', payload: { id, x, y, points } });
    playPopSound();
    triggerShake(GAME_CONFIG.SCREEN_SHAKE.DEFAULT_INTENSITY);
    
    const comboThreshold = GAME_CONFIG.COMBO.THRESHOLDS.find(
      threshold => threshold.count === gameState.comboCount + 1
    );
    
    if (comboThreshold) {
      const comboMessage: ComboMessageType = {
        id: uuidv4(),
        x,
        y,
        text: comboThreshold.text,
        createdAt: Date.now(),
      };
      
      dispatch({ type: 'ADD_COMBO_MESSAGE', payload: comboMessage });
      playComboSound();
      triggerShake(comboThreshold.intensity);
      
      setTimeout(() => {
        dispatch({ type: 'REMOVE_COMBO_MESSAGE', payload: comboMessage.id });
      }, GAME_CONFIG.COMBO.MESSAGE_DURATION);
    }
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      gameStartTime.current = Date.now() - (GAME_DURATION - gameState.timeRemaining) * 1000;
    } else {
      pausedTimeRef.current += Date.now() - (gameStartTime.current + (GAME_DURATION - gameState.timeRemaining) * 1000);
    }
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <GameBackground backgroundHue={gameState.backgroundHue}>
      <div className="game-container relative w-full h-full" style={shakeStyle}>
        <ScoreBoard 
          score={gameState.score}
          highScore={gameState.highScore}
          comboCount={gameState.comboCount}
          timeRemaining={gameState.timeRemaining}
          gameOver={gameState.gameOver}
        />
        
        {!gameState.gameOver && (
          <div className="fixed bottom-4 right-4 flex gap-2 z-50">
            <button
              onClick={handlePauseToggle}
              className="bg-white bg-opacity-20 backdrop-blur-md p-3 rounded-full shadow-md hover:bg-opacity-30 transition-all duration-200"
              aria-label={isPaused ? 'Resume game' : 'Pause game'}
            >
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>
            <button
              onClick={handleRestart}
              className="bg-white bg-opacity-20 backdrop-blur-md p-3 rounded-full shadow-md hover:bg-opacity-30 transition-all duration-200"
              aria-label="Restart game"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        )}
        
        {!isPaused && gameState.bubbles.map((bubble) => (
          <Bubble key={bubble.id} {...bubble} />
        ))}
        
        {gameState.comboMessages.map((message) => (
          <ComboMessage key={message.id} message={message} />
        ))}
        
        {(gameState.gameOver || isPaused) && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
            <LandingBackground />
            <div className="bg-white p-8 rounded-lg shadow-xl text-center relative z-50">
              <h2 className="text-3xl font-bold mb-4">
                {isPaused ? 'Game Paused' : "Time's Up!"}
              </h2>
              <p className="text-xl mb-2">Score: {gameState.score}</p>
              <p className="text-lg mb-4 text-indigo-600">High Score: {gameState.highScore}</p>
              {isPaused ? (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handlePauseToggle}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
                  >
                    Resume
                  </button>
                  <button
                    onClick={handleRestart}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-rose-600 hover:to-pink-600 transition-all duration-200"
                  >
                    Restart
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRestart}
                  className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
                >
                  Play Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </GameBackground>
  );
};

export default Game;