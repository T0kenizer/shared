import {
  AmountForm,
  ChipModel,
  Direction,
  EndResolution,
  GameSessionStatus,
  ParticipantRole,
  ParticipantStatus,
  PayoutMode,
  PotMode,
  RoundStatus,
  TurnRegime,
} from '@/types/games.types';
import { JOIN_CODE_REGEX } from '@constants/games.constants';
import { z } from 'zod';

/** Game Config Schemas */

export const actionDefSchema = z.object({
  id: z.string().min(1).describe('The identifier of the action definition'),
  label: z.string().min(1).describe('The display label of the action'),
  amountForm: z
    .enum(AmountForm)
    .describe('How the action constrains its amount'),
  grantsInterruption: z
    .boolean()
    .describe('Whether submitting this action opens an interruption window'),
  foldsParticipant: z
    .boolean()
    .optional()
    .describe('Whether submitting this action folds the participant'),
});

export const forcedBetSchema = z.object({
  label: z.string().min(1).describe('The display label of the forced bet'),
  amount: z.number().int().positive().describe('The amount of the forced bet'),
  seatOffset: z
    .number()
    .int()
    .nonnegative()
    .describe('Position relative to seat 0 (dealer anchor)'),
});

export const economyPolicySchema = z.object({
  potMode: z.enum(PotMode).describe('How pots are formed'),
  chipModel: z.enum(ChipModel).describe('How balances are modelled'),
  forcedBets: z
    .array(forcedBetSchema)
    .describe('Forced bets applied when a round starts'),
  payoutMode: z.enum(PayoutMode).describe('How the pot is paid out'),
});

/**
 * A single declared seat: its default (pre-claim) name and starting balance.
 * The host acts on behalf of a seat until a player claims it.
 */
export const seatDeclarationSchema = z.object({
  displayName: z
    .string()
    .min(1)
    .max(60)
    .describe('The default display name, shown until the seat is claimed'),
  initialBalance: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe(
      'Starting balance for this seat; omit to use the session default',
    ),
});

/**
 * Seats are declared up front: creating a session creates one participant per
 * entry in `seats` (seat 0 is the host's), which players then claim to take
 * part — the host acts on behalf of any seat nobody has claimed yet.
 */
export const seatingPolicySchema = z.object({
  seats: z
    .array(seatDeclarationSchema)
    .min(2)
    .max(32)
    .describe('The seats the session opens with (host seat included)'),
  defaultInitialBalance: z
    .number()
    .int()
    .nonnegative()
    .describe('The starting balance of a seat that does not set its own'),
  allowMidGameClaims: z
    .boolean()
    .default(true)
    .describe(
      'Whether free seats can still be claimed once the game has started; ' +
        'reconnections of seated players are always allowed',
    ),
  allowExtraSeats: z
    .boolean()
    .default(false)
    .describe(
      'Whether the host may open further seats once every declared seat is ' +
        "claimed. Still capped by the owner's plan, and only between rounds: " +
        'a seat added mid-round would join a rotation already under way',
    ),
});

export const turnPolicySchema = z.object({
  regime: z.enum(TurnRegime).describe('How turns are taken'),
  direction: z.enum(Direction).describe('The rotation direction'),
  interruptionWindow: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe(
      'Interruption window in milliseconds; null when the regime never auto-closes it',
    ),
});

/** Placeholder — conditions are unused in v0 (MANUAL_HOST always empty). */
export const endConditionSchema = z.object({
  type: z.string().describe('The type of the end condition'),
  params: z.unknown().describe('The parameters of the end condition'),
});

export const endPolicySchema = z.object({
  resolution: z.enum(EndResolution).describe('How rounds are resolved'),
  conditions: z
    .array(endConditionSchema)
    .describe('Conditions evaluated for automatic resolution'),
});

export const gameConfigSchema = z.object({
  seating: seatingPolicySchema,
  economy: economyPolicySchema,
  actionCatalog: z
    .array(actionDefSchema)
    .min(1)
    .describe('The actions available during a round'),
  turnPolicy: turnPolicySchema,
  endPolicy: endPolicySchema,
});

