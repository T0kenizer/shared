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
     * The modes this plan may open a table in — and the whole of what it buys
     * about the game itself.
     *
     * There is deliberately no separate "may customize the rules" flag beside
     * it: how configurable a table is belongs to the mode, not to the plan. A
     * poker table is set up with its stakes and nothing else, because the rest
     * of poker is not a setting; a free table is nothing _but_ its settings.
     * Selling the second one and then withholding its parameters would be
     * selling an empty table.
     */
    modes: GameMode[];
    maxSeats: number;
  };
}
