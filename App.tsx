import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { GameControls } from './components/GameControls';
import { GameMode, AIMoveResponse } from './types';
import { getGeminiMove } from './services/geminiService';

// Error Boundary to prevent "Blue Screen" crashes
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("App Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Oups ! Une erreur est survenue.</h2>
          <div className="bg-slate-800 p-4 rounded-lg border border-red-500/30 max-w-lg w-full overflow-auto">
            <p className="font-mono text-sm text-red-200 mb-2">{this.state.error?.toString()}</p>
            <p className="text-xs text-slate-400">Vérifiez la console ou votre configuration API (API_KEY).</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Initial empty hash check to prevent infinite loops or bad parsing
const getInitialFen = () => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#fen=', '');
    if (hash) {
      try {
        // Validate FEN by creating a temp game
        const tempGame = new Chess(decodeURIComponent(hash));
        return tempGame.fen();
      } catch (e) {
        console.warn("Invalid FEN in URL");
      }
    }
  }
  return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
};

const ChessGame: React.FC = () => {
  const [game, setGame] = useState(new Chess(getInitialFen()));
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.LOCAL);
  const [fen, setFen] = useState(game.fen());
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [aiThinking, setAiThinking] = useState(false);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Detect if we loaded from a shared link, switch mode automatically
  useEffect(() => {
    if (window.location.hash.includes('fen=')) {
      setGameMode(GameMode.REMOTE_LINK);
      setNotification("Partie chargée ! À vous de jouer.");
      setTimeout(() => setNotification(null), 4000);
    }
  }, []);

  // AI Logic Effect
  useEffect(() => {
    const makeAiMove = async () => {
      if (gameMode === GameMode.AI && game.turn() === 'b' && !game.isGameOver()) {
        setAiThinking(true);
        
        // valid moves
        const validMoves = game.moves();
        if (validMoves.length === 0) {
          setAiThinking(false);
          return;
        }

        const response: AIMoveResponse = await getGeminiMove(game.fen(), validMoves);
        
        setAiThinking(false);
        setAiComment(response.commentary);
        
        safeMakeMove(response.bestMove);
      }
    };

    makeAiMove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, gameMode]); // Depend on FEN changes to trigger AI turn

  const safeMakeMove = (move: string | { from: string; to: string; promotion?: string }) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        setGame(gameCopy);
        setFen(gameCopy.fen());
        return true;
      }
    } catch (e) {
      console.error("Invalid move attempted", e);
    }
    return false;
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Block moves if AI is thinking
    if (gameMode === GameMode.AI && aiThinking) return false;
    
    // Attempt move
    const move = safeMakeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to queen for simplicity
    });

    return move;
  };

  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setAiComment(null);
    setAiThinking(false);
    window.location.hash = '';
    setNotification("Nouvelle partie commencée");
    setTimeout(() => setNotification(null), 2000);
  };

  const handleUndo = () => {
    const gameCopy = new Chess(game.fen());
    gameCopy.undo(); // Undo last move
    // If vs AI, undo twice to get back to user turn
    if (gameMode === GameMode.AI) {
      gameCopy.undo(); 
    }
    setGame(gameCopy);
    setFen(gameCopy.fen());
  };

  const handleCopyLink = async () => {
    const currentFen = encodeURIComponent(game.fen());
    const url = `${window.location.origin}${window.location.pathname}#fen=${currentFen}`;
    
    // Update the hash in the browser without reloading
    window.location.hash = `fen=${currentFen}`;

    try {
      await navigator.clipboard.writeText(url);
      setNotification("Lien généré et copié ! Envoyez-le à votre ami.");
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error("Failed to copy", err);
      setNotification("Lien généré dans l'URL !");
    }
  };

  const flipBoard = () => {
    setOrientation(orientation === 'white' ? 'black' : 'white');
  };

  // Determine game status
  let status = '';
  if (game.isCheckmate()) {
    status = `Échec et mat ! ${game.turn() === 'w' ? 'Les Noirs' : 'Les Blancs'} gagnent.`;
  } else if (game.isDraw()) {
    status = 'Match nul !';
  } else if (game.isCheck()) {
    status = 'Échec !';
  } else {
    status = `Trait aux ${game.turn() === 'w' ? 'Blancs' : 'Noirs'}`;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start pt-8 px-4 pb-12">
      
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-2">
          Gemini Chess
        </h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Jouez, générez un lien, et défiez vos amis.
        </p>
      </header>

      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-xl font-semibold animate-fade-in-down border border-indigo-400 whitespace-nowrap">
          {notification}
        </div>
      )}

      <div className="w-full max-w-[450px] relative">
        {/* AI Overlay */}
        {aiThinking && (
          <div className="absolute inset-0 z-10 bg-slate-900/70 flex flex-col items-center justify-center rounded-md backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-indigo-300 font-semibold animate-pulse">Gemini réfléchit...</span>
          </div>
        )}

        {/* Board */}
        <div className="aspect-square w-full shadow-2xl border-4 border-slate-700 rounded-lg overflow-hidden bg-slate-800">
          {/* @ts-ignore: Prop 'position' exists on Chessboard but types might be misaligned */}
          <Chessboard 
            position={fen} 
            onPieceDrop={onDrop}
            boardOrientation={orientation}
            customDarkSquareStyle={{ backgroundColor: '#334155' }}
            customLightSquareStyle={{ backgroundColor: '#94a3b8' }}
            animationDuration={200}
          />
        </div>

        {/* Status Bar */}
        <div className={`mt-4 p-3 rounded-lg border text-center transition-colors ${
          game.isGameOver() ? 'bg-yellow-500/20 border-yellow-500 text-yellow-200' : 
          game.isCheck() ? 'bg-red-500/20 border-red-500 text-red-200' :
          'bg-slate-800 border-slate-700 text-slate-300'
        }`}>
          <span className="font-mono font-bold text-lg">{status}</span>
        </div>

        {/* AI Commentary */}
        {gameMode === GameMode.AI && aiComment && (
          <div className="mt-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-indigo-500 rounded-full p-1 mt-1 shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a1 1 0 0 0-1 1v4.59l-3.29-3.3a1 1 0 0 0-1.42 1.42l5 5a1 1 0 0 0 1.42 0l5-5a1 1 0 0 0-1.42-1.42L13 11.59V7a1 1 0 0 0-1-1z"/></svg>
              </div>
              <div>
                <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">Analyse Gemini</h3>
                <p className="text-indigo-100 text-sm italic">"{aiComment}"</p>
              </div>
            </div>
          </div>
        )}

        <GameControls 
          gameMode={gameMode}
          setGameMode={(mode) => {
            setGameMode(mode);
            if (mode === GameMode.AI && game.turn() === 'b') {
              // Trigger AI check on next effect cycle
            }
          }}
          onReset={handleReset}
          onUndo={handleUndo}
          onCopyLink={handleCopyLink}
          orientation={orientation}
          flipBoard={flipBoard}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ChessGame />
    </ErrorBoundary>
  );
};

export default App;