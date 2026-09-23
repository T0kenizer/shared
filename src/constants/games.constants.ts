/**
 * Socket.IO messages emitted by the client to drive a game room. Payloads are
 * validated server-side against the schemas in `schemas/games.schemas.ts`.
 */
export const GAME_CLIENT_MESSAGES = {
  ATTACH: 'game:attach',
  UPDATE_SEAT: 'game:update_seat',
  ADD_SEAT: 'game:add_seat',
  /** Poker: deal the next hand. */
  START_HAND: 'game:start_hand',
  /** Free mode: open the next round. */
  START_ROUND: 'game:start_round',
  ACTION: 'game:action',
  /** Poker: settle a showdown, one award per pot. */
  DECLARE_WINNERS: 'game:declare_winners',
  /** Free mode: settle the round on the winners the table names. */
  RESOLVE: 'game:resolve',
  SNAPSHOT: 'game:snapshot',
  CLOSE: 'game:close',
} as const;

/**
 * Socket.IO events broadcast by the server into a game room.
 *
 * The lifecycle events come in pairs, one per mode, rather than one neutral
 * pair for both: a hand and a round are different objects with different
 * payloads, and an event named after neither would have every client checking
 * the snapshot's mode before it knew what it had just been told.
 */
export const GAME_SERVER_EVENTS = {
  PARTICIPANT_JOINED: 'game:participant_joined',
  PARTICIPANT_UPDATED: 'game:participant_updated',
  HAND_STARTED: 'game:hand_started',
  ROUND_STARTED: 'game:round_started',
  ACTION_APPLIED: 'game:action_applied',
  HAND_SETTLED: 'game:hand_settled',
  ROUND_RESOLVED: 'game:round_resolved',
  SESSION_CLOSED: 'game:session_closed',
  PARTICIPANT_DISCONNECTED: 'game:participant_disconnected',
  PARTICIPANT_LEFT: 'game:participant_left',
  ERROR: 'game:error',
} as const;

export const JOIN_CODE_REGEX = /^\d{6}$/;

export const PLAYER_TOKEN_HEADER = 'X-Player-Token';
