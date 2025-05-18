export const GAME_CONFIG = {
  BUBBLE: {
    MIN_SIZE: 30,
    MAX_SIZE: 80,
    SPAWN_INTERVAL: 150,
    MIN_COUNT: 10,
    MAX_COUNT: 50,
    POP_SOUND_VOLUME: 0.5,
    COLORS: [
      'bg-gradient-to-br from-pink-300 to-pink-400',
      'bg-gradient-to-br from-purple-300 to-purple-400',
      'bg-gradient-to-br from-blue-300 to-blue-400',
      'bg-gradient-to-br from-green-300 to-green-400',
      'bg-gradient-to-br from-yellow-300 to-yellow-400',
      'bg-gradient-to-br from-indigo-300 to-indigo-400',
      'bg-gradient-to-br from-teal-300 to-teal-400',
    ],
    SPECIAL_COLORS: [
      'bg-gradient-to-br from-rose-400 to-pink-600',
      'bg-gradient-to-br from-amber-400 to-orange-600',
      'bg-gradient-to-br from-emerald-400 to-green-600',
    ],
    SPECIAL_CHANCE: 0.15, // 15% chance for special bubbles
    SPECIAL_POINTS: 5,
    REGULAR_POINTS: 1,
    VELOCITY: {
      MIN: 0.5,
      MAX: 1.4,
    },
  },
  
  COMBO: {
    TIMEOUT: 1500,
    MESSAGE_DURATION: 1500,
    THRESHOLDS: [
      { count: 2, text: '×2 Combo!', intensity: 2 },
      { count: 4, text: '×3 Combo!', intensity: 3 },
      { count: 6, text: '×4 Combo!', intensity: 4 },
      { count: 8, text: '×5 Combo!', intensity: 5 },
      { count: 10, text: 'Super Combo!', intensity: 7 },
      { count: 15, text: 'Ultra Combo!', intensity: 10 },
      { count: 20, text: 'INFINITY COMBO!', intensity: 15 },
    ],
  },
  
  BACKGROUND: {
    HUE_SHIFT_SPEED: 0.05,
  },
  
  SCREEN_SHAKE: {
    DURATION: 300,
    DEFAULT_INTENSITY: 2,
  },
};