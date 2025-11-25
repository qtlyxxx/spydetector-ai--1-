export enum Role {
  CIVILIAN = '平民',
  SPY = '卧底',
  BLANK = '白板'
}

export enum GamePhase {
  SETUP = 'SETUP',
  REVEAL = 'REVEAL',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Player {
  id: number;
  role: Role;
  word: string;
  isAlive: boolean;
  avatar: string; // Emoji
}

export interface WordPair {
  id: string;
  civilian: string;
  spy: string;
  category?: string;
}

export interface GameSettings {
  totalPlayers: number;
  spyCount: number;
  hasBlank: boolean;
  selectedWordPair: WordPair | null;
}

export enum RevealStep {
  WAITING = 'WAITING', // "Pass to Player X"
  SHOWING = 'SHOWING', // "Your word is..."
}