import * as Schemas from '@schemas/games.schemas';
import { z } from 'zod';

/** Game Config Enums */

export enum PotMode {
  Single = 'SINGLE',
  MultipleSidepots = 'MULTIPLE_SIDEPOTS',
}

export enum ChipModel {
  AbstractBalance = 'ABSTRACT_BALANCE',
  Denominated = 'DENOMINATED',
}

export enum PayoutMode {
  WinnerTakesAll = 'WINNER_TAKES_ALL',
  Split = 'SPLIT',
  PeerToPeer = 'PEER_TO_PEER',
}

export enum AmountForm {
  None = 'NONE',
  Free = 'FREE',
  Constrained = 'CONSTRAINED',
  Raise = 'RAISE',
}

export enum TurnRegime {
  Sequential = 'SEQUENTIAL',
  SequentialInterruptible = 'SEQUENTIAL_INTERRUPTIBLE',
  Simultaneous = 'SIMULTANEOUS',
}

export enum Direction {
  Clockwise = 'CLOCKWISE',
  CounterClockwise = 'COUNTER_CLOCKWISE',
}

export enum EndResolution {
  ManualHost = 'MANUAL_HOST',
  Automatic = 'AUTOMATIC',
}

/** Game Runtime Enums */

export enum GameSessionStatus {
  Lobby = 'LOBBY',
  Running = 'RUNNING',
  Finished = 'FINISHED',
}

export enum ParticipantRole {
  Host = 'HOST',
  Player = 'PLAYER',
}

export enum ParticipantStatus {
  Active = 'ACTIVE',
  Folded = 'FOLDED',
  Eliminated = 'ELIMINATED',
  /** The seat exists but nobody has claimed it yet. */
  Waiting = 'WAITING',
}

export enum RoundStatus {
  Init = 'INIT',
  InProgress = 'IN_PROGRESS',
  Resolved = 'RESOLVED',
}

/** Game Config Types */

export type ActionDef = z.infer<typeof Schemas.actionDefSchema>;
export type ForcedBet = z.infer<typeof Schemas.forcedBetSchema>;
export type EconomyPolicy = z.infer<typeof Schemas.economyPolicySchema>;
export type SeatingPolicy = z.infer<typeof Schemas.seatingPolicySchema>;
export type TurnPolicy = z.infer<typeof Schemas.turnPolicySchema>;
export type EndCondition = z.infer<typeof Schemas.endConditionSchema>;
export type EndPolicy = z.infer<typeof Schemas.endPolicySchema>;
export type GameConfig = z.infer<typeof Schemas.gameConfigSchema>;

/** Game Snapshot Types */

export type ParticipantSnapshot = z.infer<
  typeof Schemas.participantSnapshotSchema
>;
export type PotSnapshot = z.infer<typeof Schemas.potSnapshotSchema>;
export type ActionSnapshot = z.infer<typeof Schemas.actionSnapshotSchema>;
export type RoundSnapshot = z.infer<typeof Schemas.roundSnapshotSchema>;
export type GameSnapshot = z.infer<typeof Schemas.gameSnapshotSchema>;
export type RoundResolution = z.infer<typeof Schemas.roundResolutionSchema>;

/** Create Game Session Types */

export type CreateGameSessionData = z.infer<
  typeof Schemas.createGameSessionDataSchema
>;
export type CreateGameSessionResponse = z.infer<
  typeof Schemas.createGameSessionResponseSchema
>;

/** Retrieve Game Session Types */

export type RetrieveGameSessionResponse = z.infer<
  typeof Schemas.retrieveGameSessionResponseSchema
>;

/** Claim Seat Types */

export type ClaimSeatData = z.infer<typeof Schemas.claimSeatDataSchema>;
export type ClaimSeatResponse = z.infer<typeof Schemas.claimSeatResponseSchema>;

/** Update Seat Types */

export type UpdateSeatData = z.infer<typeof Schemas.updateSeatDataSchema>;
export type UpdateSeatResponse = z.infer<
  typeof Schemas.updateSeatResponseSchema
>;

/** Start Round Types */

export type StartRoundResponse = z.infer<
  typeof Schemas.startRoundResponseSchema
>;

/** Submit Action Types */

export type SubmitActionData = z.infer<typeof Schemas.submitActionDataSchema>;
export type SubmitActionResponse = z.infer<
  typeof Schemas.submitActionResponseSchema
>;

/** Resolve Round Types */

export type ResolveRoundData = z.infer<typeof Schemas.resolveRoundDataSchema>;
export type ResolveRoundResponse = z.infer<
  typeof Schemas.resolveRoundResponseSchema
>;

/** Close Game Session Types */

export type CloseGameSessionResponse = z.infer<
  typeof Schemas.closeGameSessionResponseSchema
>;
