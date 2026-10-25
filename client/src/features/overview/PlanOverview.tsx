import React from 'react';
import {
  Sparkles,
  Calendar,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import type { SavedEvent } from '../../types';
import { formatCurrency, formatDate, getDaysRemaining } from '../../utils/helpers';

interface PlanOverviewProps {
  event: SavedEvent;
  onNavigateTab: (tab: string) => void;
}

export function PlanOverview({ event, onNavigateTab }: PlanOverviewProps) {
  const plan = event.plan;
  const days = getDaysRemaining(event.context.basics.eventDate);

  if (!plan) {
    return (
      <div className="card text-center py-12">
        <Sparkles className="w-8 h-8 text-primary-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-stone-900">No Plan Generated Yet</h3>
        <p className="text-stone-500 text-sm mt-1">
          A customized plan has not been compiled for this event.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engine Source Badge & Summary Header */}
      <div className="card bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-accent-300" />
              Engine: {plan.source === 'ai' ? 'Cloud GenAI Model' : 'Deterministic Rule Engine (Verified)'}
            </span>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                days < 0
                  ? 'bg-stone-500 text-white'
                  : days < 7
                  ? 'bg-red-500 text-white'
                  : days < 30
                  ? 'bg-amber-400 text-stone-900'
                  : 'bg-emerald-400 text-stone-900'
              }`}
            >
              {days < 0 ? 'Concluded' : days === 0 ? 'Happening Today!' : `${days} Days Remaining`}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 leading-snug">
            {event.context.basics.eventName}
          </h2>
          <p className="text-primary-100 text-sm md:text-base max-w-3xl leading-relaxed">
            {plan.overview}
          </p>

          <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs md:text-sm">
            <div>
              <div className="text-primary-200">Date</div>
              <div className="font-semibold text-white">{formatDate(event.context.basics.eventDate)}</div>
            </div>
            <div>
              <div className="text-primary-200">Guests</div>
              <div className="font-semibold text-white">{event.context.basics.guestCount} Attendees</div>
            </div>
            <div>
              <div className="text-primary-200">Allocated Budget</div>
              <div className="font-semibold text-white">
                {formatCurrency(event.context.budget.totalBudget, event.context.budget.currency)}
              </div>
            </div>
            <div>
              <div className="text-primary-200">Venue Setting</div>
              <div className="font-semibold text-white capitalize">{event.context.preferences.venueType}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Immediate Actions */}
      <div className="card border-l-4 border-l-primary-600 bg-white shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            Next Recommended Immediate Actions
          </h3>
          <span className="text-xs text-stone-400">Context-aware priority</span>
        </div>
        <div className="space-y-2.5">
          {plan.nextActions.slice(0, 3).map((action, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100 hover:bg-stone-100/70 transition"
            >
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="text-sm font-medium text-stone-800 flex-1">{action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-column Grid: Theme Concepts & Risk Contingencies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personalized Theme Ideas */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              Recommended Theme Concepts
            </h3>
            <button
              onClick={() => onNavigateTab('ideas')}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Explore all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {plan.themeIdeas.map((theme, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white transition">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-stone-900 text-sm">{theme.name}</h4>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                    {theme.estimatedCost}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mb-2 leading-relaxed">{theme.description}</p>
                <div className="text-xs text-stone-500 bg-white p-2 rounded-lg border border-stone-100">
                  <span className="font-medium text-stone-700">Why it fits: </span>
                  {theme.whyItFits}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk & Contingency Assessment */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Risk Analysis & Safeguards
            </h3>
            <span className="text-xs text-stone-400">Proactive contingencies</span>
          </div>

          <div className="space-y-3">
            {plan.riskPlan.map((risk, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                    <AlertTriangle
                      className={`w-3.5 h-3.5 ${
                        risk.likelihood === 'high'
                          ? 'text-red-500'
                          : risk.likelihood === 'medium'
                          ? 'text-amber-500'
                          : 'text-stone-400'
                      }`}
                    />
                    {risk.risk}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      risk.likelihood === 'high'
                        ? 'bg-red-100 text-red-700'
                        : risk.likelihood === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {risk.likelihood} risk
                  </span>
                </div>
                <p className="text-xs text-stone-500 mb-1.5">{risk.impact}</p>
                <div className="text-xs bg-emerald-50 text-emerald-900 p-2 rounded-lg border border-emerald-100">
                  <span className="font-semibold text-emerald-800">Contingency Action: </span>
                  {risk.mitigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day-of Event Program Schedule */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" />
              Day-of-Event Master Run of Show
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Chronological itinerary for the celebration day</p>
          </div>
          <button
            onClick={() => onNavigateTab('timeline')}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View Full Timeline <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-2 font-semibold w-24">Time</th>
                <th className="pb-2 font-semibold">Activity</th>
                <th className="pb-2 font-semibold w-36">Responsible</th>
                <th className="pb-2 font-semibold">Operational Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {plan.dayOfSchedule.map((item, idx) => (
                <tr key={idx} className="hover:bg-stone-50/60">
                  <td className="py-2.5 font-bold text-primary-700 whitespace-nowrap">{item.time}</td>
                  <td className="py-2.5 font-medium text-stone-900">{item.activity}</td>
                  <td className="py-2.5 text-stone-600">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs">
                      {item.responsible}
                    </span>
                  </td>
                  <td className="py-2.5 text-stone-500 text-xs">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
