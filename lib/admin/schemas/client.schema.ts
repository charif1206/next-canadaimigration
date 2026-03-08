import { z } from 'zod';

export const validateClientSchema = z.object({
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
});

export type ValidateClientFormData = z.infer<typeof validateClientSchema>;
