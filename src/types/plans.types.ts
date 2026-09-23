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
    modes: GameMode[];
    maxSeats: number;
  };
}

export type PlanMetadata = { [F in Feature]: FeatureMetadataMap[F] };
