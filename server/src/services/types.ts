import type { EventContext } from '../schemas/event.js';

export interface PlanResult {
  source: 'rule-based' | 'ai';
  overview: string;
  themeIdeas: ThemeIdea[];
  budgetAllocation: BudgetAllocation[];
  timeline: TimelinePhase[];
  vendorChecklist: VendorChecklistItem[];
  guestChecklist: string[];
  foodAndDecorationIdeas: string[];
  riskPlan: RiskItem[];
  dayOfSchedule: ScheduleItem[];
  nextActions: string[];
}

export interface ThemeIdea {
  name: string;
  description: string;
  estimatedCost: string;
  whyItFits: string;
}

export interface BudgetAllocation {
  category: string;
  percentage: number;
  amount: number;
  notes: string;
}

export interface TimelinePhase {
  phase: string;
  startDate: string;
  endDate: string;
  tasks: TimelineTask[];
}

export interface TimelineTask {
  id: string;
  task: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dependsOn?: string[];
}

export interface VendorChecklistItem {
  category: string;
  description: string;
  estimatedBudget: number;
  priority: 'essential' | 'recommended' | 'optional';
  selectionCriteria: string[];
}

export interface RiskItem {
  risk: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: string;
  mitigation: string;
}

export interface ScheduleItem {
  time: string;
  activity: string;
  responsible: string;
  notes: string;
}

export interface IdeaResult {
  source: 'rule-based' | 'ai';
  ideas: Idea[];
}

export interface Idea {
  category: string;
  title: string;
  description: string;
  whyItFits: string;
  estimatedCost: string;
  tags: string[];
}

export interface BudgetRecommendation {
  source: 'rule-based' | 'ai';
  allocations: BudgetAllocation[];
  savingsTips: SavingsTip[];
  warnings: string[];
}

export interface SavingsTip {
  category: string;
  suggestion: string;
  potentialSaving: string;
  tradeoff: string;
}

export function getDaysRemaining(eventDate: string): number {
  const event = new Date(eventDate);
  const now = new Date();
  const diff = event.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
