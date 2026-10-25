import { describe, it, expect } from 'vitest';
import { generatePlan, generateBudgetRecommendations, generateIdeas } from '../services/planningEngine.js';
import { getDaysRemaining } from '../services/types.js';
import type { EventContext } from '../schemas/event.js';

function makeContext(overrides: Partial<{
  eventType: 'wedding' | 'birthday' | 'community';
  guestCount: number;
  totalBudget: number;
  eventDate: string;
  priorities: string[];
  bufferPercentage: number;
}>): EventContext {
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);
  return {
    basics: {
      eventType: overrides.eventType || 'wedding',
      eventName: 'Test Event',
      eventDate: overrides.eventDate || futureDate.toISOString().split('T')[0],
      location: 'Test City',
      guestCount: overrides.guestCount || 100,
    },
    budget: {
      totalBudget: overrides.totalBudget ?? 500000,
      currency: 'INR',
      spendingPriorities: overrides.priorities || [],
      budgetType: 'flexible',
      bufferPercentage: overrides.bufferPercentage ?? 10,
    },
    preferences: {
      theme: '',
      venueType: 'both',
      foodPreferences: [],
      culturalPreferences: '',
      accessibilityRequirements: '',
      specialRequests: '',
    },
    constraints: {
      existingBookings: [],
      availableHelpers: 5,
      preferredVendors: [],
      importantDeadlines: [],
      otherConstraints: '',
    },
  };
}

describe('Budget Calculations', () => {
  it('allocations sum to total budget', () => {
    const ctx = makeContext({ totalBudget: 500000 });
    const plan = generatePlan(ctx);
    const totalAllocated = plan.budgetAllocation.reduce((sum, a) => sum + a.amount, 0);
    // Allow ±1% rounding tolerance
    expect(Math.abs(totalAllocated - 500000)).toBeLessThan(5000);
  });

  it('percentages sum to 100', () => {
    const ctx = makeContext({ totalBudget: 300000 });
    const plan = generatePlan(ctx);
    const totalPct = plan.budgetAllocation.reduce((sum, a) => sum + a.percentage, 0);
    expect(totalPct).toBe(100);
  });

  it('detects budget overflow', () => {
    const ctx = makeContext({ totalBudget: 100000 });
    const overAllocations: Record<string, number> = {
      'Venue': 50000,
      'Catering': 60000,
      'Decoration': 20000,
    };
    const rec = generateBudgetRecommendations(ctx, overAllocations);
    expect(rec.warnings.length).toBeGreaterThan(0);
    expect(rec.warnings.some(w => w.includes('exceed'))).toBe(true);
  });

  it('generates savings tips excluding priority categories', () => {
    const ctx = makeContext({ priorities: ['catering'] });
    const rec = generateBudgetRecommendations(ctx);
    const cateringTip = rec.savingsTips.find(t => t.category === 'Catering');
    expect(cateringTip).toBeUndefined();
  });

  it('handles zero budget', () => {
    const ctx = makeContext({ totalBudget: 0 });
    const plan = generatePlan(ctx);
    const totalAllocated = plan.budgetAllocation.reduce((sum, a) => sum + a.amount, 0);
    expect(totalAllocated).toBe(0);
  });
});

describe('Guest Count Impact', () => {
  it('mentions guest count in vendor checklist', () => {
    const ctx = makeContext({ guestCount: 200 });
    const plan = generatePlan(ctx);
    const venueItem = plan.vendorChecklist.find(v => v.category === 'Venue');
    expect(venueItem?.description).toContain('200');
  });

  it('guest checklist includes buffer calculation', () => {
    const ctx = makeContext({ guestCount: 150 });
    const plan = generatePlan(ctx);
    const bufferItem = plan.guestChecklist.find(c => c.includes('extra meals'));
    expect(bufferItem).toBeDefined();
    expect(bufferItem).toContain('8'); // ceil(150 * 0.05) = 8
  });
});

