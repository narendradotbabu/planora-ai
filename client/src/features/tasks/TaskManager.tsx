import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Filter,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { SavedEvent, Task } from '../../types';
import { formatDate, getDaysRemaining } from '../../utils/helpers';
import { generateId } from '../../services/storage';

interface TaskManagerProps {
  event: SavedEvent;
  onUpdateEvent: (updated: SavedEvent) => void;
}

export function TaskManager({ event, onUpdateEvent }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(event.tasks || []);
  const [isAdding, setIsAdding] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState(event.context.basics.eventDate);
  const [assignedTo, setAssignedTo] = useState('Lead Coordinator');
  const [category, setCategory] = useState('Operations');

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    onUpdateEvent({
      ...event,
      tasks: newTasks,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'pending',
      dueDate,
      assignedTo: assignedTo.trim() || 'Volunteer',
      category: category.trim() || 'Logistics',
    };

    saveTasks([...tasks, newTask]);
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  const toggleTask = (id: string) => {
    saveTasks(
      tasks.map(t =>
        t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
      )
    );
  };

  const handleDelete = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    if (filterStatus === 'pending' && t.status === 'completed') return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Task Completion Progress Card */}
      <div className="card p-6 border border-stone-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Execution Checklist & Assignments</h3>
            <p className="text-xs text-stone-500">
              Assigned duties across {event.context.constraints.availableHelpers || 1} available helper(s) / volunteers.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xl font-bold text-primary-700">{progressPct}%</span>
            <div className="text-xs text-stone-400">
              {completedCount} of {tasks.length} tasks done
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input-field py-1 px-2.5 text-xs w-auto bg-stone-50 border-stone-200"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="input-field py-1 px-2.5 text-xs w-auto bg-stone-50 border-stone-200"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Assign New Task
        </button>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleAddTask}
          className="card p-4 bg-primary-50/40 border border-primary-200 space-y-3 text-xs"
        >
          <div className="font-semibold text-primary-900">Create & Assign Responsibility</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="label text-[11px]">Task Summary</label>
              <input
                type="text"
                placeholder="e.g. Set up registration tent and sound check"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input-field py-1.5 text-xs"
                required
              />
            </div>

            <div>
              <label className="label text-[11px]">Assigned Person / Volunteer</label>
              <input
                type="text"
                placeholder="e.g. Priya (Logistics lead)"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="input-field py-1.5 text-xs"
              />
            </div>

            <div>
              <label className="label text-[11px]">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="input-field py-1.5 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label text-[11px]">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="input-field py-1.5 text-xs"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="label text-[11px]">Instructions / Contingency Notes</label>
              <input
                type="text"
                placeholder="e.g. Ensure extension cords are taped down for safety"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary py-1 px-3 text-xs">
              Assign Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-8 text-stone-400 text-xs">
            No tasks found matching criteria. Click "Assign New Task" to create one.
          </div>
        ) : (
          filteredTasks.map(t => {
            const isDone = t.status === 'completed';
            const daysToDue = getDaysRemaining(t.dueDate);
            const isOverdue = !isDone && daysToDue < 0;

            return (
              <div
                key={t.id}
                className={`card p-4 flex items-start justify-between gap-3 transition ${
                  isDone
                    ? 'bg-stone-50/70 border-stone-200 opacity-60'
                    : isOverdue
                    ? 'border-red-200 bg-red-50/20'
                    : 'border-stone-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleTask(t.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition flex-shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : 'border border-stone-300 hover:border-primary-500'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-0.5">
                    <h4
                      className={`text-sm font-semibold ${
                        isDone ? 'line-through text-stone-400' : 'text-stone-900'
                      }`}
                    >
                      {t.title}
                    </h4>
                    {t.description && (
                      <p className="text-xs text-stone-500 leading-snug">{t.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-stone-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-stone-400" />
                        {t.assignedTo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        Due {formatDate(t.dueDate)}
                        {isOverdue && (
                          <span className="text-red-600 font-bold ml-1">(Overdue)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      t.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : t.priority === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {t.priority}
                  </span>

                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
