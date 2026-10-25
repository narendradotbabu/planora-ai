import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  DollarSign,
  Heart,
  Cake,
  Flag,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { generatePlanAPI } from '../services/api';
import { generateLocalPlan } from '../services/localPlanningEngine';
import { saveEvent, generateId } from '../services/storage';
import type { EventContext, SavedEvent, EventType, VenueType, BudgetType } from '../types';

interface FormErrors {
  eventName?: string;
  eventDate?: string;
  guestCount?: string;
  totalBudget?: string;
}

const SAMPLE_EVENTS: Record<EventType, Partial<EventContext>> = {
  wedding: {
    basics: {
      eventType: 'wedding',
      eventName: 'Aarav & Ananya’s Royal Wedding',
      eventDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: 'Udaipur, Rajasthan',
      guestCount: 250,
    },
    budget: {
      totalBudget: 1500000,
      currency: 'INR',
      spendingPriorities: ['Catering', 'Photography & Videography', 'Venue'],
      budgetType: 'flexible',
      bufferPercentage: 10,
    },
    preferences: {
      theme: 'Royal Rajputana Heritage with warm floral accents',
      venueType: 'both',
      foodPreferences: ['Vegetarian', 'Authentic North Indian', 'Chaat live station'],
      culturalPreferences: 'Traditional Rajasthani Sangeet & Pheras',
      accessibilityRequirements: 'Wheelchair access ramp to stage and dining pavilion',
      specialRequests: 'Drone photography for grand entrance, eco-friendly seed paper invites',
    },
    constraints: {
      existingBookings: ['Heritage Palace Courtyard reserved for reception'],
      availableHelpers: 8,
      preferredVendors: ['Royal Moments Photography'],
      importantDeadlines: ['Sangeet choreography finalized 30 days before'],
      otherConstraints: 'Evening outdoor sound curfew at 10:00 PM',
    },
  },
  birthday: {
    basics: {
      eventType: 'birthday',
      eventName: 'Rohan’s 10th Superhero Gala',
      eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: 'Bengaluru, Karnataka',
      guestCount: 60,
    },
    budget: {
      totalBudget: 120000,
      currency: 'INR',
      spendingPriorities: ['Entertainment', 'Catering', 'Decoration'],
      budgetType: 'fixed',
      bufferPercentage: 8,
    },
    preferences: {
      theme: 'Avengers & Comic Book Adventure',
      venueType: 'indoor',
      foodPreferences: ['Kid-friendly sliders, pizza bar', 'Eggless chocolate cake'],
      culturalPreferences: '',
      accessibilityRequirements: 'Stroller parking area near entrance',
      specialRequests: 'Costumed entertainer performance & DIY comic workshop',
    },
    constraints: {
      existingBookings: ['Community clubhouse booked from 2 PM to 8 PM'],
      availableHelpers: 4,
      preferredVendors: [],
      importantDeadlines: ['Custom cake order 2 weeks ahead'],
      otherConstraints: 'No confetti permitted by venue rules',
    },
  },
  community: {
    basics: {
      eventType: 'community',
      eventName: 'Green Meadows Eco-Fest 2026',
      eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      location: 'Pune, Maharashtra',
      guestCount: 400,
    },
    budget: {
      totalBudget: 350000,
      currency: 'INR',
      spendingPriorities: ['Equipment', 'Entertainment', 'Venue'],
      budgetType: 'flexible',
      bufferPercentage: 12,
    },
    preferences: {
      theme: 'Sustainable Living & Zero-Waste Fair',
      venueType: 'outdoor',
      foodPreferences: ['Local organic millet snacks', 'Fresh fruit juice counters'],
      culturalPreferences: 'Local folk art demonstrations',
      accessibilityRequirements: 'Braille signage and step-free booth corridors',
      specialRequests: 'Live acoustic solar-powered audio setup',
    },
    constraints: {
      existingBookings: ['Municipal garden permit granted'],
      availableHelpers: 25,
      preferredVendors: ['GreenEarth Compost Systems'],
      importantDeadlines: ['Police clearance 20 days prior'],
      otherConstraints: 'Strict zero single-use plastic policy',
    },
  },
};

