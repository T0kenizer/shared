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

/** Game Snapshot Schemas */

export const buildSeatPhotoUrl = (gameUuid: string, participantId: string) =>
  `/games/${gameUuid}/participants/${participantId}/photo`;

export const participantSnapshotSchema = z.object({
  id: z.uuid().describe('The identifier of the participant (seat)'),
  role: z.enum(ParticipantRole).describe('The role of the seat'),
  displayName: z
    .string()
    .describe(
      'The name shown for the seat: an explicit override, else the ' +
        "claiming account's name, else the config default",
    ),
  photoUrl: z
    .string()
    .nullable()
    .describe(
      'URL to fetch the seat photo from (an explicit override, else the ' +
        "claiming account's avatar); null if neither is set",
    ),
  balance: z.number().int().describe('The current balance of the participant'),
  seatIndex: z
    .number()
    .int()
    .nonnegative()
    .describe('The seat of the participant'),
  status: z.enum(ParticipantStatus).describe('The status of the participant'),
  controller: z
    .string()
    .nullable()
    .describe('The external identity controlling the seat; null until claimed'),
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

/** 6-char room code, e.g. shared as an invite ("ABC123"). */
export const joinCodeSchema = z
  .string()
  .length(6)
  .transform((value) => value.toUpperCase());

export const gameSnapshotSchema = z.object({
  id: z.uuid().describe('The unique identifier of the game session'),
  joinCode: z
    .string()
    .length(6)
    .describe('The 6-character code used to join the room'),
  status: z.enum(GameSessionStatus).describe('The status of the game session'),
  participants: z
    .array(participantSnapshotSchema)
    .describe('The participants of the game session, ordered by seat'),
  currentRound: roundSnapshotSchema
    .nullable()
    .describe('The round in progress, if any'),
});

export const roundResolutionSchema = z.object({
  roundId: z.uuid().describe('The round that settled'),
  reason: z
    .enum(['LAST_PLAYER_STANDING', 'MANUAL_HOST'])
    .describe('Why the round settled'),
  winners: z.array(z.uuid()).describe('The participants awarded the pot'),
});

/** Create Game Session Schemas */

export const createGameSessionDataSchema = z.object({
  config: gameConfigSchema
    .optional()
    .describe('The game config; omit it to use the server default preset'),
});
export const createGameSessionResponseSchema = gameSnapshotSchema;

/** Retrieve Game Session Schemas */

export const retrieveGameSessionResponseSchema = gameSnapshotSchema;

/**
 * Raw image data captured live from the camera (no upload endpoint — this POC
 * carries it inline). Data-URL string, capped well under typical webcam-frame
 * JPEG sizes.
 */
export const seatPhotoSchema = z
  .string()
  .max(2_000_000)
  .regex(/^data:image\/(png|jpeg);base64,/)
  .describe('A data-URL encoded PNG/JPEG, captured live from the camera');

/** Claim Seat Schemas */

export const claimSeatDataSchema = z.object({
  externalId: z
    .string()
    .min(1)
    .describe('Authenticated user uuid or an anonymous client id'),
  displayName: z
    .string()
    .min(1)
    .max(60)
    .optional()
    .describe(
      'Explicit display name override; omit to fall back to the account ' +
        "name (if externalId is one) or the seat's config default",
    ),
  photo: seatPhotoSchema
    .optional()
    .describe(
      'Explicit seat photo override; omit to fall back to the account avatar',
    ),
  seatIndex: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('The seat to claim; omit to take the first free seat'),
});
export const claimSeatResponseSchema = gameSnapshotSchema;

/** Update Seat Schemas */

export const updateSeatDataSchema = z.object({
  externalId: z
    .string()
    .min(1)
    .describe('The external identity of the seat being updated'),
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
  photo: seatPhotoSchema
    .nullable()
    .optional()
    .describe(
      'New seat photo override; null clears it (falls back to the account ' +
        'avatar), omit to leave it unchanged',
    ),
});
export const updateSeatResponseSchema = gameSnapshotSchema;

/** Start Round Schemas */

export const startRoundResponseSchema = gameSnapshotSchema;

/** Submit Action Schemas */

export const submitActionDataSchema = z.object({
  externalId: z
    .string()
    .min(1)
    .describe('The external identity of the acting participant'),
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
  winnerExternalIds: z
    .array(z.string().min(1))
    .optional()
    .describe('The winners; omit to award every remaining contender'),
});
export const resolveRoundResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  resolution: roundResolutionSchema,
});

/** Close Game Session Schemas */

export const closeGameSessionResponseSchema = gameSnapshotSchema;
