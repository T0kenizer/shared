import * as Schemas from '@schemas/games.schemas';
import { z } from 'zod';

/**
 * The game a table plays. Everything else about a session hangs off this one
 * choice: the mode decides which rules apply, which parameters the host is even
 * asked for, and how a hand is played out. There is one today; a second mode
 * adds an entry here and a config member to `gameConfigSchema`, and nothing in
 * between has to be re-litigated.
 */
export enum GameMode {
  Poker = 'POKER',
}

/** Poker Rule Enums */

/**
 * What caps a bet or a raise. The one parameter that changes how a poker table
 * actually plays, which is why it is asked rather than assumed.
 */
export enum BettingStructure {
  /** Any amount up to the whole stack. */
  NoLimit = 'NO_LIMIT',
  /** Up to the size of the pot after the call. */
  PotLimit = 'POT_LIMIT',
  /** One fixed increment: the big blind pre-flop and on the flop, double after. */
  FixedLimit = 'FIXED_LIMIT',
}

/**
 * How stacks are drawn. A display choice, not a rule — the arithmetic is the
 * same either way — but it is the one table parameter a player sees on every
 * single seat, so the host picks it.
 */
export enum ChipModel {
  AbstractBalance = 'ABSTRACT_BALANCE',
  Denominated = 'DENOMINATED',
}

/** Poker Runtime Enums */

/**
 * The four betting rounds of a hand. Tokenizer deals no cards — the deck is on
 * the physical table — so a street here is exactly what it is worth to the
 * chips: one full round of betting, and the point at which the next one opens.
 */
export enum Street {
  Preflop = 'PREFLOP',
  Flop = 'FLOP',
  Turn = 'TURN',
  River = 'RIVER',
}

/**
 * What a player may do on their turn. Never a host setting: which of these is
 * legal right now follows from the bet standing in front of them, and the
 * server is the only thing that knows it.
 */
export enum PokerAction {
  Fold = 'FOLD',
  Check = 'CHECK',
  Call = 'CALL',
  Bet = 'BET',
  Raise = 'RAISE',
  AllIn = 'ALL_IN',
}

/** Everything the hand log records, players' moves and forced posts alike. */
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
  /** A betting round closed and the next street opened. */
  StreetDealt = 'STREET_DEALT',
}

export enum HandStatus {
  /** A betting round is open; somebody owes an action. */
  Betting = 'BETTING',
  /**
   * The river was settled with more than one contender left. The chips are
   * decided, the cards are not — and the app cannot see them, so the table
   * declares who takes the pot.
   */
  Showdown = 'SHOWDOWN',
  /** Paid out. */
  Settled = 'SETTLED',
}

export enum HandEndReason {
  /** Everyone folded to one contender; the pot is uncontested. */
  Uncontested = 'UNCONTESTED',
  /** Declared at showdown by the table. */
  Showdown = 'SHOWDOWN',
}

/** Game Runtime Enums */

export enum GameSessionStatus {
  Lobby = 'LOBBY',
  Running = 'RUNNING',
  Finished = 'FINISHED',
  /** Closed by the lifecycle queue because the room emptied out. */
  Abandoned = 'ABANDONED',
}

export enum ParticipantRole {
  Host = 'HOST',
  Player = 'PLAYER',
}

export enum ParticipantStatus {
  Active = 'ACTIVE',
  Folded = 'FOLDED',
  /**
   * In the hand with nothing left to bet. Still a contender for every pot they
   * paid into, but the betting round skips them: there is nothing left to ask.
   */
  AllIn = 'ALL_IN',
  /** Out of chips, out of the game. */
  Eliminated = 'ELIMINATED',
  /** The seat exists but nobody has claimed it yet. */
  Waiting = 'WAITING',
}

/** Game Config Types */

export type Blinds = z.infer<typeof Schemas.blindsSchema>;
export type PokerRules = z.infer<typeof Schemas.pokerRulesSchema>;
export type SeatDeclaration = z.infer<typeof Schemas.seatDeclarationSchema>;
export type SeatingPolicy = z.infer<typeof Schemas.seatingPolicySchema>;
export type PokerGameConfig = z.infer<typeof Schemas.pokerGameConfigSchema>;
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
export type GameSnapshot = z.infer<typeof Schemas.gameSnapshotSchema>;
export type HandPayout = z.infer<typeof Schemas.handPayoutSchema>;
export type PotAward = z.infer<typeof Schemas.potAwardSchema>;
export type HandResolution = z.infer<typeof Schemas.handResolutionSchema>;

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

/** Add Seat Types */

export type AddSeatData = z.infer<typeof Schemas.addSeatDataSchema>;
export type AddSeatResponse = z.infer<typeof Schemas.addSeatResponseSchema>;

/** Start Hand Types */

export type StartHandResponse = z.infer<typeof Schemas.startHandResponseSchema>;

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

/** Close Game Session Types */

export type CloseGameSessionResponse = z.infer<
  typeof Schemas.closeGameSessionResponseSchema
>;
