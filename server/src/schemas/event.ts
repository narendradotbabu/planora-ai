import { z } from 'zod';

export const EventTypeEnum = z.enum(['wedding', 'birthday', 'community']);

export const EventBasicsSchema = z.object({
  eventType: EventTypeEnum,
  eventName: z.string().min(1, 'Event name is required').max(200),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().max(500).default(''),
  guestCount: z.number().int().min(1).max(100000),
});

export const BudgetPrioritiesSchema = z.object({
  totalBudget: z.number().min(0),
  currency: z.string().default('INR'),
  spendingPriorities: z.array(z.string()).default([]),
  budgetType: z.enum(['flexible', 'fixed']).default('flexible'),
  bufferPercentage: z.number().min(0).max(50).default(10),
});

export const PreferencesSchema = z.object({
  theme: z.string().default(''),
  venueType: z.enum(['indoor', 'outdoor', 'both']).default('both'),
  foodPreferences: z.array(z.string()).default([]),
  culturalPreferences: z.string().default(''),
  accessibilityRequirements: z.string().default(''),
  specialRequests: z.string().default(''),
});

export const ConstraintsSchema = z.object({
  existingBookings: z.array(z.string()).default([]),
  availableHelpers: z.number().int().min(0).default(0),
  preferredVendors: z.array(z.string()).default([]),
  importantDeadlines: z.array(z.string()).default([]),
  otherConstraints: z.string().default(''),
});

export const EventContextSchema = z.object({
  basics: EventBasicsSchema,
  budget: BudgetPrioritiesSchema,
  preferences: PreferencesSchema,
  constraints: ConstraintsSchema,
});

export const IdeaRequestSchema = z.object({
  eventContext: EventContextSchema,
  category: z.string().optional(),
  preference: z.enum([
    'affordable', 'elegant', 'traditional', 'modern', 'eco-friendly', 'family-friendly'
  ]).optional(),
});

export const BudgetRecommendationRequestSchema = z.object({
  eventContext: EventContextSchema,
  currentAllocations: z.record(z.string(), z.number()).optional(),
});

export type EventType = z.infer<typeof EventTypeEnum>;
export type EventBasics = z.infer<typeof EventBasicsSchema>;
export type BudgetPriorities = z.infer<typeof BudgetPrioritiesSchema>;
export type Preferences = z.infer<typeof PreferencesSchema>;
export type Constraints = z.infer<typeof ConstraintsSchema>;
export type EventContext = z.infer<typeof EventContextSchema>;
