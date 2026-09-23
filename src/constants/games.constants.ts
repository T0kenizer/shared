/**
 * Socket.IO messages emitted by the client to drive a game room. Payloads are
 * validated server-side against the schemas in `schemas/games.schemas.ts`.
 */
export const GAME_CLIENT_MESSAGES = {
  ATTACH: 'game:attach',
  UPDATE_SEAT: 'game:update_seat',
  ADD_SEAT: 'game:add_seat',
  START_HAND: 'game:start_hand',
  ACTION: 'game:action',
  DECLARE_WINNERS: 'game:declare_winners',
  SNAPSHOT: 'game:snapshot',
  CLOSE: 'game:close',
} as const;

/** Socket.IO events broadcast by the server into a game room. */
export const GAME_SERVER_EVENTS = {
  PARTICIPANT_JOINED: 'game:participant_joined',
  PARTICIPANT_UPDATED: 'game:participant_updated',
  HAND_STARTED: 'game:hand_started',
  ACTION_APPLIED: 'game:action_applied',
  HAND_SETTLED: 'game:hand_settled',
  SESSION_CLOSED: 'game:session_closed',
  PARTICIPANT_DISCONNECTED: 'game:participant_disconnected',
  PARTICIPANT_LEFT: 'game:participant_left',
  ERROR: 'game:error',
} as const;

export const JOIN_CODE_REGEX = /^\d{6}$/;

export const PLAYER_TOKEN_HEADER = 'X-Player-Token';