describe('Timeline Generation', () => {
  it('generates timeline phases for future events', () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 4);
    const ctx = makeContext({ eventDate: futureDate.toISOString().split('T')[0] });
    const plan = generatePlan(ctx);
    expect(plan.timeline.length).toBeGreaterThan(1);
    expect(plan.timeline[plan.timeline.length - 1].phase).toBe('Event Day');
  });

  it('flags past event dates', () => {
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    const ctx = makeContext({ eventDate: pastDate.toISOString().split('T')[0] });
    const plan = generatePlan(ctx);
    expect(plan.timeline[0].tasks[0].status).toBe('overdue');
    expect(plan.overview).toContain('passed');
  });

  it('no timeline tasks have dates after event date (except event day)', () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);
    const eventDateStr = futureDate.toISOString().split('T')[0];
    const ctx = makeContext({ eventDate: eventDateStr });
    const plan = generatePlan(ctx);
    for (const phase of plan.timeline) {
      if (phase.phase === 'Event Day') continue;
      for (const task of phase.tasks) {
        expect(task.dueDate <= eventDateStr).toBe(true);
      }
    }
  });
});

describe('Event Types', () => {
  it('generates different plans for different event types', () => {
    const wedding = generatePlan(makeContext({ eventType: 'wedding' }));
    const birthday = generatePlan(makeContext({ eventType: 'birthday' }));
    const community = generatePlan(makeContext({ eventType: 'community' }));

    expect(wedding.overview).toContain('wedding');
    expect(birthday.overview).toContain('birthday');
    expect(community.overview).toContain('community');

    // Different day-of schedules
    expect(wedding.dayOfSchedule.length).not.toBe(birthday.dayOfSchedule.length);
  });

  it('wedding includes clothing vendor', () => {
    const plan = generatePlan(makeContext({ eventType: 'wedding' }));
    const clothing = plan.vendorChecklist.find(v => v.category === 'Clothing & Styling');
    expect(clothing).toBeDefined();
  });

  it('community event prioritizes entertainment', () => {
    const plan = generatePlan(makeContext({ eventType: 'community' }));
    const entertainment = plan.vendorChecklist.find(v => v.category === 'Entertainment');
    expect(entertainment?.priority).toBe('essential');
  });
});

describe('Idea Generation', () => {
  it('generates ideas for all categories', () => {
    const ctx = makeContext({});
    const result = generateIdeas(ctx);
    expect(result.ideas.length).toBeGreaterThan(5);
    expect(result.source).toBe('rule-based');
  });

  it('filters by preference', () => {
    const ctx = makeContext({});
    const affordable = generateIdeas(ctx, undefined, 'affordable');
    const elegant = generateIdeas(ctx, undefined, 'elegant');
    // Different filtering should produce different results
    expect(affordable.ideas.length).not.toBe(elegant.ideas.length);
  });

  it('filters by category', () => {
    const ctx = makeContext({});
    const themes = generateIdeas(ctx, 'themes');
    expect(themes.ideas.every(i => i.category === 'Theme')).toBe(true);
  });
});

describe('Days Remaining Utility', () => {
  it('calculates positive days for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    expect(getDaysRemaining(future.toISOString().split('T')[0])).toBeGreaterThanOrEqual(29);
  });

  it('calculates negative days for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);
    expect(getDaysRemaining(past.toISOString().split('T')[0])).toBeLessThan(0);
  });
});

describe('Risk Assessment', () => {
  it('flags high weather risk for outdoor events', () => {
    const ctx = makeContext({});
    ctx.preferences.venueType = 'outdoor';
    const plan = generatePlan(ctx);
    const weatherRisk = plan.riskPlan.find(r => r.risk.includes('Weather'));
    expect(weatherRisk?.likelihood).toBe('high');
  });

  it('flags budget risk for low buffer', () => {
    const ctx = makeContext({ bufferPercentage: 2 });
    const plan = generatePlan(ctx);
    const budgetRisk = plan.riskPlan.find(r => r.risk.includes('Budget'));
    expect(budgetRisk?.likelihood).toBe('high');
  });
});
