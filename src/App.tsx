import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import LandingBackground from './components/LandingBackground';
import { Play, VolumeX, Volume2, XCircle } from 'lucide-react';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (muted) {
      Howler.volume(0);
    } else {
      Howler.volume(1);
    }
  }, [muted]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      {!gameStarted ? (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center px-4">
          <LandingBackground />
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-6 text-center relative z-10">
            Pop Infinity
          </h1>
          <p className="text-gray-600 text-center max-w-md mb-10 relative z-10">
            Pop bubbles and balloons as they appear! The more you pop in quick succession, the higher your combo score. Watch out - the game gets faster over time!
          </p>
          <button
            onClick={() => setGameStarted(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 px-8 rounded-full shadow-lg transform transition duration-200 hover:scale-105 relative z-10"
          >
            <Play size={20} />
            Start Game
          </button>
        </div>
      ) : (
        <>
          <Game />
          
          <div className="fixed bottom-4 right-4 flex gap-2 z-50">
            <button
              onClick={() => setGameStarted(false)}
              className="bg-white bg-opacity-20 backdrop-blur-md p-3 rounded-full shadow-md hover:bg-opacity-30 transition-all duration-200"
              aria-label="Quit game"
            >
              <XCircle size={20} />
            </button>
            <button
              onClick={() => setMuted(!muted)}
              className="bg-white bg-opacity-20 backdrop-blur-md p-3 rounded-full shadow-md hover:bg-opacity-30 transition-all duration-200"
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;