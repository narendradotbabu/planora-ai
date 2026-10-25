import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Calendar, DollarSign, Clock, TrendingUp, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { loadEvents, deleteEvent } from '../services/storage';
import { formatCurrency, getDaysRemaining, formatDate, getEventTypeLabel, getEventTypeEmoji } from '../utils/helpers';
import { EmptyState } from '../components/EmptyState';
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { SavedEvent } from '../types';

const CHART_COLORS = ['#7c3aed', '#d946ef', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e'];

export function DashboardPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<SavedEvent[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const handleDelete = () => {
    if (deleteId) {
      deleteEvent(deleteId);
      setEvents(loadEvents());
      setDeleteId(null);
    }
  };

  const upcomingEvents = events.filter(e => getDaysRemaining(e.context.basics.eventDate) > 0)
    .sort((a, b) => new Date(a.context.basics.eventDate).getTime() - new Date(b.context.basics.eventDate).getTime());
  const totalBudget = events.reduce((sum, e) => sum + e.context.budget.totalBudget, 0);
  const totalSpent = events.reduce((sum, e) => {
    return sum + e.budgetItems.reduce((s, item) => s + item.actualAmount, 0);
  }, 0);

  // Budget by event type for chart
  const budgetByType = events.reduce((acc, e) => {
    const type = getEventTypeLabel(e.context.basics.eventType);
    acc[type] = (acc[type] || 0) + e.context.budget.totalBudget;
    return acc;
  }, {} as Record<string, number>);
  const chartData = Object.entries(budgetByType).map(([name, value]) => ({ name, value }));

  // Calculate progress for each event
  const getProgress = (event: SavedEvent): number => {
    const totalTasks = event.tasks.length;
    if (totalTasks === 0) return event.plan ? 15 : 0;
    const completed = event.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / totalTasks) * 100);
  };

  // Upcoming deadlines across all events
  const upcomingDeadlines = events
    .flatMap(e => e.tasks
      .filter(t => t.status !== 'completed' && getDaysRemaining(t.dueDate) >= 0)
      .map(t => ({ ...t, eventName: e.context.basics.eventName, eventId: e.id }))
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  if (events.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <EmptyState
          icon={Sparkles}
          title="Welcome to Planora AI"
          description="You haven't created any events yet. Start planning your first wedding, birthday party, or community event!"
          action={{ label: 'Create Your First Event', onClick: () => navigate('/create') }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-600 mt-1">Overview of all your events</p>
        </div>
        <button onClick={() => navigate('/create')} className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          New Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Total Events</p>
              <p className="text-2xl font-bold text-stone-900">{events.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Upcoming</p>
              <p className="text-2xl font-bold text-stone-900">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Total Budget</p>
              <p className="text-2xl font-bold text-stone-900">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-stone-600">Total Spent</p>
              <p className="text-2xl font-bold text-stone-900">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">Your Events</h2>
          {events.map(event => {
            const days = getDaysRemaining(event.context.basics.eventDate);
            const progress = getProgress(event);
            return (
              <div key={event.id} className="card hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate(`/event/${event.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getEventTypeEmoji(event.context.basics.eventType)}</span>
                      <h3 className="text-lg font-semibold text-stone-900 group-hover:text-primary-700">
                        {event.context.basics.eventName}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(event.context.basics.eventDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {formatCurrency(event.context.budget.totalBudget)}
                      </span>
                      <span className={`font-medium ${days < 0 ? 'text-stone-400' : days < 7 ? 'text-red-600' : days < 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {days < 0 ? 'Past event' : days === 0 ? 'Today!' : `${days} days left`}
                      </span>
                    </div>
                    <ProgressBar value={progress} label="Planning progress" />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(event.id); }}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      aria-label="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-primary-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Chart */}
          {chartData.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-stone-900 mb-4">Budget by Event Type</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={4}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {chartData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-stone-700">{d.name}</span>
                    </div>
                    <span className="font-medium text-stone-900">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          <div className="card">
            <h3 className="font-semibold text-stone-900 mb-4">Upcoming Deadlines</h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-stone-500">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 cursor-pointer hover:bg-stone-50 p-2 rounded-lg -mx-2"
                    onClick={() => navigate(`/event/${task.eventId}/tasks`)}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-stone-400'}`} />
                    <div>
                      <p className="text-sm font-medium text-stone-800">{task.title}</p>
                      <p className="text-xs text-stone-500">{task.eventName} • {formatDate(task.dueDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Event"
        message="Are you sure you want to delete this event? All associated data will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Delete Event"
        variant="danger"
      />
    </div>
  );
}
