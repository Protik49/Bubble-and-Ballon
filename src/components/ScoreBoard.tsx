import React from 'react';
import { CheckCircle as CircleCheck, Timer, Trophy } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  comboCount: number;
  timeRemaining: number;
  gameOver: boolean;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, highScore, comboCount, timeRemaining, gameOver }) => {
  return (
    <div className="fixed top-0 left-0 right-0 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-white bg-opacity-20 backdrop-blur-md z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <CircleCheck className="text-green-500 mr-2" size={20} />
          <div className="font-bold text-xl sm:text-2xl text-gray-800">{score}</div>
          <div className="ml-2 text-xs sm:text-sm text-gray-600">popped</div>
        </div>

        <div className="flex items-center">
          <Trophy className="text-yellow-500 mr-2" size={20} />
          <div className="font-bold text-xl sm:text-2xl text-gray-800">{highScore}</div>
        </div>

        <div className="flex items-center">
          <Timer className={`mr-2 ${timeRemaining <= 5 ? 'text-red-500' : 'text-orange-500'}`} size={20} />
          <div className={`font-bold text-xl sm:text-2xl ${timeRemaining <= 5 ? 'text-red-600' : 'text-gray-800'}`}>
            {timeRemaining}s
          </div>
        </div>
      </div>
      
      {comboCount > 1 && !gameOver && (
        <div className="flex items-center bg-indigo-500 px-2 sm:px-3 py-1 rounded-full text-white text-sm sm:text-base font-medium">
          <span className="mr-1">Combo:</span>
          <span className="font-bold">{comboCount}×</span>
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;