const PRIORITY_OPTIONS = [
  'Venue',
  'Catering',
  'Decoration',
  'Photography & Videography',
  'Entertainment',
  'Clothing & Styling',
  'Invitations',
];

export function CreateEventPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Step 1: Basics
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(100);

  // Step 2: Budget
  const [totalBudget, setTotalBudget] = useState<number>(500000);
  const [currency] = useState<string>('INR');
  const [spendingPriorities, setSpendingPriorities] = useState<string[]>(['Catering', 'Venue']);
  const [budgetType, setBudgetType] = useState<BudgetType>('flexible');
  const [bufferPercentage, setBufferPercentage] = useState<number>(10);

  // Step 3: Preferences
  const [theme, setTheme] = useState<string>('');
  const [venueType, setVenueType] = useState<VenueType>('both');
  const [foodPreferencesStr, setFoodPreferencesStr] = useState<string>('Vegetarian, Multi-cuisine');
  const [culturalPreferences, setCulturalPreferences] = useState<string>('');
  const [accessibilityRequirements, setAccessibilityRequirements] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Step 4: Constraints
  const [existingBookingsStr, setExistingBookingsStr] = useState<string>('');
  const [availableHelpers, setAvailableHelpers] = useState<number>(2);
  const [preferredVendorsStr, setPreferredVendorsStr] = useState<string>('');
  const [importantDeadlinesStr, setImportantDeadlinesStr] = useState<string>('');
  const [otherConstraints, setOtherConstraints] = useState<string>('');

  const loadSample = (type: EventType) => {
    const s = SAMPLE_EVENTS[type];
    if (!s) return;
    if (s.basics) {
      setEventType(s.basics.eventType);
      setEventName(s.basics.eventName);
      setEventDate(s.basics.eventDate);
      setLocation(s.basics.location);
      setGuestCount(s.basics.guestCount);
    }
    if (s.budget) {
      setTotalBudget(s.budget.totalBudget);
      setSpendingPriorities(s.budget.spendingPriorities);
      setBudgetType(s.budget.budgetType);
      setBufferPercentage(s.budget.bufferPercentage);
    }
    if (s.preferences) {
      setTheme(s.preferences.theme);
      setVenueType(s.preferences.venueType);
      setFoodPreferencesStr(s.preferences.foodPreferences.join(', '));
      setCulturalPreferences(s.preferences.culturalPreferences);
      setAccessibilityRequirements(s.preferences.accessibilityRequirements);
      setSpecialRequests(s.preferences.specialRequests);
    }
    if (s.constraints) {
      setExistingBookingsStr(s.constraints.existingBookings.join(', '));
      setAvailableHelpers(s.constraints.availableHelpers);
      setPreferredVendorsStr(s.constraints.preferredVendors.join(', '));
      setImportantDeadlinesStr(s.constraints.importantDeadlines.join(', '));
      setOtherConstraints(s.constraints.otherConstraints);
    }
    setErrors({});
  };

  const togglePriority = (p: string) => {
    setSpendingPriorities(prev =>
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const validateStep = (currentStep: number): boolean => {
    const errs: FormErrors = {};
    if (currentStep === 1) {
      if (!eventName.trim()) errs.eventName = 'Event name is required';
      if (!eventDate) errs.eventDate = 'Event date is required';
      if (!guestCount || guestCount < 1) errs.guestCount = 'Must have at least 1 guest';
    }
    if (currentStep === 2) {
      if (totalBudget < 0 || isNaN(totalBudget)) errs.totalBudget = 'Budget cannot be negative';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1);
      return;
    }

    setIsSubmitting(true);

    const context: EventContext = {
      basics: {
        eventType,
        eventName: eventName.trim(),
        eventDate,
        location: location.trim(),
        guestCount: Number(guestCount),
      },
      budget: {
        totalBudget: Number(totalBudget),
        currency,
        spendingPriorities,
        budgetType,
        bufferPercentage: Number(bufferPercentage),
      },
      preferences: {
        theme: theme.trim(),
        venueType,
        foodPreferences: foodPreferencesStr.split(',').map(s => s.trim()).filter(Boolean),
        culturalPreferences: culturalPreferences.trim(),
        accessibilityRequirements: accessibilityRequirements.trim(),
        specialRequests: specialRequests.trim(),
      },
      constraints: {
        existingBookings: existingBookingsStr.split(',').map(s => s.trim()).filter(Boolean),
        availableHelpers: Number(availableHelpers),
        preferredVendors: preferredVendorsStr.split(',').map(s => s.trim()).filter(Boolean),
        importantDeadlines: importantDeadlinesStr.split(',').map(s => s.trim()).filter(Boolean),
        otherConstraints: otherConstraints.trim(),
      },
    };

    try {
      // Try backend API first, fall back to local planning engine
      let plan = await generatePlanAPI(context);
      if (!plan) {
        plan = generateLocalPlan(context);
      }

      // Initialize budget items from allocations
      const budgetItems = plan.budgetAllocation.map(alloc => ({
        id: generateId(),
        category: alloc.category,
        name: `${alloc.category} primary package`,
        estimatedAmount: alloc.amount,
        quotedAmount: 0,
        actualAmount: 0,
        notes: alloc.notes,
      }));

      // Initialize initial tasks from timeline
      const tasks = plan.timeline.flatMap(phase =>
        phase.tasks.map(t => ({
          id: generateId(),
          title: t.task,
          description: `Timeline task from ${phase.phase}`,
          priority: t.priority,
          status: (t.status === 'overdue' ? 'pending' : t.status) as 'pending' | 'in-progress' | 'completed',
          dueDate: t.dueDate,
          assignedTo: 'Lead Organizer',
          category: phase.phase,
        }))
      );

      // Initialize initial vendors
      const vendors = plan.vendorChecklist.map(v => ({
        id: generateId(),
        category: v.category,
        businessName: `Prospective ${v.category} Vendor`,
        contactInfo: '',
        quotedAmount: v.estimatedBudget,
        status: 'to-research' as const,
        depositPaid: 0,
        remainingPayment: v.estimatedBudget,
        notes: `Criteria: ${v.selectionCriteria.slice(0, 3).join(', ')}`,
        deadline: context.basics.eventDate,
      }));

      // Initialize sample guests if wedding/birthday
      const guests = [
        {
          id: generateId(),
          name: 'Primary VIP Family / Organization',
          rsvpStatus: 'confirmed' as const,
          dietaryRequirements: 'None',
          seatingGroup: 'Head Table',
          notes: 'Special coordination',
        },
      ];

      const newEvent: SavedEvent = {
        id: generateId(),
        context,
        plan,
        budgetItems,
        vendors,
        guests,
        tasks,
        ideas: plan.themeIdeas.map(t => ({
          category: 'Theme',
          title: t.name,
          description: t.description,
          whyItFits: t.whyItFits,
          estimatedCost: t.estimatedCost,
          tags: [context.basics.eventType, 'theme'],
          saved: true,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveEvent(newEvent);
      navigate(`/event/${newEvent.id}`);
    } catch (err) {
      console.error('Error generating event:', err);
      // Fallback local save guaranteed
      const fallbackPlan = generateLocalPlan(context);
      const newEvent: SavedEvent = {
        id: generateId(),
        context,
        plan: fallbackPlan,
        budgetItems: [],
        vendors: [],
        guests: [],
        tasks: [],
        ideas: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveEvent(newEvent);
      navigate(`/event/${newEvent.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Wizard Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Create New Event</h1>
        <p className="text-stone-600 text-sm md:text-base">
          Let’s set up your event parameters so Planora AI can tailor budget, timeline, and suggestions.
        </p>

        {/* Quick Demo Pre-load Bar */}
        <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100 flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm">
          <span className="font-semibold text-primary-900 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-primary-600" />
            Quick Demo Fill:
          </span>
          <button
            type="button"
            onClick={() => loadSample('wedding')}
            className="px-2.5 py-1 rounded-lg bg-white text-primary-700 font-medium border border-primary-200 hover:bg-primary-100 transition"
          >
            💒 Royal Wedding
          </button>
          <button
            type="button"
            onClick={() => loadSample('birthday')}
            className="px-2.5 py-1 rounded-lg bg-white text-primary-700 font-medium border border-primary-200 hover:bg-primary-100 transition"
          >
            🎂 Kids Birthday
          </button>
          <button
            type="button"
            onClick={() => loadSample('community')}
            className="px-2.5 py-1 rounded-lg bg-white text-primary-700 font-medium border border-primary-200 hover:bg-primary-100 transition"
          >
            🎪 Eco Community Fest
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-stone-200 w-full -z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-600 transition-all duration-300 -z-0"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Budget' },
            { num: 3, label: 'Preferences' },
            { num: 4, label: 'Constraints' },
          ].map(s => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center bg-white px-2 z-10">
                <button
                  type="button"
                  onClick={() => {
                    if (step > s.num) setStep(s.num);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    isDone
                      ? 'bg-primary-600 text-white'
                      : isCurrent
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-stone-100 text-stone-500 border border-stone-300'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </button>
                <span className={`text-xs mt-1 font-medium ${isCurrent ? 'text-primary-700 font-bold' : 'text-stone-500'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Form Card */}
      <form onSubmit={handleSubmit} className="card border border-stone-200 shadow-sm p-6 md:p-8 bg-white">
        {/* STEP 1: EVENT BASICS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-1">Step 1 — Event Basics</h2>
              <p className="text-stone-500 text-sm">Tell us what you are celebrating and the core details.</p>
            </div>

            {/* Event Type Cards */}
            <div>
              <label className="label">
                Event Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { type: 'wedding', label: 'Wedding', icon: Heart, desc: 'Ceremonies, banquets, and rituals' },
                  { type: 'birthday', label: 'Birthday Party', icon: Cake, desc: 'Milestones, kids & adult parties' },
                  { type: 'community', label: 'Community Event', icon: Flag, desc: 'Festivals, charity & neighborhood' },
                ].map(item => (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setEventType(item.type as EventType)}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                      eventType === item.type
                        ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-500/20'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <item.icon
                        className={`w-5 h-5 ${eventType === item.type ? 'text-primary-600' : 'text-stone-500'}`}
                      />
                      {eventType === item.type && <Check className="w-4 h-4 text-primary-600" />}
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900 text-sm">{item.label}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Event Name */}
            <div>
              <label className="label" htmlFor="eventName">
                Event Title / Name <span className="text-red-500">*</span>
              </label>
              <input
                id="eventName"
                type="text"
                placeholder="e.g. Maya & Arjun's Sangeet & Wedding"
                value={eventName}
                onChange={e => {
                  setEventName(e.target.value);
                  if (errors.eventName) setErrors(prev => ({ ...prev, eventName: undefined }));
                }}
                className={`input-field ${errors.eventName ? 'border-red-400 focus:ring-red-500' : ''}`}
              />
              {errors.eventName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.eventName}
                </p>
              )}
            </div>

            {/* Date & Guests in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="eventDate">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={e => {
                    setEventDate(e.target.value);
                    if (errors.eventDate) setErrors(prev => ({ ...prev, eventDate: undefined }));
                  }}
                  className={`input-field ${errors.eventDate ? 'border-red-400 focus:ring-red-500' : ''}`}
                />
                {errors.eventDate && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.eventDate}
                  </p>
                )}
              </div>

              <div>
                <label className="label" htmlFor="guestCount">
                  Expected Guests <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="guestCount"
                    type="number"
                    min="1"
                    max="50000"
                    value={guestCount || ''}
                    onChange={e => {
                      setGuestCount(parseInt(e.target.value) || 0);
                      if (errors.guestCount) setErrors(prev => ({ ...prev, guestCount: undefined }));
                    }}
                    className={`input-field pl-9 ${errors.guestCount ? 'border-red-400 focus:ring-red-500' : ''}`}
                  />
                </div>
                {errors.guestCount && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.guestCount}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="label" htmlFor="location">
                City / Venue Location <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Jaipur, Rajasthan or The Grand Ballroom"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-stone-500 mt-1">Helps adapt logistics, seasonality, and regional customs.</p>
            </div>
          </div>
        )}

        {/* STEP 2: BUDGET & PRIORITIES */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-1">Step 2 — Budget & Priorities</h2>
              <p className="text-stone-500 text-sm">
                Define your financial boundaries and what matters most so the engine protects your priorities.
              </p>
            </div>

            {/* Total Budget & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="totalBudget">
                  Total Budget Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="totalBudget"
                    type="number"
                    min="0"
                    step="1000"
                    value={totalBudget}
                    onChange={e => {
                      setTotalBudget(Math.max(0, parseInt(e.target.value) || 0));
                      if (errors.totalBudget) setErrors(prev => ({ ...prev, totalBudget: undefined }));
                    }}
                    className={`input-field pl-9 text-lg font-semibold ${
                      errors.totalBudget ? 'border-red-400 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.totalBudget && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.totalBudget}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Currency</label>
                <div className="input-field bg-stone-50 text-stone-600 font-medium flex items-center justify-between">
                  <span>INR (₹)</span>
                  <span className="text-xs text-stone-400 font-normal">Default</span>
                </div>
              </div>
            </div>

            {/* Spending Priorities */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">High-Priority Categories</label>
                <span className="text-xs text-stone-500">Pick up to 3 to protect from budget cuts</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map(p => {
                  const selected = spendingPriorities.includes(p);
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => togglePriority(p)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                        selected
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Flexibility & Contingency Buffer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Budget Flexibility</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBudgetType('flexible')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition ${
                      budgetType === 'flexible'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Flexible (±10%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetType('fixed')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition ${
                      budgetType === 'fixed'
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    Strict / Fixed Cap
                  </button>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="bufferPercentage">
                  Emergency Buffer: {bufferPercentage}%
                </label>
                <input
                  id="bufferPercentage"
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={bufferPercentage}
                  onChange={e => setBufferPercentage(parseInt(e.target.value))}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>5% (Lean)</span>
                  <span>10% (Recommended)</span>
                  <span>25% (Safe)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PREFERENCES */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-1">Step 3 — Preferences & Atmosphere</h2>
              <p className="text-stone-500 text-sm">
                Fine-tune theme, food, and accessibility requirements for tailored suggestions.
              </p>
            </div>

            {/* Theme & Venue Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="theme">
                  Theme / Design Aesthetic
                </label>
                <input
                  id="theme"
                  type="text"
                  placeholder="e.g. Modern Rustic, Pastel Fairytale, Cyberpunk"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Venue Environment</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'indoor', label: 'Indoor' },
                    { val: 'outdoor', label: 'Outdoor' },
                    { val: 'both', label: 'Indoor & Out' },
                  ].map(v => (
                    <button
                      type="button"
                      key={v.val}
                      onClick={() => setVenueType(v.val as VenueType)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition ${
                        venueType === v.val
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Food Preferences */}
            <div>
              <label className="label" htmlFor="foodPrefs">
                Food & Catering Preferences
              </label>
              <input
                id="foodPrefs"
                type="text"
                placeholder="e.g. Pure Vegetarian, Live Chaat counter, Italian pasta station, Halal"
                value={foodPreferencesStr}
                onChange={e => setFoodPreferencesStr(e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-stone-500 mt-1">Separate options with commas</p>
            </div>

            {/* Cultural & Accessibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="cultural">
                  Cultural / Regional Elements
                </label>
                <input
                  id="cultural"
                  type="text"
                  placeholder="e.g. South Indian Muhurtham, Punjabi Sangeet"
                  value={culturalPreferences}
                  onChange={e => setCulturalPreferences(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label" htmlFor="accessibility">
                  Accessibility Requirements
                </label>
                <input
                  id="accessibility"
                  type="text"
                  placeholder="e.g. Wheelchair access, quiet room, sign interpreter"
                  value={accessibilityRequirements}
                  onChange={e => setAccessibilityRequirements(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="label" htmlFor="specialRequests">
                Special Requests or Notes
              </label>
              <textarea
                id="specialRequests"
                rows={2}
                placeholder="Any unique activities, surprises, or restrictions"
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                className="input-field resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: PLANNING CONSTRAINTS */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-stone-900 mb-1">Step 4 — Planning Constraints</h2>
              <p className="text-stone-500 text-sm">
                Incorporate existing commitments, volunteer support, and hard deadlines.
              </p>
            </div>

            {/* Existing Bookings & Helpers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="existingBookings">
                  Existing Bookings / Pre-paid Items
                </label>
                <input
                  id="existingBookings"
                  type="text"
                  placeholder="e.g. Venue booked ($10,000 paid), DJ confirmed"
                  value={existingBookingsStr}
                  onChange={e => setExistingBookingsStr(e.target.value)}
                  className="input-field"
                />
                <p className="text-xs text-stone-500 mt-1">Confirmed elements will be treated as immutable anchors</p>
              </div>

              <div>
                <label className="label" htmlFor="helpers">
                  Available Helpers / Crew
                </label>
                <input
                  id="helpers"
                  type="number"
                  min="0"
                  max="100"
                  value={availableHelpers}
                  onChange={e => setAvailableHelpers(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-field"
                />
              </div>
            </div>

            {/* Preferred Vendors & Key Deadlines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="vendors">
                  Preferred Vendors / Suppliers
                </label>
                <input
                  id="vendors"
                  type="text"
                  placeholder="e.g. DreamShots Photo Studio"
                  value={preferredVendorsStr}
                  onChange={e => setPreferredVendorsStr(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label" htmlFor="deadlines">
                  Important Intermediate Deadlines
                </label>
                <input
                  id="deadlines"
                  type="text"
                  placeholder="e.g. Dress trials by Nov 10, Invitations sent 60 days out"
                  value={importantDeadlinesStr}
                  onChange={e => setImportantDeadlinesStr(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Other Constraints */}
            <div>
              <label className="label" htmlFor="otherConstraints">
                Other Environmental or Logistical Constraints
              </label>
              <textarea
                id="otherConstraints"
                rows={2}
                placeholder="e.g. Noise ordinance at 10 PM, limited parking on site, strictly no open flames"
                value={otherConstraints}
                onChange={e => setOtherConstraints(e.target.value)}
                className="input-field resize-none"
              />
            </div>

            {/* Summary Preview Box */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
              <div className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-primary-600" />
                Plan Generation Overview:
              </div>
              <div>• Event: <span className="font-medium text-stone-900">{eventName || 'Untitled Event'}</span> ({eventType})</div>
              <div>• Date & Guests: <span className="font-medium text-stone-900">{eventDate || 'Date not set'}</span> for ~<span className="font-medium text-stone-900">{guestCount}</span> guests</div>
              <div>• Total Budget: <span className="font-medium text-stone-900">₹{totalBudget.toLocaleString('en-IN')}</span> ({budgetType})</div>
              <div>• Protected Priorities: <span className="font-medium text-stone-900">{spendingPriorities.join(', ') || 'Standard balanced'}</span></div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
          {step > 1 ? (
            <button type="button" onClick={handleBack} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button type="button" onClick={handleNext} className="btn-primary flex items-center gap-2">
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 bg-gradient-to-r from-primary-600 to-accent-600 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Smart Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate My Event Plan
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
