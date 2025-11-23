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
          Pass & Play
        </button>
        <button
          onClick={() => setGameMode(GameMode.REMOTE_LINK)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            gameMode === GameMode.REMOTE_LINK ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Par Lien
        </button>
        <button
          onClick={() => setGameMode(GameMode.AI)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            gameMode === GameMode.AI ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Vs Gemini
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors font-semibold text-sm"
        >
          Nouvelle Partie
        </button>
        <button
          onClick={onUndo}
          className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors font-semibold text-sm"
        >
          Annuler Coup
        </button>
        <button
          onClick={flipBoard}
          className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors font-semibold text-sm"
        >
          Tourner: {orientation === 'white' ? 'Blancs' : 'Noirs'}
        </button>
        
        {gameMode === GameMode.REMOTE_LINK && (
           <button
           onClick={onCopyLink}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-bold text-sm flex items-center justify-center gap-2 animate-pulse"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
           Générer Lien
         </button>
        )}
      </div>

      {gameMode === GameMode.REMOTE_LINK && (
        <div className="text-xs text-slate-400 text-center px-2">
          <span className="text-blue-400 font-bold">Mode Correspondance:</span> Jouez un coup, cliquez sur "Générer Lien", et envoyez le lien à votre ami pour qu'il voie votre coup.
        </div>
      )}
    </div>
  );
};