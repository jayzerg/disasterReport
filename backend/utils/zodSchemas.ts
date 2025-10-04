import { z } from 'zod';

export const reportSchema = z.object({
  type: z.enum(['earthquake', 'storm', 'flood', 'landslide']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180)
});

export const nearReportsSchema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  radius: z.number().positive().optional()
});

export type ReportInput = z.infer<typeof reportSchema>;
export type NearReportsInput = z.infer<typeof nearReportsSchema>;