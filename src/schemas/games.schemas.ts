import {
  AmountForm,
  BettingStructure,
  ChipModel,
  Direction,
  EndResolution,
  GameMode,
  GameSessionStatus,
  HandEndReason,
  HandEventType,
  HandStatus,
  ParticipantRole,
  ParticipantStatus,
  PayoutMode,
  PokerAction,
  PotMode,
  RoundStatus,
  Street,
  TurnRegime,
} from '@/types/games.types';
import {
  JOIN_CODE_REGEX,
  MAX_SEATS,
  MIN_SEATS,
} from '@constants/games.constants';
import { z } from 'zod';

/** Poker Rule Schemas */

export const blindsSchema = z
  .object({
    small: z
      .number()
      .int()
      .positive()
      .describe('The small blind, posted by the seat left of the button'),
    big: z
      .number()
      .int()
      .positive()
      .describe('The big blind, posted by the seat after the small blind'),
  })
  .refine((blinds) => blinds.big >= blinds.small, {
    message: 'The big blind cannot be smaller than the small blind',
    path: ['big'],
  });

export const pokerRulesSchema = z.object({
  blinds: blindsSchema,
  ante: z
    .number()
    .int()
    .nonnegative()
    .describe('Posted by every seat before the blinds; 0 for no ante'),
  bettingStructure: z
    .enum(BettingStructure)
    .describe('What caps a bet or a raise'),
  chipModel: z.enum(ChipModel).describe('How stacks are drawn at the table'),
});

/** Seating Schemas */

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
    .describe('Starting stack for this seat; omit to use the table default'),
});

export const seatingPolicySchema = z.object({
  seats: z
    .array(seatDeclarationSchema)
    .min(MIN_SEATS)
    .max(MAX_SEATS)
    .describe('The seats the session opens with (host seat included)'),
  defaultInitialBalance: z
    .number()
    .int()
    .positive()
    .describe('The starting stack of a seat that does not set its own'),
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
        "claimed. Still capped by the owner's plan, and only between hands: " +
        'a seat added mid-hand would join a rotation already under way',
    ),
});

/** Free Mode Rule Schemas */

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
      'Interruption window in milliseconds; null when the regime never ' +
        'auto-closes it',
    ),
});

/** Placeholder — conditions are unused (MANUAL_HOST always empty). */
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

/** Game Config Schemas */

export const pokerGameConfigSchema = z.object({
  mode: z.literal(GameMode.Poker),
  seating: seatingPolicySchema,
  rules: pokerRulesSchema,
});

export const freeGameConfigSchema = z.object({
  mode: z.literal(GameMode.Free),
  seating: seatingPolicySchema,
  economy: economyPolicySchema,
  actionCatalog: z
    .array(actionDefSchema)
    .min(1)
    .describe('The actions available during a round'),
  turnPolicy: turnPolicySchema,
  endPolicy: endPolicySchema,
});

export const gameConfigSchema = z.discriminatedUnion('mode', [
  pokerGameConfigSchema,
  freeGameConfigSchema,
]);

export const gameModeDescriptorSchema = z.object({
  mode: z.enum(GameMode).describe('The mode this descriptor stands for'),
  name: z.string().min(1).describe('Display name of the mode'),
  description: z.string().min(1).describe('How the mode plays, in a line'),
  experimental: z
    .boolean()
    .describe(
      'Whether the mode is still an experiment. Said out loud rather than ' +
        'implied by where it sits in the list: a host picking it should know ' +
        'the rules are theirs to get right and that it may change under them.',
    ),
  defaults: gameConfigSchema.describe('The table this mode opens with'),
});

export const listGameModesResponseSchema = z.array(gameModeDescriptorSchema);

/** Game Snapshot Schemas */

export const tableStakesSchema = z.object({
  blinds: blindsSchema,
  ante: z.number().int().nonnegative(),
  bettingStructure: z.enum(BettingStructure),
});

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
  balance: z.number().int().describe('The stack in front of the seat'),
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
  amount: z.number().int().nonnegative().describe('The chips in the pot'),
  eligibleParticipants: z
    .array(z.uuid())
    .describe(
      'The seats that paid into this pot and may still take it. A side pot ' +
        'exists precisely because somebody could not match the betting, so ' +
        'this is shorter than the contender list, never equal to it by chance.',
    ),
  isSidePot: z
    .boolean()
    .describe('Whether this pot was split off by an all-in'),
});

export const legalActionSchema = z.object({
  action: z.enum(PokerAction).describe('The move'),
  label: z.string().min(1).describe('What to call it on a button'),
  min: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Smallest total this seat may commit on this street'),
  max: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('Largest total this seat may commit on this street'),
});

export const bettingSnapshotSchema = z.object({
  activeParticipant: z
    .uuid()
    .nullable()
    .describe('The seat that owes an action; null once the street is closed'),
  currentBet: z
    .number()
    .int()
    .nonnegative()
    .describe('The total each seat must have committed on this street to stay'),
  minRaiseTo: z
    .number()
    .int()
    .nonnegative()
    .describe('The smallest legal raise, as a total for this street'),
  committed: z
    .record(z.uuid(), z.number().int().nonnegative())
    .describe('What each seat has committed on this street so far'),
  legalActions: z
    .array(legalActionSchema)
    .describe('What the active seat may do; empty when it is nobody’s turn'),
});

