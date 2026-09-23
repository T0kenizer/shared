import * as Schemas from '@schemas/games.schemas';
import { z } from 'zod';

export enum GameMode {
  Poker = 'POKER',
  Free = 'FREE',
}

export enum BettingStructure {
  NoLimit = 'NO_LIMIT',
  PotLimit = 'POT_LIMIT',
  FixedLimit = 'FIXED_LIMIT',
}

export enum ChipModel {
  AbstractBalance = 'ABSTRACT_BALANCE',
  Denominated = 'DENOMINATED',
}

/** Poker Runtime Enums */

export enum Street {
  Preflop = 'PREFLOP',
  Flop = 'FLOP',
  Turn = 'TURN',
  River = 'RIVER',
}

export enum PokerAction {
  Fold = 'FOLD',
  Check = 'CHECK',
  Call = 'CALL',
  Bet = 'BET',
  Raise = 'RAISE',
  AllIn = 'ALL_IN',
}

export enum HandEventType {
  Ante = 'ANTE',
  SmallBlind = 'SMALL_BLIND',
  BigBlind = 'BIG_BLIND',
  Fold = 'FOLD',
  Check = 'CHECK',
  Call = 'CALL',
  Bet = 'BET',
  Raise = 'RAISE',
  AllIn = 'ALL_IN',
  StreetDealt = 'STREET_DEALT',
}

export enum HandStatus {
  Betting = 'BETTING',
  Showdown = 'SHOWDOWN',
  Settled = 'SETTLED',
}

export enum HandEndReason {
  Uncontested = 'UNCONTESTED',
  Showdown = 'SHOWDOWN',
}

/** Free Mode Rule Enums */

