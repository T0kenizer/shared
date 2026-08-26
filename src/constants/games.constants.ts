/**
 * Socket.IO messages emitted by the client to drive a game room. Payloads are
 * validated server-side against the schemas in `schemas/games.schemas.ts`.
 */
export const GAME_CLIENT_MESSAGES = {
  CREATE: 'game:create',
  JOIN: 'game:join',
  UPDATE_SEAT: 'game:update_seat',
  START_ROUND: 'game:start_round',
  ACTION: 'game:action',
  RESOLVE: 'game:resolve',
  SNAPSHOT: 'game:snapshot',
  CLOSE: 'game:close',
} as const;

/** Socket.IO events broadcast by the server into a game room. */
export const GAME_SERVER_EVENTS = {
  PARTICIPANT_JOINED: 'game:participant_joined',
  PARTICIPANT_UPDATED: 'game:participant_updated',
  ROUND_STARTED: 'game:round_started',
  ACTION_APPLIED: 'game:action_applied',
  ROUND_RESOLVED: 'game:round_resolved',
  SESSION_CLOSED: 'game:session_closed',
  ERROR: 'game:error',
} as const;
