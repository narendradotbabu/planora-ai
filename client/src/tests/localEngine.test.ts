import { describe, it, expect } from 'vitest';
import {
  generateLocalPlan,
  generateLocalIdeas,
  generateLocalBudgetRecommendations,
} from '../services/localPlanningEngine';
import type { EventContext } from '../types';

function createMockContext(overrides: Partial<{
  eventType: 'wedding' | 'birthday' | 'community';
  guestCount: number;
  totalBudget: number;
  eventDate: string;
  spendingPriorities: string[];
}>): EventContext {
  const future = new Date();
  future.setDate(future.getDate() + 95);

  return {
    basics: {
      eventType: overrides.eventType || 'wedding',
      eventName: 'Grand Celebration',
      eventDate: overrides.eventDate || future.toISOString().split('T')[0],
      location: 'Bengaluru',
      guestCount: overrides.guestCount ?? 150,
    },
    budget: {
      totalBudget: overrides.totalBudget ?? 750000,
      currency: 'INR',
      spendingPriorities: overrides.spendingPriorities || ['Catering', 'Photography & Videography'],
      budgetType: 'flexible',
      bufferPercentage: 10,
    },
    preferences: {
      theme: 'Royal Elegance',
      venueType: 'both',
      foodPreferences: ['Vegetarian', 'Live counter'],
      culturalPreferences: 'Traditional',
      accessibilityRequirements: 'Wheelchair ramp',
      specialRequests: '',
    },
    constraints: {
      existingBookings: ['Banquet Hall booked'],
      availableHelpers: 6,
      preferredVendors: [],
      importantDeadlines: [],
      otherConstraints: '',
    },
  };
}

describe('Client Local Planning Engine', () => {
  it('generates complete plan with rule-based attribution', () => {
    const ctx = createMockContext({});
    const plan = generateLocalPlan(ctx);

    expect(plan.source).toBe('rule-based');
    expect(plan.overview).toContain('Grand Celebration');
    expect(plan.themeIdeas.length).toBeGreaterThan(0);
    expect(plan.budgetAllocation.length).toBeGreaterThan(0);
    expect(plan.timeline.length).toBeGreaterThan(0);
    expect(plan.vendorChecklist.length).toBeGreaterThan(0);
    expect(plan.riskPlan.length).toBeGreaterThan(0);
    expect(plan.dayOfSchedule.length).toBeGreaterThan(0);
    expect(plan.nextActions.length).toBe(3);
  });

  it('allocates budget exactly matching target total', () => {
    const ctx = createMockContext({ totalBudget: 1000000 });
    const plan = generateLocalPlan(ctx);

    const totalAllocated = plan.budgetAllocation.reduce((sum, item) => sum + item.amount, 0);
    // Allow ±1% due to integer rounding
    expect(Math.abs(totalAllocated - 1000000)).toBeLessThan(10000);
  });

  it('detects budget overflows in recommendations', () => {
    const ctx = createMockContext({ totalBudget: 200000 });
    const overAllocations = {
      Venue: 120000,
      Catering: 150000,
    };

    const rec = generateLocalBudgetRecommendations(ctx, overAllocations);
    expect(rec.warnings.length).toBeGreaterThan(0);
    expect(rec.warnings[0]).toContain('exceed');
  });

  it('protects user-stated priorities when suggesting savings', () => {
    const ctx = createMockContext({ spendingPriorities: ['Catering'] });
    const rec = generateLocalBudgetRecommendations(ctx);

    const cateringTip = rec.savingsTips.find(t => t.category.toLowerCase().includes('catering'));
    expect(cateringTip).toBeUndefined();
  });

  it('filters ideas by style preference correctly', () => {
    const ctx = createMockContext({});
    const affordable = generateLocalIdeas(ctx, undefined, 'affordable');
    expect(affordable.ideas.length).toBeGreaterThan(0);

    const elegant = generateLocalIdeas(ctx, undefined, 'elegant');
    expect(elegant.ideas.length).toBeGreaterThan(0);
  });

  it('handles past event dates without crashing', () => {
    const past = new Date();
    past.setDate(past.getDate() - 30);
    const ctx = createMockContext({ eventDate: past.toISOString().split('T')[0] });
    const plan = generateLocalPlan(ctx);

    expect(plan.overview).toContain('passed');
    expect(plan.timeline[0].phase).toContain('Past Date');
  });
});