export const gameTemplateSchema = z.object({
  id: z.string().min(1).describe('Stable identifier of the template'),
  name: z.string().min(1).describe('Display name of the template'),
  description: z.string().min(1).describe('What this template sets up'),
  config: gameConfigSchema.describe('The config this template opens with'),
});

export const listGameTemplatesResponseSchema = z.array(gameTemplateSchema);

/** Game Snapshot Schemas */

/**
 * One chair, fully described. Everything a client needs to draw it is answered
 * here — the name, the avatar, and whether anybody is in it — because only the
 * server can resolve any of the three: the name walks an
 * override/account/config chain, the avatar belongs to an account the client
 * cannot read, and a free seat is free in the eyes of the runtime, not of the
 * renderer. A client that invents its own answers ends up disagreeing with the
 * table it is drawing.
 */
export const participantSnapshotSchema = z.object({
  id: z.uuid().describe('The identifier of the participant (seat)'),
  role: z.enum(ParticipantRole).describe('The role of the seat'),
  displayName: z
    .string()
    .describe(
      'The name to show for the seat, claimed or not: an explicit override, ' +
        "else the claiming account's name, else the seat's declared name " +
        '("Seat 3"). Always a usable label — clients render it as-is rather ' +
        'than substituting a placeholder of their own for a free seat.',
    ),
  photoUrl: z
    .url()
    .nullable()
    .describe(
      "Absolute URL of the claiming account's avatar. Null whenever there is " +
        'no account to take one from — a free seat, or one held ' +
        'anonymously — in which case the client falls back to the same avatar ' +
        'placeholder it uses everywhere else.',
    ),
  balance: z.number().int().describe('The current balance of the participant'),
  seatIndex: z
    .number()
    .int()
    .nonnegative()
    .describe('The seat of the participant'),
  status: z.enum(ParticipantStatus).describe('The status of the participant'),
  connected: z
    .boolean()
    .describe(
      'Whether the seat holder has a live socket in the room. Derived from ' +
        'the socket rooms, not stored: a player inside their reconnection ' +
        'grace period reads as claimed but not connected.',
    ),
  claimed: z
    .boolean()
    .describe(
      'Whether a player currently holds the seat; false means the seat is ' +
        'free, and the host plays it until somebody takes it. The identity ' +
        'itself is never broadcast: a client recognises its own seat through ' +
        'the participantId carried by its player token.',
    ),
});

export const potSnapshotSchema = z.object({
  id: z.uuid().describe('The runtime identifier of the pot'),
  amount: z.number().int().nonnegative().describe('The amount in the pot'),
  eligibleParticipants: z
    .array(z.uuid())
    .describe('The participants eligible to win the pot'),
});

export const actionSnapshotSchema = z.object({
  id: z.uuid().describe('The runtime identifier of the action'),
  participantId: z.uuid().describe('The participant who acted'),
  definitionId: z.string().describe('The action definition that was applied'),
  amount: z.number().int().optional().describe('The amount of the action'),
  timestamp: z.iso.datetime().describe('When the action was applied'),
});

export const roundSnapshotSchema = z.object({
  id: z.uuid().describe('The runtime identifier of the round'),
  status: z.enum(RoundStatus).describe('The status of the round'),
  pots: z.array(potSnapshotSchema).describe('The pots of the round'),
  turn: z.object({
    activeParticipant: z.uuid().describe('The participant whose turn it is'),
    interruptionOpen: z
      .boolean()
      .describe('Whether an interruption window is open'),
    pendingClaims: z
      .number()
      .int()
      .nonnegative()
      .describe('The number of pending interruption claims'),
    legalActions: z
      .array(actionDefSchema)
      .describe('The actions currently legal for the active participant'),
  }),
  actionLog: z
    .array(actionSnapshotSchema)
    .describe('The actions applied during the round'),
});

/**
 * The 6-digit room code, readable aloud over a call. It is a lookup key only:
 * it never reaches the database, lives in Redis under a sliding TTL, and
 * resolves to the session uuid that everything else is keyed by.
 */
export const joinCodeSchema = z
  .string()
  .regex(JOIN_CODE_REGEX, 'The join code is 6 digits');