export const handEventSchema = z.object({
  id: z.uuid().describe('The runtime identifier of the event'),
  participantId: z
    .uuid()
    .nullable()
    .describe('Who acted; null for an event the table itself produced'),
  type: z.enum(HandEventType).describe('What happened'),
  amount: z
    .number()
    .int()
    .optional()
    .describe('Chips committed, for the events that move any'),
  street: z.enum(Street).describe('The street it happened on'),
  timestamp: z.iso.datetime().describe('When it happened'),
});

export const handSnapshotSchema = z.object({
  id: z.uuid().describe('The runtime identifier of the hand'),
  handNumber: z
    .number()
    .int()
    .positive()
    .describe('Which hand of the session this is, from 1'),
  status: z.enum(HandStatus).describe('The status of the hand'),
  street: z.enum(Street).describe('The betting round currently open'),
  dealerParticipant: z.uuid().describe('The seat holding the button'),
  smallBlindParticipant: z
    .uuid()
    .describe('The seat that posted the small blind'),
  bigBlindParticipant: z.uuid().describe('The seat that posted the big blind'),
  pots: z
    .array(potSnapshotSchema)
    .describe('The main pot, then any side pots, in the order they formed'),
  betting: bettingSnapshotSchema,
  events: z
    .array(handEventSchema)
    .describe('Everything that happened, in order'),
});

/** Free Mode Snapshot Schemas */

export const actionSnapshotSchema = z.object({
  id: z.uuid().describe('The runtime identifier of the action'),
  participantId: z.uuid().describe('The participant who acted'),
  definitionId: z.string().describe('The action definition that was applied'),
  amount: z.number().int().optional().describe('The amount of the action'),
  timestamp: z.iso.datetime().describe('When it happened'),
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

export const joinCodeSchema = z
  .string()
  .regex(JOIN_CODE_REGEX, 'The join code is 6 digits');

const gameSnapshotBaseSchema = z.object({
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
  dealsPlayed: z
    .number()
    .int()
    .nonnegative()
    .describe(
      'How many deals the table has got through — hands at a poker table, ' +
        'rounds at a free one. Counted server-side because the clients only ' +
        'ever see the deal in front of them: it is the one number the recap ' +
        'at the end cannot work out from the final standings.',
    ),
  chipModel: z
    .enum(ChipModel)
    .describe(
      'How the stacks in this snapshot are meant to be read: an abstract ' +
        'running total, or chips with distinct denominations. Carried on the ' +
        'snapshot because it changes how every stack at the table is drawn',
    ),
  canAddSeat: z
    .boolean()
    .describe(
      'Whether a further seat may be opened right now — which is to say ' +
        'whether somebody turning up at a full table may pull up a chair. ' +
        'Answered server-side because it depends on four things a client ' +
        "cannot see: the session's seating config, the owner's plan cap, " +
        'whether every existing seat is already claimed, and whether a deal ' +
        'is under way. It is read by whoever is joining, not by the host: a ' +
        'chair is pulled up by the person about to sit in it.',
    ),
});

export const pokerGameSnapshotSchema = gameSnapshotBaseSchema.extend({
  mode: z.literal(GameMode.Poker),
  currentHand: handSnapshotSchema
    .nullable()
    .describe('The hand in progress, if any'),
  stakes: tableStakesSchema.describe(
    'What the table plays for. Public by nature, unlike the rest of the config',
  ),
});

export const freeGameSnapshotSchema = gameSnapshotBaseSchema.extend({
  mode: z.literal(GameMode.Free),
  currentRound: roundSnapshotSchema
    .nullable()
    .describe('The round in progress, if any'),
});

export const gameSnapshotSchema = z.discriminatedUnion('mode', [
  pokerGameSnapshotSchema,
  freeGameSnapshotSchema,
]);

export const handPayoutSchema = z.object({
  participantId: z.uuid().describe('The seat paid'),
  amount: z.number().int().positive().describe('The chips it took'),
});

export const handResolutionSchema = z.object({
  mode: z.literal(GameMode.Poker),
  handId: z.uuid().describe('The hand that settled'),
  reason: z.enum(HandEndReason).describe('Why the hand settled'),
  winners: z.array(z.uuid()).describe('The seats awarded a pot'),
  payouts: z
    .array(handPayoutSchema)
    .describe('What each winner actually took, side pots included'),
});

export const roundResolutionSchema = z.object({
  mode: z.literal(GameMode.Free),
  roundId: z.uuid().describe('The round that settled'),
  reason: z
    .enum(['LAST_PLAYER_STANDING', 'MANUAL_HOST'])
    .describe('Why the round settled'),
  winners: z.array(z.uuid()).describe('The participants awarded the pot'),
});

export const gameResolutionSchema = z.discriminatedUnion('mode', [
  handResolutionSchema,
  roundResolutionSchema,
]);

/** Create Game Session Schemas */

export const createGameSessionDataSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(60)
      .describe(
        'The display name of the game. Required: a table always has a name, ' +
          "and the one to fall back on is the creating client's to pick — the " +
          'API does not invent one behind its back',
      ),
    mode: z
      .enum(GameMode)
      .describe('The game to play. Every table starts from a mode'),
    config: gameConfigSchema
      .optional()
      .describe(
        "A full config for that mode; omit to open on the mode's defaults. " +
          'Mutually exclusive with seats (a config already carries its own).',
      ),
    seats: z
      .array(seatDeclarationSchema)
      .min(MIN_SEATS)
      .max(MAX_SEATS)
      .optional()
      .describe(
        "Seats to open with instead of the mode's defaults; mutually " +
          'exclusive with config',
      ),
  })
  .refine((data) => !(data.config && data.seats), {
    message: 'seats is not allowed together with config',
    path: ['seats'],
  })
  .refine((data) => !data.config || data.config.mode === data.mode, {
    message: 'The config must be for the chosen mode',
    path: ['config'],
  });

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

