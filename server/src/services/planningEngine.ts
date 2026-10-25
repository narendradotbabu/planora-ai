import type { EventContext } from '../schemas/event.js';
import type {
  PlanResult, BudgetAllocation, ThemeIdea, TimelinePhase, TimelineTask,
  VendorChecklistItem, RiskItem, ScheduleItem, IdeaResult, Idea,
  BudgetRecommendation, SavingsTip,
} from './types.js';
import { getDaysRemaining, formatCurrency } from './types.js';

// Budget allocation percentages by event type
const BUDGET_TEMPLATES: Record<string, Record<string, number>> = {
  wedding: {
    'Venue': 20, 'Catering': 25, 'Decoration': 10, 'Photography & Videography': 12,
    'Entertainment': 5, 'Invitations': 3, 'Clothing & Styling': 8,
    'Transportation': 3, 'Equipment': 2, 'Miscellaneous': 5, 'Contingency': 7,
  },
  birthday: {
    'Venue': 15, 'Catering': 30, 'Decoration': 15, 'Photography & Videography': 8,
    'Entertainment': 12, 'Invitations': 3, 'Clothing & Styling': 2,
    'Transportation': 3, 'Equipment': 3, 'Miscellaneous': 4, 'Contingency': 5,
  },
  community: {
    'Venue': 20, 'Catering': 20, 'Decoration': 8, 'Photography & Videography': 5,
    'Entertainment': 15, 'Invitations': 5, 'Clothing & Styling': 0,
    'Transportation': 5, 'Equipment': 10, 'Miscellaneous': 5, 'Contingency': 7,
  },
};

function adjustBudgetForPriorities(
  base: Record<string, number>,
  priorities: string[]
): Record<string, number> {
  const adjusted = { ...base };
  const priorityMap: Record<string, string[]> = {
    'food': ['Catering'],
    'catering': ['Catering'],
    'decoration': ['Decoration'],
    'decor': ['Decoration'],
    'photography': ['Photography & Videography'],
    'photos': ['Photography & Videography'],
    'entertainment': ['Entertainment'],
    'music': ['Entertainment'],
    'venue': ['Venue'],
    'clothing': ['Clothing & Styling'],
    'attire': ['Clothing & Styling'],
  };

  for (const priority of priorities) {
    const key = priority.toLowerCase();
    const cats = priorityMap[key];
    if (cats) {
      for (const cat of cats) {
        if (adjusted[cat] !== undefined) {
          // Boost priority category by 5%, reduce others proportionally
          const boost = 5;
          adjusted[cat] += boost;
          // Reduce from lowest priority non-contingency categories
          const reducible = Object.keys(adjusted).filter(
            k => k !== cat && k !== 'Contingency' && adjusted[k] > 2
          );
          const reduction = boost / reducible.length;
          for (const r of reducible) {
            adjusted[r] = Math.max(1, adjusted[r] - reduction);
          }
        }
      }
    }
  }

  // Normalize to 100%
  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  for (const key of Object.keys(adjusted)) {
    adjusted[key] = Math.round((adjusted[key] / total) * 100);
  }
  // Fix rounding to exactly 100
  const roundedTotal = Object.values(adjusted).reduce((a, b) => a + b, 0);
  if (roundedTotal !== 100) {
    adjusted['Contingency'] += (100 - roundedTotal);
  }

  return adjusted;
}

function generateBudgetAllocations(ctx: EventContext): BudgetAllocation[] {
  const template = BUDGET_TEMPLATES[ctx.basics.eventType] || BUDGET_TEMPLATES.birthday;
  const adjusted = adjustBudgetForPriorities(template, ctx.budget.spendingPriorities);
  const totalBudget = ctx.budget.totalBudget;

  return Object.entries(adjusted).map(([category, percentage]) => ({
    category,
    percentage,
    amount: Math.round((percentage / 100) * totalBudget),
    notes: percentage === 0 ? 'Not typically needed for this event type' : '',
  }));
}

