// Shared types for Planora AI client

export type EventType = 'wedding' | 'birthday' | 'community';
export type VenueType = 'indoor' | 'outdoor' | 'both';
export type BudgetType = 'flexible' | 'fixed';

export interface EventBasics {
  eventType: EventType;
  eventName: string;
  eventDate: string;
  location: string;
  guestCount: number;
}

export interface BudgetPriorities {
  totalBudget: number;
  currency: string;
  spendingPriorities: string[];
  budgetType: BudgetType;
  bufferPercentage: number;
}

export interface Preferences {
  theme: string;
  venueType: VenueType;
  foodPreferences: string[];
  culturalPreferences: string;
  accessibilityRequirements: string;
  specialRequests: string;
}

export interface Constraints {
  existingBookings: string[];
  availableHelpers: number;
  preferredVendors: string[];
  importantDeadlines: string[];
  otherConstraints: string;
}

export interface EventContext {
  basics: EventBasics;
  budget: BudgetPriorities;
  preferences: Preferences;
  constraints: Constraints;
}

export interface SavedEvent {
  id: string;
  context: EventContext;
  plan?: PlanResult;
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  guests: Guest[];
  tasks: Task[];
  ideas: Idea[];
  createdAt: string;
  updatedAt: string;
}

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

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimatedAmount: number;
  quotedAmount: number;
  actualAmount: number;
  notes: string;
}

export interface Vendor {
  id: string;
  category: string;
  businessName: string;
  contactInfo: string;
  quotedAmount: number;
  status: VendorStatus;
  depositPaid: number;
  remainingPayment: number;
  notes: string;
  deadline: string;
}

export type VendorStatus = 'to-research' | 'contacted' | 'quote-received' | 'booked' | 'paid' | 'cancelled';

export interface Guest {
  id: string;
  name: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe';
  dietaryRequirements: string;
  seatingGroup: string;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  assignedTo: string;
  category: string;
}

export interface Idea {
  category: string;
  title: string;
  description: string;
  whyItFits: string;
  estimatedCost: string;
  tags: string[];
  saved: boolean;
}
