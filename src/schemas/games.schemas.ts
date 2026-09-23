import {
  BettingStructure,
  ChipModel,
  GameMode,
  GameSessionStatus,
  HandEndReason,
  HandEventType,
  HandStatus,
  ParticipantRole,
  ParticipantStatus,
  PokerAction,
  Street,
} from '@/types/games.types';
import { JOIN_CODE_REGEX } from '@constants/games.constants';
import { z } from 'zod';

/** Poker Rule Schemas */

/**
 * The stakes. Two numbers, and they are the only forced bets poker has: the
 * seats that owe them follow from the dealer button, so there is nothing to
 * configure about _who_ pays — only how much.
 */
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

/**
 * Everything a poker table is set up with. Deliberately short: the rest of
 * poker is not a setting. Which actions are legal, who acts first, when a
 * betting round closes and how the pot is split all follow from these four
 * values and the state of play, and the server derives them hand by hand.
 */
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

/**
 * A single declared seat: its default (pre-claim) name and starting stack. The
 * host acts on behalf of a seat until a player claims it.
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
    .describe('Starting stack for this seat; omit to use the table default'),
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

/** Game Config Schemas */

/**
 * A poker table, whole. `mode` is the discriminator: it is what says which
 * rules the runtime is about to apply, and it travels with the config
 * everywhere the config goes — into the database column, out of the API, back
 * into the runtime on a re-open.
 */
export const pokerGameConfigSchema = z.object({
  mode: z.literal(GameMode.Poker),
  seating: seatingPolicySchema,
  rules: pokerRulesSchema,
});

/**
 * The config of a session, one member per game mode.
 *
 * A union rather than a bag of independent switches, because the parameters of
 * one mode mean nothing to another: there is no coherent table with a poker
 * blind and some other mode's turn timer, and a shape that can express one is a
 * shape somebody eventually creates.
 */
export const gameConfigSchema = z.discriminatedUnion('mode', [
  pokerGameConfigSchema,
]);

/** What a mode is called, and the table it opens with. */
export const gameModeDescriptorSchema = z.object({
  mode: z.enum(GameMode).describe('The mode this descriptor stands for'),
  name: z.string().min(1).describe('Display name of the mode'),
  description: z.string().min(1).describe('How the mode plays, in a line'),
  defaults: gameConfigSchema.describe('The table this mode opens with'),
});

export const listGameModesResponseSchema = z.array(gameModeDescriptorSchema);

/** Game Snapshot Schemas */

/**
 * What the table is playing for. Never a secret — the stakes are announced
 * before anybody sits down — so they ride on the snapshot, unlike the rest of
 * the config, which is the host's business alone.
 */
export const tableStakesSchema = z.object({
  blinds: blindsSchema,
  ante: z.number().int().nonnegative(),
  bettingStructure: z.enum(BettingStructure),
});

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
  /** A main pot is the one everybody in the hand paid into. */
  isSidePot: z
    .boolean()
    .describe('Whether this pot was split off by an all-in'),
});

/**
 * One move the active seat may make right now, as the server has worked it out.
 *
 * `min`/`max` are **totals for the current street**, not increments: "raise to
 * 120", not "raise by 80". Poker is bet at totals, the runtime settles at
 * totals, and the two conventions meeting in the middle of a client is how a
 * player ends up putting in twice what they meant to. A move that takes no
 * amount carries neither; a move whose amount is fixed — a call, an all-in —
 * carries them equal.
 */
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

/** The open betting round: what is owed, by whom, and what they may do. */
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

/**
 * One deal, from the blinds to the payout.
 *
 * A hand is not a betting round: it holds four of them (`street`), and the
 * betting state below is the one currently open. Keeping the two apart is what
 * lets "the betting is finished" and "the hand is finished" be different
 * answers, which in poker they nearly always are.
 */
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
  mode: z
    .enum(GameMode)
    .describe(
      'The game being played. A client reads it to know which table to draw ' +
        'and which vocabulary to speak; everything below is that mode’s.',
    ),
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
  currentHand: handSnapshotSchema
    .nullable()
    .describe('The hand in progress, if any'),
  stakes: tableStakesSchema.describe(
    'What the table plays for. Public by nature, unlike the rest of the config',
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
      'Whether another seat may be opened right now. Answered server-side ' +
        'because it depends on three things a client cannot see: the ' +
        "session's seating config, the owner's plan cap, and whether every " +
        'existing seat is claimed. Host-only in effect — the server refuses ' +
        'the call from anyone else regardless of this flag.',
    ),
});

export const handPayoutSchema = z.object({
  participantId: z.uuid().describe('The seat paid'),
  amount: z.number().int().positive().describe('The chips it took'),
});

export const handResolutionSchema = z.object({
  handId: z.uuid().describe('The hand that settled'),
  reason: z.enum(HandEndReason).describe('Why the hand settled'),
  winners: z.array(z.uuid()).describe('The seats awarded a pot'),
  payouts: z
    .array(handPayoutSchema)
    .describe('What each winner actually took, side pots included'),
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
      .min(2)
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
    .positive()
    .optional()
    .describe(
      "Starting stack for the new chair; omit to use the table's default. " +
        'Note this adds chips to the table that were not in play before',
    ),
});
export const addSeatResponseSchema = gameSnapshotSchema;

/** Start Hand Schemas */

export const startHandResponseSchema = gameSnapshotSchema;

/** Submit Action Schemas */

export const submitActionDataSchema = z.object({
  targetParticipantId: z
    .uuid()
    .optional()
    .describe(
      'Host only: the unclaimed seat to act on behalf of. Omit to act on ' +
        "the caller's own seat; rejected if the seat is already claimed.",
    ),
  action: z.enum(PokerAction).describe('The move to play'),
  amount: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe(
      'For a bet or a raise: the **total** this seat will have committed on ' +
        'this street, matching the min/max of the legal action. Omit for the ' +
        'moves whose amount is not the player’s to choose.',
    ),
});

export const submitActionResponseSchema = z.object({
  snapshot: gameSnapshotSchema,
  resolution: handResolutionSchema
    .optional()
    .describe('Present when the action settled the hand'),
});

/** Declare Winners Schemas */

export const potAwardSchema = z.object({
  potId: z.uuid().describe('The pot being awarded, as the snapshot names it'),
  winnerParticipantIds: z
    .array(z.uuid())
    .min(1)
    .describe('The seats that take it; several for a split'),
});

/**
 * The showdown, as a companion app can know it: the cards are on the physical
 * table and the app never sees them, so the winner is declared rather than
 * computed. Only reachable once the betting is finished — before that, the
 * chips are still moving.
 *
 * Declared pot by pot, because a side pot is a different contest with a
 * different field: the short stack who won the main pot never paid into the one
 * above it, and a flat list of winners has no way to say who did. Nearly every
 * hand has exactly one pot and therefore exactly one entry here.
 */
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

/** Close Game Session Schemas */

export const closeGameSessionResponseSchema = gameSnapshotSchema;