function generateThemeIdeas(ctx: EventContext): ThemeIdea[] {
  const { eventType } = ctx.basics;
  const budget = ctx.budget.totalBudget;
  const budgetLevel = budget < 100000 ? 'budget' : budget < 500000 ? 'mid-range' : 'premium';

  const themes: Record<string, ThemeIdea[]> = {
    wedding: [
      {
        name: 'Rustic Elegance',
        description: 'Warm wooden accents, fairy lights, natural florals, and earth-tone palettes creating an intimate and charming atmosphere.',
        estimatedCost: budgetLevel === 'budget' ? 'Low to moderate' : 'Moderate',
        whyItFits: `Works well for ${ctx.basics.guestCount} guests with ${ctx.preferences.venueType} venue preference. Adapts to various budgets by using natural materials.`,
      },
      {
        name: 'Modern Minimalist',
        description: 'Clean lines, monochromatic palette with metallic accents, geometric shapes, and curated simplicity.',
        estimatedCost: 'Moderate — premium feel without excess',
        whyItFits: 'Elegant presentation that focuses budget on quality over quantity, ideal for couples who prefer understated luxury.',
      },
      {
        name: 'Traditional Grand',
        description: 'Rich fabrics, ornate decorations, floral centerpieces, and a classic color palette of gold, ivory, and deep jewel tones.',
        estimatedCost: budgetLevel === 'premium' ? 'Premium' : 'Can be adapted to budget',
        whyItFits: `Classic choice that impresses ${ctx.basics.guestCount} guests. ${ctx.preferences.culturalPreferences ? 'Accommodates cultural elements.' : ''}`,
      },
    ],
    birthday: [
      {
        name: 'Garden Party',
        description: 'Pastel colors, fresh flowers, outdoor seating areas, and a relaxed atmosphere with lawn games.',
        estimatedCost: 'Low to moderate',
        whyItFits: `Great for ${ctx.basics.guestCount} guests. Works beautifully in ${ctx.preferences.venueType} settings.`,
      },
      {
        name: 'Retro Fun',
        description: 'Nostalgic theme with vintage decorations, throwback music, classic party games, and a candy bar.',
        estimatedCost: 'Budget-friendly',
        whyItFits: 'Highly customizable and works within most budgets. Creates a memorable, fun atmosphere.',
      },
      {
        name: 'Elegant Dinner Party',
        description: 'Sophisticated setup with candlelit tables, curated menu, and ambient music for a refined celebration.',
        estimatedCost: 'Moderate to high',
        whyItFits: 'Perfect for intimate gatherings. Focuses spending on quality food and ambiance.',
      },
    ],
    community: [
      {
        name: 'Festival Style',
        description: 'Colorful stalls, stage area, food trucks or counters, activity zones, and open community spaces.',
        estimatedCost: 'Scalable to budget',
        whyItFits: `Handles ${ctx.basics.guestCount} attendees well. Multiple activity zones keep everyone engaged.`,
      },
      {
        name: 'Cultural Showcase',
        description: 'Themed areas representing different cultural elements, performances, workshops, and communal dining.',
        estimatedCost: 'Moderate — leverages community contributions',
        whyItFits: 'Encourages community participation which reduces costs. Great for building connections.',
      },
      {
        name: 'Eco-Friendly Gathering',
        description: 'Sustainable materials, local food, minimal waste setup, reusable decorations, and nature-focused activities.',
        estimatedCost: 'Budget-friendly',
        whyItFits: 'Cost-effective and environmentally responsible. Appeals to eco-conscious community members.',
      },
    ],
  };

  return themes[eventType] || themes.birthday;
}