export enum PotMode {
  Single = 'SINGLE',
  MultipleSidepots = 'MULTIPLE_SIDEPOTS',
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

/** Free Mode Runtime Enums */

export enum RoundStatus {
  Init = 'INIT',
  InProgress = 'IN_PROGRESS',
  Resolved = 'RESOLVED',
}

/** Game Runtime Enums */

export enum GameSessionStatus {
  Lobby = 'LOBBY',
  Running = 'RUNNING',
  Finished = 'FINISHED',
  Abandoned = 'ABANDONED',
}

export enum ParticipantRole {
  Host = 'HOST',
  Player = 'PLAYER',
}

export enum ParticipantStatus {
  Active = 'ACTIVE',
  Folded = 'FOLDED',
  AllIn = 'ALL_IN',
  Eliminated = 'ELIMINATED',
  Waiting = 'WAITING',
}

/** Game Protocol Enums */

export enum GameClientMessage {
  Attach = 'game:attach',
  UpdateSeat = 'game:update_seat',
  StartHand = 'game:start_hand',
  StartRound = 'game:start_round',
  Action = 'game:action',
  DeclareWinners = 'game:declare_winners',
  Resolve = 'game:resolve',
  Snapshot = 'game:snapshot',
  Close = 'game:close',
}

export enum GameServerEvent {
  ParticipantJoined = 'game:participant_joined',
  ParticipantUpdated = 'game:participant_updated',
  HandStarted = 'game:hand_started',
  RoundStarted = 'game:round_started',
  ActionApplied = 'game:action_applied',
  HandSettled = 'game:hand_settled',
  RoundResolved = 'game:round_resolved',
  SessionClosed = 'game:session_closed',
  ParticipantDisconnected = 'game:participant_disconnected',
  ParticipantLeft = 'game:participant_left',
  Error = 'game:error',
}

/** Game Config Types */

export type Blinds = z.infer<typeof Schemas.blindsSchema>;
export type PokerRules = z.infer<typeof Schemas.pokerRulesSchema>;
export type SeatDeclaration = z.infer<typeof Schemas.seatDeclarationSchema>;
export type SeatingPolicy = z.infer<typeof Schemas.seatingPolicySchema>;
export type PokerGameConfig = z.infer<typeof Schemas.pokerGameConfigSchema>;
export type ActionDef = z.infer<typeof Schemas.actionDefSchema>;
export type ForcedBet = z.infer<typeof Schemas.forcedBetSchema>;
export type EconomyPolicy = z.infer<typeof Schemas.economyPolicySchema>;
export type TurnPolicy = z.infer<typeof Schemas.turnPolicySchema>;
export type EndCondition = z.infer<typeof Schemas.endConditionSchema>;
export type EndPolicy = z.infer<typeof Schemas.endPolicySchema>;
export type FreeGameConfig = z.infer<typeof Schemas.freeGameConfigSchema>;
export type GameConfig = z.infer<typeof Schemas.gameConfigSchema>;
export type GameModeDescriptor = z.infer<
  typeof Schemas.gameModeDescriptorSchema
>;
export type ListGameModesResponse = z.infer<
  typeof Schemas.listGameModesResponseSchema
>;
export type TableStakes = z.infer<typeof Schemas.tableStakesSchema>;

/** Game Snapshot Types */

export type ParticipantSnapshot = z.infer<
  typeof Schemas.participantSnapshotSchema
>;
export type PotSnapshot = z.infer<typeof Schemas.potSnapshotSchema>;
export type LegalAction = z.infer<typeof Schemas.legalActionSchema>;
export type BettingSnapshot = z.infer<typeof Schemas.bettingSnapshotSchema>;
export type HandEventSnapshot = z.infer<typeof Schemas.handEventSchema>;
export type HandSnapshot = z.infer<typeof Schemas.handSnapshotSchema>;
export type ActionSnapshot = z.infer<typeof Schemas.actionSnapshotSchema>;
export type RoundSnapshot = z.infer<typeof Schemas.roundSnapshotSchema>;
export type PokerGameSnapshot = z.infer<typeof Schemas.pokerGameSnapshotSchema>;
export type FreeGameSnapshot = z.infer<typeof Schemas.freeGameSnapshotSchema>;
export type GameSnapshot = z.infer<typeof Schemas.gameSnapshotSchema>;
export type HandPayout = z.infer<typeof Schemas.handPayoutSchema>;
export type PotAward = z.infer<typeof Schemas.potAwardSchema>;
export type HandResolution = z.infer<typeof Schemas.handResolutionSchema>;
export type RoundResolution = z.infer<typeof Schemas.roundResolutionSchema>;
export type GameResolution = z.infer<typeof Schemas.gameResolutionSchema>;

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

/** Socket Attach Types */

export type AttachSocketData = z.infer<typeof Schemas.attachSocketDataSchema>;
export type AttachSocketResponse = z.infer<
  typeof Schemas.attachSocketResponseSchema
>;

/** Join By Code Types */

export type JoinByCodeData = z.infer<typeof Schemas.joinByCodeDataSchema>;
export type JoinByCodeResponse = z.infer<
  typeof Schemas.joinByCodeResponseSchema
>;

/** Public Room View Types */

export type PublicRoomView = z.infer<typeof Schemas.publicRoomViewSchema>;
export type RetrieveRoomByCodeResponse = z.infer<
  typeof Schemas.retrieveRoomByCodeResponseSchema
>;
export type RetrieveRoomResponse = z.infer<
  typeof Schemas.retrieveRoomResponseSchema
>;

/** Claim Seat Types */

export type PlayerToken = z.infer<typeof Schemas.playerTokenSchema>;
export type ClaimSeatData = z.infer<typeof Schemas.claimSeatDataSchema>;
export type ClaimSeatResponse = z.infer<typeof Schemas.claimSeatResponseSchema>;

/** Update Seat Types */

export type UpdateSeatData = z.infer<typeof Schemas.updateSeatDataSchema>;
export type UpdateSeatResponse = z.infer<
  typeof Schemas.updateSeatResponseSchema
>;

/** Start Hand Types */

export type StartHandResponse = z.infer<typeof Schemas.startHandResponseSchema>;

/** Start Round Types */

export type StartRoundResponse = z.infer<
  typeof Schemas.startRoundResponseSchema
>;

/** Submit Action Types */

export type SubmitActionData = z.infer<typeof Schemas.submitActionDataSchema>;
export type SubmitActionResponse = z.infer<
  typeof Schemas.submitActionResponseSchema
>;

/** Declare Winners Types */

export type DeclareWinnersData = z.infer<
  typeof Schemas.declareWinnersDataSchema
>;
export type DeclareWinnersResponse = z.infer<
  typeof Schemas.declareWinnersResponseSchema
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
