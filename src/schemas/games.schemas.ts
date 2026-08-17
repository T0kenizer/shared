import {
  AmountForm,
  ChipModel,
  Direction,
  EndResolution,
  GameSessionStatus,
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
  economy: economyPolicySchema,
  actionCatalog: z
    .array(actionDefSchema)
    .min(1)
    .describe('The actions available during a round'),
  turnPolicy: turnPolicySchema,
  endPolicy: endPolicySchema,
});

/** Game Snapshot Schemas */

export const participantSnapshotSchema = z.object({
  id: z.uuid().describe('The runtime identifier of the participant'),
  displayName: z.string().describe('The display name of the participant'),
  balance: z.number().int().describe('The current balance of the participant'),
  seatIndex: z
    .number()
    .int()
    .nonnegative()
    .describe('The seat of the participant'),
  status: z.enum(ParticipantStatus).describe('The status of the participant'),
  controller: z
    .string()
    .describe('The external identity controlling the participant'),
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

export const gameSnapshotSchema = z.object({
  id: z.uuid().describe('The unique identifier of the game session'),
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
  debugFile: z
    .string()
    .describe('Server-side debug artefact of the resolution (POC)'),
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

/** Join Game Session Schemas */

export const joinGameSessionDataSchema = z.object({
  externalId: z
    .string()
    .min(1)
    .describe('Authenticated user uuid or an anonymous client id'),
  displayName: z
    .string()
    .min(1)
    .max(60)
    .describe('The display name of the participant'),
  initialBalance: z
    .number()
    .int()
    .nonnegative()
    .default(1000)
    .describe('The starting balance of the participant'),
});
export const joinGameSessionResponseSchema = gameSnapshotSchema;

/** Start Round Schemas */

export const startRoundResponseSchema = gameSnapshotSchema;

/** Submit Action Schemas */

export const submitActionDataSchema = z.object({
  externalId: z
    .string()
    .min(1)
    .describe('The external identity of the acting participant'),
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
