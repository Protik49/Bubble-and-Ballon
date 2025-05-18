export interface BubbleProps {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  type: 'bubble' | 'balloon';
  isSpecial?: boolean;
  points?: number;
  onPop: (id: string, x: number, y: number, points: number) => void;
}

export interface ComboMessage {
  id: string;
  x: number;
  y: number;
  text: string;
  createdAt: number;
}

export type GameState = {
  score: number;
  highScore: number;
  bubbles: BubbleProps[];
  comboMessages: ComboMessage[];
  comboCount: number;
  lastPopTime: number;
  backgroundHue: number;
  screenShake: {
    active: boolean;
    intensity: number;
  };
  timeRemaining: number;
  gameOver: boolean;
};