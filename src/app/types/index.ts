export interface Emote {
  name: string;
  url: string;
}

export interface LivesState {
  currentLives: number;
  maxLives: number;
}

export interface ModalState {
  helpDialogOpen: boolean;
  gameOverDialogOpen: boolean;
  winDialogOpen: boolean;
  achievementsDialogOpen: boolean;
}

export interface AutocompleteState {
  filteredItems: string[];
  selectedIndex: number;
  isVisible: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  icon: string;
  unlocked: boolean;
  channels?: string[];
}

export interface AchievementData {
  achievements: Achievement[];
  stats: {
    totalCorrectGuesses: number;
    uniqueCorrectGuesses: number;
    bestScore: number;
    totalGames: number;
    channelGuesses?: Record<string, number>;
    guessedEmotes?: Record<string, string[]>;
  };
}

export interface GameState {
  channel: string;
  emotes: Emote[];
  currentEmote: Emote | null;
  score: number;
  lives: number;
  gameActive: boolean;
  recordScore: number;
  consecutiveCorrect: number;
  isGameOver: boolean;
  isWin: boolean;
  blurLevel: number;
}

export interface UIState {
  isLoading: boolean;
  invalidChannel: boolean;
} 