import { z } from 'zod';

export const createRecipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required').max(100),
  description: z.string().max(1000).optional().or(z.literal('')),
  ingredients: z.string().max(5000).optional().or(z.literal('')),
  instructions: z.string().max(10000).optional().or(z.literal('')),
  portionSizes: z.string().max(1000).optional().or(z.literal('')),
  nutritionalInfo: z.string().max(2000).optional().or(z.literal('')),
  category: z.string().max(50).optional().or(z.literal('')),
});

export const logProductionSchema = z.object({
  recipeId: z.string().uuid('Recipe ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive number'),
  weekDate: z.string().min(1, 'Week date is required'),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type LogProductionInput = z.infer<typeof logProductionSchema>;

