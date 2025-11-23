export enum GameMode {
  LOCAL = 'LOCAL',
  AI = 'AI',
  REMOTE_LINK = 'REMOTE_LINK' // Correspondence style via URL
}

export interface AIMoveResponse {
  bestMove: string;
  commentary: string;
}

export interface GameState {
  fen: string;
  history: string[];
  turn: 'w' | 'b';
  isGameOver: boolean;
  winner?: 'w' | 'b' | 'draw';
}