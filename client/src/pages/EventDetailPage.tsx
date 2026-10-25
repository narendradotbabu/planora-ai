import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  ShoppingBag,
  ListTodo,
  Lightbulb,
  Share2,
  ArrowLeft,
  Trash2,
  RefreshCw,
  MapPin,
  Check,
} from 'lucide-react';
import { getEvent, saveEvent, deleteEvent } from '../services/storage';
import { generateLocalPlan } from '../services/localPlanningEngine';
import { generatePlanAPI } from '../services/api';
import { formatCurrency, formatDate, getDaysRemaining, getEventTypeEmoji } from '../utils/helpers';
import type { SavedEvent } from '../types';

import { PlanOverview } from '../features/overview/PlanOverview';
import { BudgetPlanner } from '../features/budget/BudgetPlanner';
import { TimelineView } from '../features/timeline/TimelineView';
import { VendorManager } from '../features/vendors/VendorManager';
import { GuestManager } from '../features/guests/GuestManager';
import { TaskManager } from '../features/tasks/TaskManager';
import { IdeaGenerator } from '../features/ideas/IdeaGenerator';
import { ExportModal } from '../features/export/ExportModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

type TabKey = 'overview' | 'budget' | 'timeline' | 'vendors' | 'guests' | 'tasks' | 'ideas';

export function EventDetailPage() {
  const { id, tab: initialTab } = useParams<{ id: string; tab?: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<SavedEvent | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>(
    (initialTab as TabKey) || 'overview'
  );
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getEvent(id);
      if (found) {
        setEvent(found);
      } else {
        navigate('/dashboard');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    if (initialTab && ['overview', 'budget', 'timeline', 'vendors', 'guests', 'tasks', 'ideas'].includes(initialTab)) {
      setActiveTab(initialTab as TabKey);
    }
  }, [initialTab]);

  const handleTabChange = (t: TabKey) => {
    setActiveTab(t);
    navigate(`/event/${id}/${t}`, { replace: true });
  };

  const handleUpdateEvent = (updated: SavedEvent) => {
    setEvent(updated);
    saveEvent(updated);
  };

  const handleDelete = () => {
    if (event) {
      deleteEvent(event.id);
      navigate('/dashboard');
    }
  };

  const handleRegeneratePlan = async () => {
    if (!event) return;
    setIsRegenerating(true);
    try {
      let freshPlan = await generatePlanAPI(event.context);
      if (!freshPlan) {
        freshPlan = generateLocalPlan(event.context);
      }
      const updated = {
        ...event,
        plan: freshPlan,
        updatedAt: new Date().toISOString(),
      };
      handleUpdateEvent(updated);
    } catch {
      const fallback = generateLocalPlan(event.context);
      const updated = {
        ...event,
        plan: fallback,
        updatedAt: new Date().toISOString(),
      };
      handleUpdateEvent(updated);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-stone-500 text-sm">Loading event data...</p>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(event.context.basics.eventDate);
  const currency = event.context.budget.currency || 'INR';

  const TABS = [
    { key: 'overview', label: 'AI Overview', icon: Sparkles },
    { key: 'budget', label: 'Budget Planner', icon: DollarSign },
    { key: 'timeline', label: 'Smart Timeline', icon: Clock },
    { key: 'vendors', label: 'Vendors', icon: ShoppingBag },
    { key: 'guests', label: 'Guest List', icon: Users },
    { key: 'tasks', label: 'Checklist & Tasks', icon: ListTodo },
    { key: 'ideas', label: 'Idea Generator', icon: Lightbulb },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRegeneratePlan}
            disabled={isRegenerating}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            title="Re-run recommendation engine"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Recalculating...' : 'Regenerate Plan'}
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Export & Share
          </button>

          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete this event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Event Header Banner */}
      <div className="card p-6 border border-stone-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl">{getEventTypeEmoji(event.context.basics.eventType)}</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
                {event.context.basics.eventName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                {formatDate(event.context.basics.eventDate)}
              </span>

              {event.context.basics.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {event.context.basics.location}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                {event.context.basics.guestCount} Guests
              </span>

              <span className="flex items-center gap-1 font-semibold text-stone-700">
                <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                {formatCurrency(event.context.budget.totalBudget, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-center min-w-[100px]">
              <div className="text-[10px] uppercase font-bold text-stone-400">Time Left</div>
              <div
                className={`text-base font-extrabold ${
                  daysRemaining < 0
                    ? 'text-stone-400'
                    : daysRemaining === 0
                    ? 'text-red-600'
                    : daysRemaining < 14
                    ? 'text-amber-600'
                    : 'text-primary-700'
                }`}
              >
                {daysRemaining < 0 ? 'Past' : daysRemaining === 0 ? 'Today' : `${daysRemaining} Days`}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="flex items-center gap-1 overflow-x-auto pt-6 mt-6 border-t border-stone-100 no-print">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as TabKey)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content Area */}
      <div className="transition-opacity duration-200">
        {activeTab === 'overview' && (
          <PlanOverview event={event} onNavigateTab={t => handleTabChange(t as TabKey)} />
        )}
        {activeTab === 'budget' && (
          <BudgetPlanner event={event} onUpdateEvent={handleUpdateEvent} />
        )}
        {activeTab === 'timeline' && (
          <TimelineView event={event} onUpdateEvent={handleUpdateEvent} />
        )}
        {activeTab === 'vendors' && (
          <VendorManager event={event} onUpdateEvent={handleUpdateEvent} />
        )}
        {activeTab === 'guests' && (
          <GuestManager event={event} onUpdateEvent={handleUpdateEvent} />
        )}
        {activeTab === 'tasks' && (
          <TaskManager event={event} onUpdateEvent={handleUpdateEvent} />
        )}
        {activeTab === 'ideas' && (
          <IdeaGenerator event={event} onUpdateEvent={handleUpdateEvent} />
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        event={event}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Event"
        message={`Are you sure you want to permanently delete "${event.context.basics.eventName}"? All budget records, timelines, and guest lists will be erased.`}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        confirmLabel="Yes, Delete Permanently"
        variant="danger"
      />
    </div>
  );
}