export const gameSnapshotSchema = z.object({
  id: z.uuid().describe('The unique identifier of the game session'),
  name: z.string().describe('The display name of the game session'),
  joinCode: joinCodeSchema
    .nullable()
    .describe(
      'The 6-digit code currently resolving to this room; null once it has ' +
        'expired. The room itself stays reachable by uuid.',
    ),
  status: z.enum(GameSessionStatus).describe('The status of the game session'),
  participants: z
    .array(participantSnapshotSchema)
    .describe('The participants of the game session, ordered by seat'),
  currentRound: roundSnapshotSchema
    .nullable()
    .describe('The round in progress, if any'),
  chipModel: z
    .enum(ChipModel)
    .describe(
      'How the balances in this snapshot are meant to be read: an abstract ' +
        'running total, or chips with distinct denominations. Carried on the ' +
        'snapshot because it changes how every stack at the table is drawn, ' +
        "and the rest of the config is none of a player's business",
    ),
  canAddSeat: z
    .boolean()
    .describe(
      'Whether another seat may be opened right now. Answered server-side ' +
        'because it depends on three things a client cannot see: the ' +
        "session's seating config, the owner's plan cap, and whether every " +
        'existing seat is claimed. Host-only in effect — the server refuses ' +
        'the call from anyone else regardless of this flag.',
    ),
});

export const roundResolutionSchema = z.object({
  roundId: z.uuid().describe('The round that settled'),
  reason: z
    .enum(['LAST_PLAYER_STANDING', 'MANUAL_HOST'])
    .describe('Why the round settled'),
  winners: z.array(z.uuid()).describe('The participants awarded the pot'),
});

/** Create Game Session Schemas */

export const createGameSessionDataSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(60)
      .optional()
      .describe('The display name of the game; omit for a generated one'),
    templateId: z
      .string()
      .min(1)
      .optional()
      .describe('A template to open on; mutually exclusive with config'),
    config: gameConfigSchema
      .optional()
      .describe(
        'A custom game config; mutually exclusive with templateId and seats ' +
          '(it already carries its own seating). Omit config and templateId ' +
          'both to use the server default preset.',
      ),
    seats: z
      .array(seatDeclarationSchema)
      .min(2)
      .optional()
      .describe(
        "Seats to open with instead of the template's or default preset's " +
          'own; mutually exclusive with config',
      ),
  })
  .refine((data) => !(data.templateId && data.config), {
    message: 'Provide either templateId or config, not both',
  })
  .refine((data) => !(data.config && data.seats), {
    message: 'seats is not allowed together with config',
  });
/**
 * Creating a game seats the owner in the HOST seat, so it answers exactly as a
 * join does — snapshot, token, and the seat the caller now holds.
 */
export const createGameSessionResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  token: z.string().min(1),
  participantId: z.uuid(),
});

/** Socket Attach Schemas */

export const attachSocketDataSchema = z.object({
  gameUuid: z.uuid().describe('The session the socket is binding to'),
  token: z.string().min(1).describe('The player token issued by the REST join'),
});

/**
 * The ack of an attach. It repeats the seat the token names, so a client that
 * came back from a refresh knows which chair is its own without having to
 * unpack the token itself.
 */
export const attachSocketResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  participantId: z.uuid(),
});

/** Join By Code Schemas */

export const joinByCodeDataSchema = z.object({
  code: joinCodeSchema.describe('The 6-digit code dictated by the host'),
});

/**
 * Nothing but the uuid: resolving a code hands the client the permanent
 * identifier, and every subsequent call (REST or socket) is keyed by it.
 */
export const joinByCodeResponseSchema = z.object({
  gameUuid: z.uuid().describe('The session the code resolves to'),
});

/** Public Room View Schemas */

/**
 * What a stranger holding a code may see before committing to the room: enough
 * to confirm they are about to join the right game, and nothing that belongs to
 * a player. Deliberately excludes the session uuid — resolving a code to a uuid
 * is `POST /games/join-by-code`, which is rate-limited.
 */
export const publicRoomViewSchema = z.object({
  name: z.string().describe('The display name of the game'),
  status: z.enum(GameSessionStatus).describe('The status of the game session'),
  playerCount: z
    .number()
    .int()
    .nonnegative()
    .describe('How many seats are currently claimed'),
  seatCount: z.number().int().nonnegative().describe('How many seats exist'),
});
export const retrieveRoomByCodeResponseSchema = publicRoomViewSchema;

