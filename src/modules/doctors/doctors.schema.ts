import { z } from 'zod';

export const doctorListQuery = z.object({
  search: z.string().trim().max(100).optional(),
  specialty: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type DoctorListQuery = z.infer<typeof doctorListQuery>;
