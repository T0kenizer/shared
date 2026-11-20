import { GameMode } from '@/types/games.types';
import { Feature, Plan } from '@/types/plans.types';
import { z } from 'zod';

export const featureMetadataSchemas = {
  [Feature.JoinGame]: z.object({
    access: z.boolean().describe('Whether the plan can join a game'),
  }),
  [Feature.CreateGame]: z.object({
    access: z.boolean().describe('Whether the plan can create a game'),
    modes: z
      .array(z.enum(GameMode))
      .describe('The game modes the plan can create'),
    maxSeats: z.number().int().describe('The most seats a table can hold'),
    maxActiveGames: z
      .preprocess(
        (value) => value ?? Infinity,
        z.number().int().nonnegative().or(z.literal(Infinity)),
      )
      .describe(
        'The most games the plan can have running at once, null when unlimited',
      ),
  }),
};

export const planMetadataSchema = z.object(featureMetadataSchemas);

export const planSchema = z.object({
  features: planMetadataSchema.describe('What the plan grants'),
});

/** List Plans Schemas */

export const listPlansResponseSchema = z.record(z.enum(Plan), planSchema);