export const attachSocketResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  participantId: z.uuid(),
});

/** Join By Code Schemas */

export const joinByCodeDataSchema = z.object({
  code: joinCodeSchema.describe('The 6-digit code dictated by the host'),
});

export const joinByCodeResponseSchema = z.object({
  gameUuid: z.uuid().describe('The session the code resolves to'),
});

/** Public Room View Schemas */

export const publicRoomViewSchema = z.object({
  name: z.string().describe('The display name of the game'),
  mode: z.enum(GameMode).describe('The game being played'),
  status: z.enum(GameSessionStatus).describe('The status of the game session'),
  playerCount: z
    .number()
    .int()
    .nonnegative()
    .describe('How many seats are currently claimed'),
  seatCount: z.number().int().nonnegative().describe('How many seats exist'),
});
export const retrieveRoomByCodeResponseSchema = publicRoomViewSchema;

export const retrieveRoomResponseSchema = publicRoomViewSchema;

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

export const claimSeatDataSchema = z
  .object({
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
    openExtraSeat: z
      .boolean()
      .optional()
      .describe(
        'Pull up a chair rather than take one: opens a further seat at a table ' +
          'where every existing one is claimed, and sits the caller in it. ' +
          'Refused unless the snapshot says `canAddSeat` — the seating config ' +
          "allows it, the owner's plan has room, and no deal is under way — and " +
          'mutually exclusive with `seatIndex`, which names a chair that ' +
          'already exists.',
      ),
  })
  .refine((data) => !(data.openExtraSeat && data.seatIndex !== undefined), {
    message: 'seatIndex is not allowed together with openExtraSeat',
    path: ['seatIndex'],
  });

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

/** Start Hand Schemas */

export const startHandResponseSchema = gameSnapshotSchema;

/** Start Round Schemas */

export const startRoundResponseSchema = gameSnapshotSchema;

/** Submit Action Schemas */

const targetParticipantSchema = z
  .uuid()
  .optional()
  .describe('Host only: the unclaimed seat to act on behalf of');

export const submitActionDataSchema = z
  .object({
    targetParticipantId: targetParticipantSchema,
    action: z.enum(PokerAction).optional().describe('Poker: the move to play'),
    definitionId: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Free mode: the action to play, as the table declared it in its catalog',
      ),
    amount: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe(
        'For a poker bet or raise: the **total** this seat will have ' +
          'committed on this street, matching the min/max of the legal ' +
          'action. For a free table: the chips this move puts in, required ' +
          'by every action whose `amountForm` is not NONE. Omit for the ' +
          'moves whose amount is not the player’s to choose.',
      ),
  })
  .refine(
    (data) => (data.action === undefined) !== (data.definitionId === undefined),
    {
      message:
        'Name the move exactly once: `action` at a poker table, ' +
        '`definitionId` at a free one',
      path: ['action'],
    },
  );

export const submitActionResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  resolution: gameResolutionSchema
    .optional()
    .describe('Present when the action settled the deal'),
});

/** Declare Winners Schemas */

export const potAwardSchema = z.object({
  potId: z.uuid().describe('The pot being awarded, as the snapshot names it'),
  winnerParticipantIds: z
    .array(z.uuid())
    .min(1)
    .describe('The seats that take it; several for a split'),
});

export const declareWinnersDataSchema = z.object({
  awards: z
    .array(potAwardSchema)
    .min(1)
    .describe('One entry per pot in the hand, each naming who takes it'),
});
export const declareWinnersResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  resolution: handResolutionSchema,
});

/** Resolve Round Schemas */

export const resolveRoundDataSchema = z.object({
  winnerParticipantIds: z
    .array(z.uuid())
    .optional()
    .describe('The seats that take the pot; several for a split'),
});
export const resolveRoundResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  resolution: roundResolutionSchema,
});

/** Close Game Session Schemas */

export const closeGameSessionResponseSchema = gameSnapshotSchema;
