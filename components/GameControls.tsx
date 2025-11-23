import React from 'react';
import { GameMode } from '../types';

interface GameControlsProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  onReset: () => void;
  onUndo: () => void;
  onCopyLink: () => void;
  orientation: 'white' | 'black';
  flipBoard: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  setGameMode,
  onReset,
  onUndo,
  onCopyLink,
  orientation,
  flipBoard
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-6 p-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
      
      {/* Mode Selector */}
      <div className="flex rounded-lg bg-slate-900 p-1">
        <button
          onClick={() => setGameMode(GameMode.LOCAL)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            gameMode === GameMode.LOCAL ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Local
        </button>
        <button
          onClick={() => setGameMode(GameMode.REMOTE_LINK)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            gameMode === GameMode.REMOTE_LINK ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          En Ligne
        </button>
        <button
          onClick={() => setGameMode(GameMode.AI)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            gameMode === GameMode.AI ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Vs Gemini
        </button>
      </div>

      {/* Main Action Area */}
      {gameMode === GameMode.REMOTE_LINK ? (
        <div className="bg-slate-900/50 p-3 rounded-lg border border-blue-500/30">
          <button
            onClick={onCopyLink}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            Partager le lien de la partie
          </button>
          <p className="text-center text-xs text-blue-200 mt-2">
            Jouez votre coup, puis cliquez ici pour envoyer le lien à votre ami.
          </p>
        </div>
      ) : (
        <div className="h-2"></div> /* Spacer when not in link mode */
      )}

      {/* Secondary Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onReset}
          className="px-2 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors font-semibold text-xs"
        >
          Reset
        </button>
        <button
          onClick={onUndo}
          className="px-2 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors font-semibold text-xs"
        >
          Annuler
        </button>
        <button
          onClick={flipBoard}
          className="px-2 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors font-semibold text-xs"
        >
          {orientation === 'white' ? 'Inverser' : 'Inverser'}
        </button>
      </div>
    </div>
  );
};