function generateTimeline(ctx: EventContext): TimelinePhase[] {
  const daysRemaining = getDaysRemaining(ctx.basics.eventDate);
  const eventDate = new Date(ctx.basics.eventDate);
  const now = new Date();
  const phases: TimelinePhase[] = [];

  if (daysRemaining <= 0) {
    return [{
      phase: 'Event Completed / Past Date',
      startDate: now.toISOString().split('T')[0],
      endDate: ctx.basics.eventDate,
      tasks: [{
        id: 'past-1',
        task: 'This event date has passed. Consider updating the date or starting a new event.',
        dueDate: now.toISOString().split('T')[0],
        priority: 'high',
        status: 'overdue',
      }],
    }];
  }

  const makeDate = (daysFromNow: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysFromNow);
    if (d > eventDate) return ctx.basics.eventDate;
    return d.toISOString().split('T')[0];
  };

  let taskId = 1;
  const mkId = () => `task-${taskId++}`;

  if (daysRemaining > 90) {
    phases.push({
      phase: 'Early Planning (3+ months out)',
      startDate: makeDate(0),
      endDate: makeDate(Math.min(30, daysRemaining - 60)),
      tasks: [
        { id: mkId(), task: 'Finalize event vision and theme', dueDate: makeDate(7), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Set detailed budget breakdown', dueDate: makeDate(10), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Research and shortlist venues', dueDate: makeDate(14), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Begin vendor research', dueDate: makeDate(21), priority: 'medium', status: 'pending' },
        { id: mkId(), task: 'Create initial guest list', dueDate: makeDate(14), priority: 'medium', status: 'pending' },
      ],
    });
    phases.push({
      phase: 'Booking Phase (2-3 months out)',
      startDate: makeDate(Math.min(30, daysRemaining - 60)),
      endDate: makeDate(Math.min(60, daysRemaining - 30)),
      tasks: [
        { id: mkId(), task: 'Book venue', dueDate: makeDate(35), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Book key vendors (caterer, photographer)', dueDate: makeDate(42), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Order invitations or set up digital invites', dueDate: makeDate(45), priority: 'medium', status: 'pending' },
        { id: mkId(), task: 'Plan menu and dietary accommodations', dueDate: makeDate(50), priority: 'medium', status: 'pending' },
      ],
    });
  } else if (daysRemaining > 30) {
    phases.push({
      phase: 'Active Planning (1-3 months out)',
      startDate: makeDate(0),
      endDate: makeDate(Math.min(14, daysRemaining - 14)),
      tasks: [
        { id: mkId(), task: 'Finalize venue and confirm booking', dueDate: makeDate(5), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Book caterer and finalize menu', dueDate: makeDate(7), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Send invitations', dueDate: makeDate(7), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Book photographer/videographer', dueDate: makeDate(10), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Arrange entertainment', dueDate: makeDate(14), priority: 'medium', status: 'pending' },
        { id: mkId(), task: 'Plan decorations', dueDate: makeDate(14), priority: 'medium', status: 'pending' },
      ],
    });
  } else if (daysRemaining > 7) {
    phases.push({
      phase: 'Urgent Planning (Under 1 month)',
      startDate: makeDate(0),
      endDate: makeDate(Math.min(7, daysRemaining - 3)),
      tasks: [
        { id: mkId(), task: 'URGENT: Confirm or book venue immediately', dueDate: makeDate(2), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'URGENT: Arrange catering', dueDate: makeDate(3), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Send last-minute invitations', dueDate: makeDate(2), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Confirm guest count', dueDate: makeDate(5), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Purchase essential supplies', dueDate: makeDate(5), priority: 'high', status: 'pending' },
      ],
    });
  }

  // Final preparation phase
  if (daysRemaining > 3) {
    phases.push({
      phase: 'Final Preparations',
      startDate: makeDate(Math.max(0, daysRemaining - 7)),
      endDate: makeDate(daysRemaining - 1),
      tasks: [
        { id: mkId(), task: 'Confirm all vendor arrangements', dueDate: makeDate(daysRemaining - 5), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Finalize guest count and seating', dueDate: makeDate(daysRemaining - 4), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Make final payments', dueDate: makeDate(daysRemaining - 3), priority: 'high', status: 'pending' },
        { id: mkId(), task: 'Prepare day-of supplies and checklist', dueDate: makeDate(daysRemaining - 2), priority: 'medium', status: 'pending' },
        { id: mkId(), task: 'Confirm transportation and logistics', dueDate: makeDate(daysRemaining - 2), priority: 'medium', status: 'pending' },
      ],
    });
  }

  // Event day
  phases.push({
    phase: 'Event Day',
    startDate: ctx.basics.eventDate,
    endDate: ctx.basics.eventDate,
    tasks: [
      { id: mkId(), task: 'Venue setup and decoration', dueDate: ctx.basics.eventDate, priority: 'high', status: 'pending' },
      { id: mkId(), task: 'Vendor arrival confirmations', dueDate: ctx.basics.eventDate, priority: 'high', status: 'pending' },
      { id: mkId(), task: 'Final walkthrough', dueDate: ctx.basics.eventDate, priority: 'high', status: 'pending' },
      { id: mkId(), task: 'Guest reception', dueDate: ctx.basics.eventDate, priority: 'high', status: 'pending' },
      { id: mkId(), task: 'Event program execution', dueDate: ctx.basics.eventDate, priority: 'high', status: 'pending' },
      { id: mkId(), task: 'Cleanup and vendor settlement', dueDate: ctx.basics.eventDate, priority: 'medium', status: 'pending' },
    ],
  });

  return phases;
}

function generateVendorChecklist(ctx: EventContext): VendorChecklistItem[] {
  const budget = ctx.budget.totalBudget;
  const allocations = generateBudgetAllocations(ctx);
  const allocationMap = Object.fromEntries(allocations.map(a => [a.category, a.amount]));

  const items: VendorChecklistItem[] = [
    {
      category: 'Venue',
      description: `${ctx.preferences.venueType === 'outdoor' ? 'Outdoor' : ctx.preferences.venueType === 'indoor' ? 'Indoor' : 'Indoor/Outdoor'} venue for ${ctx.basics.guestCount} guests`,
      estimatedBudget: allocationMap['Venue'] || 0,
      priority: 'essential',
      selectionCriteria: ['Capacity', 'Location accessibility', 'Parking', 'Amenities', 'Cancellation policy'],
    },
    {
      category: 'Catering',
      description: `Food and beverages for ${ctx.basics.guestCount} guests${ctx.preferences.foodPreferences.length ? ` (${ctx.preferences.foodPreferences.join(', ')})` : ''}`,
      estimatedBudget: allocationMap['Catering'] || 0,
      priority: 'essential',
      selectionCriteria: ['Menu variety', 'Dietary accommodations', 'Tasting availability', 'Service style', 'Per-plate cost'],
    },
    {
      category: 'Photography & Videography',
      description: 'Event documentation and memories',
      estimatedBudget: allocationMap['Photography & Videography'] || 0,
      priority: 'recommended',
      selectionCriteria: ['Portfolio quality', 'Experience with similar events', 'Deliverables included', 'Editing timeline'],
    },
    {
      category: 'Decoration',
      description: `${ctx.preferences.theme || 'Themed'} decorations for the event space`,
      estimatedBudget: allocationMap['Decoration'] || 0,
      priority: 'recommended',
      selectionCriteria: ['Theme compatibility', 'Setup and teardown included', 'Custom vs rental options'],
    },
    {
      category: 'Entertainment',
      description: 'Music, performances, or activities',
      estimatedBudget: allocationMap['Entertainment'] || 0,
      priority: ctx.basics.eventType === 'community' ? 'essential' : 'recommended',
      selectionCriteria: ['Audience appropriateness', 'Equipment requirements', 'Duration flexibility'],
    },
  ];

  if (ctx.basics.eventType === 'wedding') {
    items.push({
      category: 'Clothing & Styling',
      description: 'Attire and grooming for the couple',
      estimatedBudget: allocationMap['Clothing & Styling'] || 0,
      priority: 'essential',
      selectionCriteria: ['Style preference', 'Fitting schedule', 'Alteration timeline'],
    });
  }

  return items;
}

function generateRiskPlan(ctx: EventContext): RiskItem[] {
  const daysRemaining = getDaysRemaining(ctx.basics.eventDate);
  const risks: RiskItem[] = [
    {
      risk: 'Weather disruption',
      likelihood: ctx.preferences.venueType === 'outdoor' ? 'high' : 'low',
      impact: 'Could require last-minute venue change or backup plan',
      mitigation: ctx.preferences.venueType === 'outdoor'
        ? 'Arrange a backup indoor venue or tent. Check weather forecasts 1 week before.'
        : 'Indoor venue minimizes weather risk. Ensure adequate climate control.',
    },
    {
      risk: 'Vendor cancellation',
      likelihood: 'low',
      impact: 'Could disrupt key event elements like catering or photography',
      mitigation: 'Keep backup vendor contacts. Include cancellation clauses in contracts. Confirm 1 week before.',
    },
    {
      risk: 'Budget overrun',
      likelihood: ctx.budget.bufferPercentage < 5 ? 'high' : 'medium',
      impact: `Current buffer: ${ctx.budget.bufferPercentage}%. May need to cut features if exceeded.`,
      mitigation: 'Track expenses weekly. Identify non-essential items that can be reduced. Keep contingency reserve.',
    },
    {
      risk: 'Guest count change',
      likelihood: 'medium',
      impact: 'Affects catering, seating, and per-person costs',
      mitigation: 'Set RSVP deadline 2 weeks before. Order 5-10% extra for food. Confirm final count with vendors.',
    },
  ];

  if (daysRemaining < 30) {
    risks.push({
      risk: 'Insufficient planning time',
      likelihood: 'high',
      impact: 'Limited vendor availability and rushed preparations',
      mitigation: 'Prioritize essentials (venue, food, core program). Delegate tasks. Consider simplified alternatives.',
    });
  }

  return risks;
}

function generateDayOfSchedule(ctx: EventContext): ScheduleItem[] {
  const schedules: Record<string, ScheduleItem[]> = {
    wedding: [
      { time: '07:00 AM', activity: 'Vendor setup begins', responsible: 'Event coordinator / Volunteers', notes: 'Verify all deliveries' },
      { time: '09:00 AM', activity: 'Decoration finalization', responsible: 'Decorator', notes: 'Check lighting and backdrop' },
      { time: '10:00 AM', activity: 'Sound and music check', responsible: 'DJ / Band', notes: 'Test microphones and playlist' },
      { time: '11:00 AM', activity: 'Couple and family preparation', responsible: 'Stylist', notes: 'Photos during preparation' },
      { time: '01:00 PM', activity: 'Guest arrival and welcome', responsible: 'Ushers', notes: 'Guide to seating areas' },
      { time: '02:00 PM', activity: 'Ceremony begins', responsible: 'Officiant', notes: 'Photography positions ready' },
      { time: '03:00 PM', activity: 'Photo session', responsible: 'Photographer', notes: 'Key group photos list' },
      { time: '04:00 PM', activity: 'Reception and dinner', responsible: 'Caterer', notes: 'Dietary requirements noted' },
      { time: '06:00 PM', activity: 'Speeches and toasts', responsible: 'MC / Host', notes: 'Microphone ready' },
      { time: '07:00 PM', activity: 'Entertainment and dancing', responsible: 'DJ / Band', notes: 'Cake cutting during this phase' },
      { time: '09:00 PM', activity: 'Event wrap-up', responsible: 'Coordinator', notes: 'Thank you announcements' },
      { time: '10:00 PM', activity: 'Cleanup and vendor settlement', responsible: 'Coordinator', notes: 'Final payments and check inventory' },
    ],
    birthday: [
      { time: '10:00 AM', activity: 'Venue setup and decoration', responsible: 'Host / Helpers', notes: 'Balloons, banners, table setup' },
      { time: '12:00 PM', activity: 'Food and cake delivery', responsible: 'Caterer / Baker', notes: 'Check order completeness' },
      { time: '01:00 PM', activity: 'Sound and entertainment setup', responsible: 'DJ / Host', notes: 'Music playlist, game supplies' },
      { time: '02:00 PM', activity: 'Guest arrival', responsible: 'Host', notes: 'Welcome and refreshments' },
      { time: '03:00 PM', activity: 'Games and activities', responsible: 'Organizer', notes: 'Age-appropriate activities' },
      { time: '04:00 PM', activity: 'Food service', responsible: 'Caterer', notes: 'Dietary preferences' },
      { time: '05:00 PM', activity: 'Cake cutting and singing', responsible: 'Host', notes: 'Photos and video' },
      { time: '05:30 PM', activity: 'Gift opening (optional)', responsible: 'Birthday person', notes: 'Thank you notes' },
      { time: '06:00 PM', activity: 'Farewell and return gifts', responsible: 'Host', notes: 'Cleanup begins' },
    ],
    community: [
      { time: '07:00 AM', activity: 'Site setup begins', responsible: 'Setup crew', notes: 'Stalls, stage, seating' },
      { time: '09:00 AM', activity: 'Vendor and stall setup', responsible: 'Vendors / Volunteers', notes: 'Power and water access' },
      { time: '10:00 AM', activity: 'Sound check and tech setup', responsible: 'Tech crew', notes: 'Stage lighting and PA system' },
      { time: '11:00 AM', activity: 'Event opens to public', responsible: 'Registration desk', notes: 'Welcome kits if applicable' },
      { time: '12:00 PM', activity: 'Opening ceremony', responsible: 'MC / Organizer', notes: 'Speeches and welcome' },
      { time: '01:00 PM', activity: 'Lunch service', responsible: 'Food stalls / Caterer', notes: 'Multiple food options' },
      { time: '02:00 PM', activity: 'Main program and activities', responsible: 'Various', notes: 'Stage events, workshops, games' },
      { time: '05:00 PM', activity: 'Closing ceremony', responsible: 'MC / Organizer', notes: 'Thank you and awards' },
      { time: '06:00 PM', activity: 'Cleanup and teardown', responsible: 'Volunteers', notes: 'Waste management and recycling' },
    ],
  };

  return schedules[ctx.basics.eventType] || schedules.birthday;
}

function generateNextActions(ctx: EventContext): string[] {
  const daysRemaining = getDaysRemaining(ctx.basics.eventDate);
  const actions: string[] = [];

  if (daysRemaining <= 0) {
    return ['Update the event date to a future date or create a new event'];
  }

  if (daysRemaining < 7) {
    actions.push('Confirm final guest count with all vendors immediately');
    actions.push('Make all outstanding payments');
    actions.push('Prepare a detailed day-of checklist with assigned responsibilities');
  } else if (daysRemaining < 30) {
    actions.push('Finalize and confirm all vendor bookings');
    actions.push('Send reminder invitations and track RSVPs');
    actions.push('Review and finalize the event schedule');
  } else {
    actions.push('Research and shortlist vendors for each category');
    actions.push('Finalize the guest list and send invitations');
    actions.push('Review the budget breakdown and adjust allocations');
  }

  return actions;
}

export function generatePlan(ctx: EventContext): PlanResult {
  const daysRemaining = getDaysRemaining(ctx.basics.eventDate);
  const budgetStr = formatCurrency(ctx.budget.totalBudget, ctx.budget.currency);

  let overview = `Planning a ${ctx.basics.eventType} "${ctx.basics.eventName}" ` +
    `for ${ctx.basics.guestCount} guests on ${ctx.basics.eventDate} ` +
    `with a ${ctx.budget.budgetType} budget of ${budgetStr}. `;

  if (daysRemaining > 0) {
    overview += `You have ${daysRemaining} days to prepare. `;
  } else {
    overview += `Note: The event date has passed. Please update the date to continue planning. `;
  }

  if (ctx.basics.location) {
    overview += `Location: ${ctx.basics.location}. `;
  }
  if (ctx.preferences.theme) {
    overview += `Preferred theme: ${ctx.preferences.theme}. `;
  }
  if (ctx.budget.spendingPriorities.length) {
    overview += `Top priorities: ${ctx.budget.spendingPriorities.join(', ')}. `;
  }

  return {
    source: 'rule-based',
    overview,
    themeIdeas: generateThemeIdeas(ctx),
    budgetAllocation: generateBudgetAllocations(ctx),
    timeline: generateTimeline(ctx),
    vendorChecklist: generateVendorChecklist(ctx),
    guestChecklist: [
      'Create and finalize guest list',
      'Send invitations (digital or physical)',
      'Set RSVP deadline',
      'Track RSVPs and dietary requirements',
      'Arrange seating plan',
      'Prepare name tags or place cards if needed',
      'Confirm final headcount with vendors',
      `Plan for ${Math.ceil(ctx.basics.guestCount * 0.05)} extra meals as buffer`,
    ],
    foodAndDecorationIdeas: generateFoodAndDecorIdeas(ctx),
    riskPlan: generateRiskPlan(ctx),
    dayOfSchedule: generateDayOfSchedule(ctx),
    nextActions: generateNextActions(ctx),
  };
}

function generateFoodAndDecorIdeas(ctx: EventContext): string[] {
  const ideas: string[] = [];
  const { eventType } = ctx.basics;
  const foodPrefs = ctx.preferences.foodPreferences;

  if (foodPrefs.includes('vegetarian') || foodPrefs.includes('veg')) {
    ideas.push('Curated vegetarian multi-course menu with seasonal produce');
  }
  if (foodPrefs.includes('vegan')) {
    ideas.push('Creative vegan dishes with artisanal presentation');
  }
  if (foodPrefs.length === 0) {
    ideas.push('Mix of vegetarian and non-vegetarian options to cater to all guests');
  }

  if (eventType === 'wedding') {
    ideas.push('Live food stations: chaat counter, pasta bar, dessert table');
    ideas.push('Floral centerpieces matching the wedding color palette');
    ideas.push('Fairy light canopy or string light backdrop for photo area');
  } else if (eventType === 'birthday') {
    ideas.push('Custom themed cake with matching dessert bar');
    ideas.push('Balloon arch or garland as the main backdrop');
    ideas.push('Interactive food station: DIY pizza, taco bar, or sundae bar');
  } else {
    ideas.push('Community potluck with organized food stalls');
    ideas.push('Eco-friendly decorations using recycled materials');
    ideas.push('Banner and bunting in community or event colors');
  }

  ideas.push('Fresh flower arrangements for tables and entrance');
  ideas.push('Personalized menu cards listing dishes and allergen info');

  return ideas;
}

export function generateIdeas(ctx: EventContext, category?: string, preference?: string): IdeaResult {
  const ideas: Idea[] = [];
  const budget = ctx.budget.totalBudget;
  const eventType = ctx.basics.eventType;

  // Theme ideas
  if (!category || category === 'themes') {
    const themeTags: Record<string, string[]> = {
      'Rustic Elegance': ['rustic', 'elegant', 'affordable', 'family-friendly'],
      'Modern Minimalist': ['modern', 'minimalist', 'elegant'],
      'Traditional Grand': ['traditional', 'grand', 'elegant'],
      'Garden Party': ['garden', 'outdoor', 'affordable', 'family-friendly'],
      'Retro Fun': ['retro', 'fun', 'affordable', 'family-friendly'],
      'Elegant Dinner Party': ['elegant', 'modern'],
      'Festival Style': ['festival', 'fun', 'affordable', 'family-friendly'],
      'Cultural Showcase': ['cultural', 'traditional', 'family-friendly'],
      'Eco-Friendly Gathering': ['eco-friendly', 'sustainable', 'affordable'],
    };

    const themeIdeas = generateThemeIdeas(ctx);
    for (const t of themeIdeas) {
      const tags = themeTags[t.name] || [eventType, 'general'];
      if (!preference || tags.includes(preference)) {
        ideas.push({
          category: 'Theme',
          title: t.name,
          description: t.description,
          whyItFits: t.whyItFits,
          estimatedCost: t.estimatedCost,
          tags: [eventType, ...tags],
        });
      }
    }
  }

  // Decoration ideas
  if (!category || category === 'decorations') {
    const decorIdeas = [
      { title: 'DIY Photo Booth', description: 'Create a fun photo corner with props, frames, and themed backdrops. Guests love interactive elements.', cost: 'Low', tags: ['affordable', 'fun', 'family-friendly'] },
      { title: 'Floating Candle Centerpieces', description: 'Elegant glass bowls with floating candles and flower petals for table centerpieces.', cost: 'Moderate', tags: ['elegant', 'traditional'] },
      { title: 'Sustainable Décor', description: 'Potted plants as centerpieces that guests take home. Zero-waste decorations from natural materials.', cost: 'Low', tags: ['eco-friendly', 'affordable'] },
      { title: 'Fairy Light Canopy', description: 'Warm string lights draped overhead creating a magical evening atmosphere.', cost: 'Moderate', tags: ['elegant', 'modern'] },
      { title: 'Paper Craft Decorations', description: 'Handmade paper lanterns, origami garlands, and tissue paper flowers for a personalized touch.', cost: 'Very Low', tags: ['affordable', 'family-friendly'] },
    ];

    for (const d of decorIdeas) {
      if (!preference || d.tags.includes(preference)) {
        ideas.push({
          category: 'Decoration',
          title: d.title,
          description: d.description,
          whyItFits: `Suitable for ${eventType} events with ${ctx.basics.guestCount} guests.`,
          estimatedCost: d.cost,
          tags: d.tags,
        });
      }
    }
  }

  // Menu ideas
  if (!category || category === 'menu') {
    const menuIdeas = [
      { title: 'Live Cooking Stations', description: 'Interactive food stations where chefs prepare dishes live — pasta, stir-fry, dosa, or grills.', cost: 'Moderate to High', tags: ['modern', 'elegant'] },
      { title: 'Traditional Thali Service', description: 'Plated meal with variety — perfect for showcasing regional cuisine and ensuring portion control.', cost: 'Moderate', tags: ['traditional', 'family-friendly'] },
      { title: 'Buffet with Themed Sections', description: 'Multiple cuisine stations allowing guests to choose their favorites. Efficient for large groups.', cost: 'Moderate', tags: ['family-friendly', 'modern'] },
      { title: 'Street Food Festival', description: 'Popular street food items served in a casual, fun setting — chaat, rolls, momos, pani puri.', cost: 'Low to Moderate', tags: ['affordable', 'fun'] },
      { title: 'Farm-to-Table Menu', description: 'Locally sourced, seasonal ingredients for a fresh, sustainable dining experience.', cost: 'Moderate', tags: ['eco-friendly', 'elegant'] },
    ];

    for (const m of menuIdeas) {
      if (!preference || m.tags.includes(preference)) {
        ideas.push({
          category: 'Menu',
          title: m.title,
          description: m.description,
          whyItFits: `Works well for ${ctx.basics.guestCount} guests within your budget.`,
          estimatedCost: m.cost,
          tags: m.tags,
        });
      }
    }
  }

  // Activity ideas
  if (!category || category === 'activities') {
    const activityIdeas = [
      { title: 'Memory Wall', description: 'A board where guests write messages, share memories, or post photos. Great keepsake.', cost: 'Very Low', tags: ['affordable', 'family-friendly'] },
      { title: 'Live Music / Band', description: 'Hire local musicians for ambient or dance music matching the event mood.', cost: 'Moderate to High', tags: ['elegant', 'modern'] },
      { title: 'Group Games & Activities', description: 'Organized games like trivia, musical chairs, or team challenges for all ages.', cost: 'Low', tags: ['family-friendly', 'affordable'] },
      { title: 'Cultural Performance', description: 'Dance or musical performances showcasing cultural heritage and traditions.', cost: 'Moderate', tags: ['traditional', 'elegant'] },
      { title: 'Workshop Corner', description: 'Small workshops — flower arrangement, craft making, or cooking demo.', cost: 'Moderate', tags: ['modern', 'eco-friendly'] },
    ];

    for (const a of activityIdeas) {
      if (!preference || a.tags.includes(preference)) {
        ideas.push({
          category: 'Activity',
          title: a.title,
          description: a.description,
          whyItFits: `Engaging option for ${eventType} events.`,
          estimatedCost: a.cost,
          tags: a.tags,
        });
      }
    }
  }

  return { source: 'rule-based', ideas };
}

export function generateBudgetRecommendations(
  ctx: EventContext,
  currentAllocations?: Record<string, number>
): BudgetRecommendation {
  const allocations = generateBudgetAllocations(ctx);
  const totalBudget = ctx.budget.totalBudget;
  const warnings: string[] = [];
  const savingsTips: SavingsTip[] = [];

  // Check if current allocations exceed budget
  if (currentAllocations) {
    const totalAllocated = Object.values(currentAllocations).reduce((a, b) => a + b, 0);
    if (totalAllocated > totalBudget) {
      warnings.push(
        `Total allocations (${formatCurrency(totalAllocated, ctx.budget.currency)}) exceed your budget of ${formatCurrency(totalBudget, ctx.budget.currency)} by ${formatCurrency(totalAllocated - totalBudget, ctx.budget.currency)}.`
      );
    }

    // Check individual categories
    for (const alloc of allocations) {
      const current = currentAllocations[alloc.category] || 0;
      if (current > alloc.amount * 1.3) {
        warnings.push(
          `${alloc.category} allocation is significantly above the recommended ${formatCurrency(alloc.amount, ctx.budget.currency)}.`
        );
      }
    }
  }

  // Generate savings tips based on priorities
  const protectedCategories = new Set(ctx.budget.spendingPriorities.map(p => p.toLowerCase()));

  const tips: Record<string, SavingsTip> = {
    'Venue': {
      category: 'Venue',
      suggestion: 'Consider community halls, off-peak dates, or weekday bookings for lower rates',
      potentialSaving: '20-40% on venue costs',
      tradeoff: 'May have fewer amenities or less prestigious location',
    },
    'Catering': {
      category: 'Catering',
      suggestion: 'Opt for buffet over plated service, or reduce courses from 5 to 3',
      potentialSaving: '15-25% on food costs',
      tradeoff: 'Slightly simpler menu but can maintain quality',
    },
    'Photography & Videography': {
      category: 'Photography & Videography',
      suggestion: 'Book a photographer for key hours only, or choose photo-only without video',
      potentialSaving: '30-50% on photography costs',
      tradeoff: 'Less comprehensive coverage but captures essential moments',
    },
    'Decoration': {
      category: 'Decoration',
      suggestion: 'Use a mix of DIY and rented decorations. Reuse elements across areas.',
      potentialSaving: '25-40% on decoration costs',
      tradeoff: 'Requires more coordination and volunteer effort',
    },
    'Entertainment': {
      category: 'Entertainment',
      suggestion: 'Hire local artists, use curated playlists instead of a live band for portions',
      potentialSaving: '30-50% on entertainment costs',
      tradeoff: 'Less live performance time but still engaging',
    },
  };

  for (const [cat, tip] of Object.entries(tips)) {
    const catLower = cat.toLowerCase();
    const isProtected = protectedCategories.has(catLower) ||
      protectedCategories.has(catLower.split(' ')[0]);
    if (!isProtected) {
      savingsTips.push(tip);
    }
  }

  return { source: 'rule-based', allocations, savingsTips, warnings };
}
