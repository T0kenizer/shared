import { GameMode } from '@/types/games.types';

export enum Plan {
  Anonymous = 'ANONYMOUS',
  Free = 'FREE',
  Premium = 'PREMIUM',
}

export enum Feature {
  JoinGame = 'JOIN_GAME',
  CreateGame = 'CREATE_GAME',
}

export interface FeatureMetadataMap {
  [Feature.JoinGame]: {
    access: boolean;
  };
  [Feature.CreateGame]: {
    access: boolean;
    /**
     * The modes this plan may open a table in. Choosing the game is the first
     * thing a host does, so what a plan buys is expressed here in the same
     * terms — a list of games, not a permission to "use templates".
     */
    modes: GameMode[];
    /**
     * Whether the host may change the mode's parameters (the blinds, the ante,
     * the betting structure) instead of opening on its defaults. Never a
     * permission to invent rules: the rules belong to the mode.
     */
    canCustomizeRules: boolean;
    maxSeats: number;
  };
}