/**
 * The same public view, reached by uuid instead of a code — the shape a client
 * that already holds the uuid (a join link, a scanned QR) needs to confirm the
 * room before committing to it. Unlike `GET /games/:uuid` it neither opens the
 * room nor exposes seats, so it is safe to call from an unauthenticated
 * screen.
 */
export const retrieveRoomResponseSchema = publicRoomViewSchema;

/**
 * The join link a QR code carries. It holds the session uuid, so scanning it
 * lands on the join screen with the code step already behind it — the code and
 * the QR are two ways to reach the same uuid, never two different rooms.
 */
export const buildGameJoinPath = (gameUuid: string): string =>
  `/game/join/${gameUuid}`;

/**
 * Content route of a room's join QR. Served like a file's content — an image
 * behind a uuid, cacheable forever — so clients point an `<img>` straight at it
 * rather than carrying bytes through JSON.
 */
export const buildGameQrUrl = (gameUuid: string): string =>
  `/games/${gameUuid}/qrcode`;

/** Retrieve Game Session Schemas */

export const retrieveGameSessionResponseSchema = gameSnapshotSchema;

/** Claim Seat Schemas */

export const playerTokenSchema = z
  .string()
  .min(1)
  .describe(
    'Signed player token binding a participant to a session. Issued on a ' +
      'successful join and replayed to reconnect or to authenticate an action.',
  );

export const claimSeatDataSchema = z.object({
  token: playerTokenSchema
    .optional()
    .describe(
      'A token issued earlier for this session; present it to reclaim the ' +
        'same seat after a refresh or a dropped connection',
    ),
  displayName: z
    .string()
    .min(1)
    .max(60)
    .optional()
    .describe(
      'Explicit display name override; omit to fall back to the account ' +
        "name (when signed in) or the seat's config default",
    ),
  seatIndex: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('The seat to claim; omit to take the first free seat'),
});

/**
 * A join hands back the token the client must keep: it is the only proof that
 * it owns its seat, and the only way back into it after a reconnection.
 */
export const claimSeatResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  token: playerTokenSchema,
  participantId: z
    .uuid()
    .describe('The seat the caller now holds, as it appears in the snapshot'),
});

/** Update Seat Schemas */

export const updateSeatDataSchema = z.object({
  displayName: z
    .string()
    .min(1)
    .max(60)
    .nullable()
    .optional()
    .describe(
      'New display name override; null clears it (falls back to the ' +
        'account/config default), omit to leave it unchanged',
    ),
});
export const updateSeatResponseSchema = gameSnapshotSchema;

/** Add Seat Schemas */

export const addSeatDataSchema = z.object({
  displayName: z
    .string()
    .min(1)
    .max(60)
    .optional()
    .describe(
      'What the new chair is called until somebody claims it; omit for the ' +
        'positional default ("Seat 7")',
    ),
  initialBalance: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe(
      "Starting stack for the new chair; omit to use the session's default. " +
        'Note this adds chips to the table that were not in play before',
    ),
});
export const addSeatResponseSchema = gameSnapshotSchema;

/** Start Round Schemas */

export const startRoundResponseSchema = gameSnapshotSchema;

/** Submit Action Schemas */

export const submitActionDataSchema = z.object({
  targetParticipantId: z
    .uuid()
    .optional()
    .describe(
      'Host only: the unclaimed seat to act on behalf of. Omit to act on ' +
        "the caller's own seat; rejected if the seat is already claimed.",
    ),
  definitionId: z.string().min(1).describe('The action definition to apply'),
  amount: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('The amount of the action, when its form requires one'),
});
export const submitActionResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  resolution: roundResolutionSchema
    .optional()
    .describe('Present when the action settled the round'),
});

/** Resolve Round Schemas */

export const resolveRoundDataSchema = z.object({
  winnerParticipantIds: z
    .array(z.uuid())
    .optional()
    .describe('The winning seats; omit to award every remaining contender'),
});
export const resolveRoundResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  resolution: roundResolutionSchema,
});

/** Close Game Session Schemas */

export const closeGameSessionResponseSchema = gameSnapshotSchema;
