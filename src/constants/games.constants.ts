import { GameSessionStatus } from '@/types/games.types';

export const JOIN_CODE_LENGTH = 6;
export const JOIN_CODE_REGEX = new RegExp(`^\\d{${JOIN_CODE_LENGTH}}$`);

export const PLAYER_TOKEN_HEADER = 'X-Player-Token';

export const TERMINAL_GAME_STATUSES = [
  GameSessionStatus.Finished,
  GameSessionStatus.Abandoned,
] as const;
