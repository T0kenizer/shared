import { GameSessionStatus } from '@/types/games.types';
import { TERMINAL_GAME_STATUSES } from '@constants/games.constants';

export function isGameOver(status: GameSessionStatus): boolean {
  return (TERMINAL_GAME_STATUSES as readonly GameSessionStatus[]).includes(
    status,
  );
}

export const buildGameJoinPath = (gameUuid: string): string =>
  `/game/join/${gameUuid}`;

export const buildGameQrUrl = (gameUuid: string): string =>
  `/games/${gameUuid}/qrcode`;
