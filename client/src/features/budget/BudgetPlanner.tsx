import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Lightbulb,
  TrendingDown,
  PieChart as PieChartIcon,
  Check,
  X,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { SavedEvent, BudgetItem } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { generateLocalBudgetRecommendations } from '../../services/localPlanningEngine';
import { generateId } from '../../services/storage';

interface BudgetPlannerProps {
  event: SavedEvent;
  onUpdateEvent: (updated: SavedEvent) => void;
}

const PALETTE = [
  '#7c3aed',
  '#d946ef',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#84cc16',
  '#64748b',
];

export function BudgetPlanner({ event, onUpdateEvent }: BudgetPlannerProps) {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(event.budgetItems || []);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // New Item State
  const [newItemCategory, setNewItemCategory] = useState<string>('Catering');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemEstimated, setNewItemEstimated] = useState<number>(0);
  const [newItemQuoted, setNewItemQuoted] = useState<number>(0);
  const [newItemActual, setNewItemActual] = useState<number>(0);
  const [newItemNotes, setNewItemNotes] = useState<string>('');

  const totalBudget = event.context.budget.totalBudget;
  const currency = event.context.budget.currency || 'INR';

  // Derived Totals
  const totalEstimated = budgetItems.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0);
  const totalCommitted = budgetItems.reduce((sum, item) => sum + (item.quotedAmount || 0), 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
  const remainingBalance = totalBudget - Math.max(totalCommitted, totalActual);

  // Grouped by Category for breakdown & chart
  const categorySummary = budgetItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { estimated: 0, quoted: 0, actual: 0 };
    }
    acc[item.category].estimated += item.estimatedAmount || 0;
    acc[item.category].quoted += item.quotedAmount || 0;
    acc[item.category].actual += item.actualAmount || 0;
    return acc;
  }, {} as Record<string, { estimated: number; quoted: number; actual: number }>);

  const chartData = Object.entries(categorySummary).map(([name, data]) => ({
    name,
    value: Math.max(data.estimated, data.actual, 1),
    actual: data.actual,
  }));

  // Budget allocations & savings tips from rule engine
  const currentCategoryAllocations = Object.fromEntries(
    Object.entries(categorySummary).map(([cat, val]) => [cat, val.estimated])
  );
  const recommendations = generateLocalBudgetRecommendations(
    event.context,
    currentCategoryAllocations
  );

  const saveUpdatedItems = (newItems: BudgetItem[]) => {
    setBudgetItems(newItems);
    onUpdateEvent({
      ...event,
      budgetItems: newItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const item: BudgetItem = {
      id: generateId(),
      category: newItemCategory,
      name: newItemName.trim(),
      estimatedAmount: Number(newItemEstimated) || 0,
      quotedAmount: Number(newItemQuoted) || 0,
      actualAmount: Number(newItemActual) || 0,
      notes: newItemNotes.trim(),
    };

    const updated = [...budgetItems, item];
    saveUpdatedItems(updated);

    // Reset Form
    setNewItemName('');
    setNewItemEstimated(0);
    setNewItemQuoted(0);
    setNewItemActual(0);
    setNewItemNotes('');
    setIsAddingItem(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = budgetItems.filter(item => item.id !== id);
    saveUpdatedItems(updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<BudgetItem>) => {
    const updated = budgetItems.map(item => (item.id === id ? { ...item, ...updates } : item));
    saveUpdatedItems(updated);
    setEditingItemId(null);
  };

  const categories = [
    'Venue',
    'Catering',
    'Decoration',
    'Photography & Videography',
    'Entertainment',
    'Invitations',
    'Clothing & Styling',
    'Transportation',
    'Equipment',
    'Miscellaneous',
    'Contingency',
  ];

  return (
    <div className="space-y-6">
      {/* Financial Health Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-white border border-stone-200">
          <div className="text-xs font-medium text-stone-500 mb-1">Total Budget Cap</div>
          <div className="text-xl font-bold text-stone-900">{formatCurrency(totalBudget, currency)}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">{event.context.budget.budgetType} limit</div>
        </div>

        <div className="card p-4 bg-white border border-stone-200">
          <div className="text-xs font-medium text-stone-500 mb-1">Estimated Expenses</div>
          <div className="text-xl font-bold text-primary-700">{formatCurrency(totalEstimated, currency)}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Sum of planned allocations</div>
        </div>

        <div className="card p-4 bg-white border border-stone-200">
          <div className="text-xs font-medium text-stone-500 mb-1">Committed / Quoted</div>
          <div className="text-xl font-bold text-amber-700">{formatCurrency(totalCommitted, currency)}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Signed vendor contracts</div>
        </div>

        <div className="card p-4 bg-white border border-stone-200">
          <div className="text-xs font-medium text-stone-500 mb-1">Remaining Balance</div>
          <div
            className={`text-xl font-bold ${
              remainingBalance < 0 ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {formatCurrency(remainingBalance, currency)}
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            {remainingBalance < 0 ? 'Over budget!' : 'Safe headroom'}
          </div>
        </div>
      </div>

      {/* Warnings Banner if Over Budget */}
      {recommendations.warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs md:text-sm space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Budget Optimization Alerts:
          </div>
          {recommendations.warnings.map((w, idx) => (
            <div key={idx} className="text-amber-800">
              • {w}
            </div>
          ))}
        </div>
      )}

      {/* Visual Chart & Categories Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="card p-6 flex flex-col justify-between">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
            <PieChartIcon className="w-4 h-4 text-primary-600" />
            Category Allocation Share
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.length > 0 ? chartData : [{ name: 'Unassigned', value: 100 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => formatCurrency(val, currency)}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-stone-400">
            *Visualizes relative proportion of planned expenditure
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-bold text-stone-900 text-sm mb-3">Planned vs. Actual by Category</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 font-semibold">Category</th>
                  <th className="pb-2 font-semibold text-right">Planned Target</th>
                  <th className="pb-2 font-semibold text-right">Committed</th>
                  <th className="pb-2 font-semibold text-right">Actual Paid</th>
                  <th className="pb-2 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {event.plan?.budgetAllocation.map((alloc, idx) => {
                  const current = categorySummary[alloc.category] || { estimated: 0, quoted: 0, actual: 0 };
                  const isOver = current.quoted > alloc.amount && alloc.amount > 0;
                  return (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-2 font-medium text-stone-800">{alloc.category}</td>
                      <td className="py-2 text-right font-semibold text-stone-700">
                        {formatCurrency(alloc.amount, currency)} ({alloc.percentage}%)
                      </td>
                      <td className="py-2 text-right text-stone-600">
                        {formatCurrency(current.quoted, currency)}
                      </td>
                      <td className="py-2 text-right text-stone-900 font-medium">
                        {formatCurrency(current.actual, currency)}
                      </td>
                      <td className="py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOver
                              ? 'bg-red-100 text-red-700'
                              : current.actual > 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {isOver ? 'Over' : current.actual > 0 ? 'Active' : 'Planned'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Itemized Expenses Table with Add/Edit/Delete */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Itemized Expense Ledger</h3>
            <p className="text-xs text-stone-500">
              Track granular quotes, receipts, and deposits with precision.
            </p>
          </div>
          <button
            onClick={() => setIsAddingItem(true)}
            className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Expense Line
          </button>
        </div>

        {/* Add Item Modal / Inline Card */}
        {isAddingItem && (
          <form
            onSubmit={handleAddItem}
            className="mb-6 p-4 rounded-xl border border-primary-200 bg-primary-50/30 space-y-3"
          >
            <div className="font-semibold text-xs text-primary-900">Add New Expense Item</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="label text-[11px]">Category</label>
                <select
                  value={newItemCategory}
                  onChange={e => setNewItemCategory(e.target.value)}
                  className="input-field py-1.5 text-xs"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="label text-[11px]">Item / Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Banquet hall booking deposit"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="input-field py-1.5 text-xs"
                  required
                />
              </div>

              <div>
                <label className="label text-[11px]">Estimated Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newItemEstimated}
                  onChange={e => setNewItemEstimated(parseInt(e.target.value) || 0)}
                  className="input-field py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="label text-[11px]">Quoted / Committed (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newItemQuoted}
                  onChange={e => setNewItemQuoted(parseInt(e.target.value) || 0)}
                  className="input-field py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="label text-[11px]">Actual Paid (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={newItemActual}
                  onChange={e => setNewItemActual(parseInt(e.target.value) || 0)}
                  className="input-field py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="label text-[11px]">Notes / Invoice Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Receipt #1043"
                  value={newItemNotes}
                  onChange={e => setNewItemNotes(e.target.value)}
                  className="input-field py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="btn-secondary py-1 px-3 text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary py-1 px-3 text-xs">
                Save Expense Line
              </button>
            </div>
          </form>
        )}

        {/* Expenses List */}
        {budgetItems.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            No expenses itemized yet. Click "Add Expense Line" above to add your first expense.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 font-semibold">Item & Category</th>
                  <th className="pb-2 font-semibold text-right">Estimated</th>
                  <th className="pb-2 font-semibold text-right">Quoted</th>
                  <th className="pb-2 font-semibold text-right">Actual Paid</th>
                  <th className="pb-2 font-semibold">Notes</th>
                  <th className="pb-2 font-semibold text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {budgetItems.map(item => {
                  const isEditing = editingItemId === item.id;
                  if (isEditing) {
                    return (
                      <tr key={item.id} className="bg-primary-50/40">
                        <td className="py-2">
                          <input
                            type="text"
                            defaultValue={item.name}
                            id={`edit-name-${item.id}`}
                            className="input-field py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 text-right">
                          <input
                            type="number"
                            defaultValue={item.estimatedAmount}
                            id={`edit-est-${item.id}`}
                            className="input-field py-1 text-xs text-right w-24"
                          />
                        </td>
                        <td className="py-2 text-right">
                          <input
                            type="number"
                            defaultValue={item.quotedAmount}
                            id={`edit-quot-${item.id}`}
                            className="input-field py-1 text-xs text-right w-24"
                          />
                        </td>
                        <td className="py-2 text-right">
                          <input
                            type="number"
                            defaultValue={item.actualAmount}
                            id={`edit-act-${item.id}`}
                            className="input-field py-1 text-xs text-right w-24"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="text"
                            defaultValue={item.notes}
                            id={`edit-notes-${item.id}`}
                            className="input-field py-1 text-xs"
                          />
                        </td>
                        <td className="py-2 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              const name = (document.getElementById(`edit-name-${item.id}`) as HTMLInputElement)?.value;
                              const est = parseInt((document.getElementById(`edit-est-${item.id}`) as HTMLInputElement)?.value) || 0;
                              const quot = parseInt((document.getElementById(`edit-quot-${item.id}`) as HTMLInputElement)?.value) || 0;
                              const act = parseInt((document.getElementById(`edit-act-${item.id}`) as HTMLInputElement)?.value) || 0;
                              const notes = (document.getElementById(`edit-notes-${item.id}`) as HTMLInputElement)?.value;
                              handleUpdateItem(item.id, {
                                name,
                                estimatedAmount: est,
                                quotedAmount: quot,
                                actualAmount: act,
                                notes,
                              });
                            }}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 text-stone-400 hover:bg-stone-100 rounded ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60">
                      <td className="py-2.5">
                        <div className="font-semibold text-stone-900">{item.name}</div>
                        <div className="text-[11px] text-stone-500">{item.category}</div>
                      </td>
                      <td className="py-2.5 text-right font-medium text-stone-600">
                        {formatCurrency(item.estimatedAmount, currency)}
                      </td>
                      <td className="py-2.5 text-right font-medium text-stone-800">
                        {formatCurrency(item.quotedAmount, currency)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-stone-900">
                        {formatCurrency(item.actualAmount, currency)}
                      </td>
                      <td className="py-2.5 text-stone-500 text-[11px] max-w-xs truncate">
                        {item.notes || '—'}
                      </td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditingItemId(item.id)}
                          className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Practical Cost-Saving Alternatives (Respecting User Priorities) */}
      <div className="card p-6 bg-gradient-to-br from-amber-50/50 via-white to-primary-50/30">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-stone-900 text-sm">
            Practical Cost-Saving Alternatives (Priorities Protected)
          </h3>
        </div>
        <p className="text-xs text-stone-500 mb-4">
          The planning engine automatically protects your stated priorities (
          <span className="font-medium text-stone-800">
            {event.context.budget.spendingPriorities.join(', ') || 'None selected'}
          </span>
          ) and recommends savings on flexible non-core categories.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.savingsTips.map((tip, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-stone-900 text-xs">{tip.category}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {tip.potentialSaving}
                </span>
              </div>
              <p className="text-xs text-stone-600 mb-1.5">{tip.suggestion}</p>
              <div className="text-[11px] text-stone-400">
                <span className="font-medium text-stone-600">Trade-off: </span>
                {tip.tradeoff}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
