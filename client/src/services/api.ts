import type { EventContext, PlanResult, Idea } from '../types';

const API_BASE = '/api';

async function apiCall<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generatePlanAPI(ctx: EventContext): Promise<PlanResult | null> {
  return apiCall<PlanResult>('/plan', ctx);
}

export async function generateIdeasAPI(
  ctx: EventContext,
  category?: string,
  preference?: string
): Promise<{ source: string; ideas: Idea[] } | null> {
  return apiCall('/ideas', { eventContext: ctx, category, preference });
}

export async function getBudgetRecommendations(
  ctx: EventContext,
  currentAllocations?: Record<string, number>
): Promise<any | null> {
  return apiCall('/budget/recommendations', { eventContext: ctx, currentAllocations });
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
