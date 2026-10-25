import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Check,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import type { SavedEvent, TimelinePhase, TimelineTask } from '../../types';
import { formatDate, getDaysRemaining } from '../../utils/helpers';
import { generateId } from '../../services/storage';

interface TimelineViewProps {
  event: SavedEvent;
  onUpdateEvent: (updated: SavedEvent) => void;
}

export function TimelineView({ event, onUpdateEvent }: TimelineViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newTaskPhase, setNewTaskPhase] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>(event.context.basics.eventDate);
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [showAddTask, setShowAddTask] = useState<boolean>(false);

  const phases: TimelinePhase[] = event.plan?.timeline || [];
  const eventDate = event.context.basics.eventDate;
  const daysRemaining = getDaysRemaining(eventDate);
  const isPast = daysRemaining <= 0;

  // Track task completions
  const completedTaskIds = new Set(
    event.tasks.filter(t => t.status === 'completed').map(t => t.id)
  );

  const toggleTaskCompletion = (task: TimelineTask, phaseTitle: string) => {
    const isCompleted = completedTaskIds.has(task.id);
    let updatedTasks = [...event.tasks];

    const existingIndex = updatedTasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      updatedTasks[existingIndex] = {
        ...updatedTasks[existingIndex],
        status: isCompleted ? 'pending' : 'completed',
      };
    } else {
      updatedTasks.push({
        id: task.id,
        title: task.task,
        description: `Timeline task from ${phaseTitle}`,
        priority: task.priority,
        status: isCompleted ? 'pending' : 'completed',
        dueDate: task.dueDate,
        assignedTo: 'Lead Organizer',
        category: phaseTitle,
      });
    }

    onUpdateEvent({
      ...event,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const targetPhaseName = newTaskPhase || (phases[0]?.phase ?? 'General Planning');
    const newTask: TimelineTask = {
      id: generateId(),
      task: newTaskTitle.trim(),
      dueDate: newTaskDueDate || eventDate,
      priority: newTaskPriority,
      status: 'pending',
    };

    let updatedTimeline = phases.map(phase => {
      if (phase.phase === targetPhaseName) {
        return {
          ...phase,
          tasks: [...phase.tasks, newTask],
        };
      }
      return phase;
    });

    if (!phases.some(p => p.phase === targetPhaseName)) {
      updatedTimeline.push({
        phase: targetPhaseName,
        startDate: new Date().toISOString().split('T')[0],
        endDate: eventDate,
        tasks: [newTask],
      });
    }

    const updatedTasks = [
      ...event.tasks,
      {
        id: newTask.id,
        title: newTask.task,
        description: `Custom timeline task for ${targetPhaseName}`,
        priority: newTask.priority,
        status: 'pending' as const,
        dueDate: newTask.dueDate,
        assignedTo: 'Lead Organizer',
        category: targetPhaseName,
      },
    ];

    onUpdateEvent({
      ...event,
      plan: event.plan ? { ...event.plan, timeline: updatedTimeline } : undefined,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    });

    setNewTaskTitle('');
    setShowAddTask(false);
  };

  // Filter logic
  const filterTask = (task: TimelineTask) => {
    const isCompleted = completedTaskIds.has(task.id);
    const taskDays = getDaysRemaining(task.dueDate);
    const isOverdue = !isCompleted && taskDays < 0;

    if (filterStatus === 'completed' && !isCompleted) return false;
    if (filterStatus === 'pending' && isCompleted) return false;
    if (filterStatus === 'overdue' && !isOverdue) return false;

    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

    return true;
  };

  return (
    <div className="space-y-6">
      {/* Retrospective alert for past events */}
      {isPast && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs md:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900">Event Date Has Passed</div>
            <div className="text-amber-700 mt-0.5">
              This event occurred on {formatDate(eventDate)}. All deadlines are displayed retrospectively. You can use this timeline for post-event audit or modify the event date in settings.
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Filters & Add Action */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input-field py-1 px-2.5 text-xs w-auto bg-stone-50 border-stone-200"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed Only</option>
            <option value="overdue">Overdue Deadlines</option>
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="input-field py-1 px-2.5 text-xs w-auto bg-stone-50 border-stone-200"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Custom Milestone
        </button>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <form
          onSubmit={handleAddNewTask}
          className="card p-4 bg-primary-50/40 border border-primary-200 space-y-3 text-xs"
        >
          <div className="font-semibold text-primary-900">Add Milestone / Task to Timeline</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="label text-[11px]">Task Description</label>
              <input
                type="text"
                placeholder="e.g. Confirm floral centerpiece prototypes"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="input-field py-1.5 text-xs"
                required
              />
            </div>

            <div>
              <label className="label text-[11px]">Target Phase</label>
              <select
                value={newTaskPhase}
                onChange={e => setNewTaskPhase(e.target.value)}
                className="input-field py-1.5 text-xs"
              >
                {phases.map(p => (
                  <option key={p.phase} value={p.phase}>
                    {p.phase}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label text-[11px]">Due Date</label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={e => setNewTaskDueDate(e.target.value)}
                max={eventDate}
                className="input-field py-1.5 text-xs"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500">Priority:</span>
              {(['high', 'medium', 'low'] as const).map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setNewTaskPriority(p)}
                  className={`px-2 py-0.5 rounded text-[11px] capitalize border ${
                    newTaskPriority === p
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                className="btn-secondary py-1 px-3 text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary py-1 px-3 text-xs">
                Save Task
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Timeline Phases Container */}
      <div className="space-y-6">
        {phases.map((phase, pIdx) => {
          const visibleTasks = phase.tasks.filter(filterTask);
          if (visibleTasks.length === 0 && (filterStatus !== 'all' || filterPriority !== 'all')) {
            return null;
          }

          return (
            <div key={pIdx} className="card p-6 border border-stone-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{phase.phase}</h3>
                  <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      Window: {formatDate(phase.startDate)} – {formatDate(phase.endDate)}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                  {phase.tasks.filter(t => completedTaskIds.has(t.id)).length} / {phase.tasks.length} Completed
                </span>
              </div>

              {/* Tasks in Phase */}
              <div className="space-y-2">
                {visibleTasks.map(task => {
                  const isCompleted = completedTaskIds.has(task.id);
                  const daysToTask = getDaysRemaining(task.dueDate);
                  const isOverdue = !isCompleted && daysToTask < 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskCompletion(task, phase.phase)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isCompleted
                          ? 'bg-stone-50/70 border-stone-200 opacity-60'
                          : isOverdue
                          ? 'bg-red-50/40 border-red-200 hover:bg-red-50/70'
                          : 'bg-white border-stone-200 hover:border-primary-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition flex-shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'border border-stone-300 hover:border-primary-500'
                          }`}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs md:text-sm font-medium ${
                              isCompleted
                                ? 'line-through text-stone-400'
                                : 'text-stone-900'
                            }`}
                          >
                            {task.task}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Due Date & Overdue Tag */}
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue
                              ? 'text-red-600 font-bold'
                              : isCompleted
                              ? 'text-stone-400'
                              : 'text-stone-600'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                          {isOverdue && (
                            <span className="ml-1 text-[10px] bg-red-100 text-red-700 px-1 rounded">
                              Overdue!
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
