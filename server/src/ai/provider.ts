import type { EventContext } from '../schemas/event.js';
import type { PlanResult, IdeaResult, BudgetRecommendation } from '../services/types.js';

export interface AIProvider {
  generatePlan(ctx: EventContext): Promise<PlanResult>;
  generateIdeas(ctx: EventContext, category?: string, preference?: string): Promise<IdeaResult>;
  generateBudgetRecommendations(ctx: EventContext, currentAllocations?: Record<string, number>): Promise<BudgetRecommendation>;
}

export function buildPrompt(ctx: EventContext, task: string): string {
  const lines = [
    `You are Planora AI, an intelligent event planning assistant.`,
    `Task: ${task}`,
    ``,
    `Event Details:`,
    `- Type: ${ctx.basics.eventType}`,
    `- Name: ${ctx.basics.eventName}`,
    `- Date: ${ctx.basics.eventDate}`,
    `- Location: ${ctx.basics.location || 'Not specified'}`,
    `- Guest Count: ${ctx.basics.guestCount}`,
    ``,
    `Budget:`,
    `- Total: ${ctx.budget.totalBudget} ${ctx.budget.currency}`,
    `- Type: ${ctx.budget.budgetType}`,
    `- Buffer: ${ctx.budget.bufferPercentage}%`,
    `- Priorities: ${ctx.budget.spendingPriorities.join(', ') || 'None specified'}`,
    ``,
    `Preferences:`,
    `- Theme: ${ctx.preferences.theme || 'Open to suggestions'}`,
    `- Venue Type: ${ctx.preferences.venueType}`,
    `- Food: ${ctx.preferences.foodPreferences.join(', ') || 'No specific preference'}`,
    `- Cultural: ${ctx.preferences.culturalPreferences || 'None specified'}`,
    `- Accessibility: ${ctx.preferences.accessibilityRequirements || 'None specified'}`,
    `- Special Requests: ${ctx.preferences.specialRequests || 'None'}`,
    ``,
    `Constraints:`,
    `- Existing Bookings: ${ctx.constraints.existingBookings.join(', ') || 'None'}`,
    `- Available Helpers: ${ctx.constraints.availableHelpers}`,
    `- Preferred Vendors: ${ctx.constraints.preferredVendors.join(', ') || 'None'}`,
    `- Key Deadlines: ${ctx.constraints.importantDeadlines.join(', ') || 'None'}`,
    `- Other: ${ctx.constraints.otherConstraints || 'None'}`,
    ``,
    `Respond with valid JSON only. Do not include explanations outside the JSON structure.`,
    `Do not fabricate real business names, contact details, or verified prices.`,
    `All budget amounts should be in ${ctx.budget.currency}.`,
  ];

  return lines.join('\n');
}

// This module is a placeholder for actual AI provider integration.
// When an AI API key is configured, implement the provider here.
// For now, the application uses the rule-based planning engine.
export function isAIConfigured(): boolean {
  return !!(process.env.AI_API_KEY && process.env.AI_API_KEY !== 'your_api_key_here');
}
