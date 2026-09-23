import { GameSessionStatus } from '@/types/games.types';

export const JOIN_CODE_REGEX = /^\d{6}$/;

export const PLAYER_TOKEN_HEADER = 'X-Player-Token';

export const TERMINAL_GAME_STATUSES = [
  GameSessionStatus.Finished,
  GameSessionStatus.Abandoned,
] as const;
