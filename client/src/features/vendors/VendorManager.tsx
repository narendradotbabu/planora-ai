import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Phone,
  Calendar,
  CheckCircle,
  FileText,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import type { SavedEvent, Vendor, VendorStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { generateId } from '../../services/storage';

interface VendorManagerProps {
  event: SavedEvent;
  onUpdateEvent: (updated: SavedEvent) => void;
}

const STATUS_CONFIG: Record<
  VendorStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  'to-research': { label: 'To Research', bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' },
  contacted: { label: 'Contacted', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'quote-received': { label: 'Quote Received', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  booked: { label: 'Booked / Contracted', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  paid: { label: 'Fully Settled', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export function VendorManager({ event, onUpdateEvent }: VendorManagerProps) {
  const [vendors, setVendors] = useState<Vendor[]>(event.vendors || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Vendor Form State
  const [category, setCategory] = useState<string>('Venue');
  const [businessName, setBusinessName] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [quotedAmount, setQuotedAmount] = useState<number>(0);
  const [status, setStatus] = useState<VendorStatus>('to-research');
  const [depositPaid, setDepositPaid] = useState<number>(0);
  const [deadline, setDeadline] = useState<string>(event.context.basics.eventDate);
  const [notes, setNotes] = useState<string>('');

  const currency = event.context.budget.currency || 'INR';

  // Calculations
  const totalCommitted = vendors
    .filter(v => v.status !== 'cancelled')
    .reduce((sum, v) => sum + (v.quotedAmount || 0), 0);
  const totalDeposits = vendors
    .filter(v => v.status !== 'cancelled')
    .reduce((sum, v) => sum + (v.depositPaid || 0), 0);
  const totalOutstanding = Math.max(0, totalCommitted - totalDeposits);

  const saveUpdatedVendors = (newVendors: Vendor[]) => {
    setVendors(newVendors);
    onUpdateEvent({
      ...event,
      vendors: newVendors,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const remainingPayment = Math.max(0, quotedAmount - depositPaid);
    const newVendor: Vendor = {
      id: generateId(),
      category,
      businessName: businessName.trim(),
      contactInfo: contactInfo.trim(),
      quotedAmount: Number(quotedAmount) || 0,
      status,
      depositPaid: Number(depositPaid) || 0,
      remainingPayment,
      notes: notes.trim(),
      deadline,
    };

    const updated = [...vendors, newVendor];
    saveUpdatedVendors(updated);

    // Reset
    setBusinessName('');
    setContactInfo('');
    setQuotedAmount(0);
    setDepositPaid(0);
    setNotes('');
    setIsAdding(false);
  };

  const handleDeleteVendor = (id: string) => {
    const updated = vendors.filter(v => v.id !== id);
    saveUpdatedVendors(updated);
  };

  const handleUpdateVendor = (id: string, updates: Partial<Vendor>) => {
    const updated = vendors.map(v => {
      if (v.id === id) {
        const quot = updates.quotedAmount !== undefined ? updates.quotedAmount : v.quotedAmount;
        const dep = updates.depositPaid !== undefined ? updates.depositPaid : v.depositPaid;
        return {
          ...v,
          ...updates,
          remainingPayment: Math.max(0, quot - dep),
        };
      }
      return v;
    });
    saveUpdatedVendors(updated);
    setEditingId(null);
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
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border border-stone-200">
          <div className="text-xs text-stone-500 font-medium mb-1">Total Vendor Commitments</div>
          <div className="text-xl font-bold text-stone-900">{formatCurrency(totalCommitted, currency)}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Sum of all non-cancelled quotes</div>
        </div>

        <div className="card p-4 border border-stone-200">
          <div className="text-xs text-stone-500 font-medium mb-1">Deposits / Advance Disbursed</div>
          <div className="text-xl font-bold text-emerald-700">{formatCurrency(totalDeposits, currency)}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Paid advances secured</div>
        </div>

        <div className="card p-4 border border-stone-200">
          <div className="text-xs text-stone-500 font-medium mb-1">Remaining Outstanding Balance</div>
          <div className="text-xl font-bold text-amber-700">{formatCurrency(totalOutstanding, currency)}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">Due on / after event day</div>
        </div>
      </div>

      {/* Main Vendor List Card */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Supplier & Vendor Directory</h3>
            <p className="text-xs text-stone-500">
              Manage quotes, booking contracts, and milestone disbursement dates.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Supplier / Vendor
          </button>
        </div>

        {/* Add Vendor Form */}
        {isAdding && (
          <form
            onSubmit={handleAddVendor}
            className="mb-6 p-4 rounded-xl border border-primary-200 bg-primary-50/40 space-y-3 text-xs"
          >
            <div className="font-semibold text-primary-900">Add Prospective or Booked Vendor</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label text-[11px]">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="input-field py-1.5 text-xs"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-[11px]">Business / Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. DreamShots Studio"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="input-field py-1.5 text-xs"
                  required
                />
              </div>

              <div>
                <label className="label text-[11px]">Phone / Email Contact</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={contactInfo}
                  onChange={e => setContactInfo(e.target.value)}
                  className="input-field py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="label text-[11px]">Quoted Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={quotedAmount}
                  onChange={e => setQuotedAmount(parseInt(e.target.value) || 0)}
                  className="input-field py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="label text-[11px]">Advance / Deposit Paid (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={depositPaid}
                  onChange={e => setDepositPaid(parseInt(e.target.value) || 0)}
                  className="input-field py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="label text-[11px]">Booking Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as VendorStatus)}
                  className="input-field py-1.5 text-xs"
                >
                  {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-[11px]">Payment / Contact Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="input-field py-1.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label text-[11px]">Contract Terms / Selection Criteria Notes</label>
              <textarea
                rows={2}
                placeholder="Key deliverables, cancellation clauses, meal arrangements for crew"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input-field py-1.5 text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-secondary py-1 px-3 text-xs"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary py-1 px-3 text-xs">
                Save Vendor
              </button>
            </div>
          </form>
        )}

        {/* Vendor Cards Grid */}
        {vendors.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            No vendors listed. Click "Add Supplier / Vendor" above to shortlist your partners.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map(v => {
              const cfg = STATUS_CONFIG[v.status] || STATUS_CONFIG['to-research'];
              const isEditing = editingId === v.id;

              if (isEditing) {
                return (
                  <div key={v.id} className="p-4 rounded-xl border border-primary-300 bg-primary-50/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">Edit Vendor</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            const name = (document.getElementById(`edit-vname-${v.id}`) as HTMLInputElement)?.value;
                            const contact = (document.getElementById(`edit-vcontact-${v.id}`) as HTMLInputElement)?.value;
                            const quot = parseInt((document.getElementById(`edit-vquot-${v.id}`) as HTMLInputElement)?.value) || 0;
                            const dep = parseInt((document.getElementById(`edit-vdep-${v.id}`) as HTMLInputElement)?.value) || 0;
                            const st = (document.getElementById(`edit-vstatus-${v.id}`) as HTMLSelectElement)?.value as VendorStatus;
                            handleUpdateVendor(v.id, {
                              businessName: name,
                              contactInfo: contact,
                              quotedAmount: quot,
                              depositPaid: dep,
                              status: st,
                            });
                          }}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-stone-400 hover:bg-stone-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      id={`edit-vname-${v.id}`}
                      defaultValue={v.businessName}
                      className="input-field py-1 text-xs"
                      placeholder="Name"
                    />
                    <input
                      id={`edit-vcontact-${v.id}`}
                      defaultValue={v.contactInfo}
                      className="input-field py-1 text-xs"
                      placeholder="Contact Info"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        id={`edit-vquot-${v.id}`}
                        type="number"
                        defaultValue={v.quotedAmount}
                        className="input-field py-1 text-xs"
                        placeholder="Quote"
                      />
                      <input
                        id={`edit-vdep-${v.id}`}
                        type="number"
                        defaultValue={v.depositPaid}
                        className="input-field py-1 text-xs"
                        placeholder="Deposit"
                      />
                      <select
                        id={`edit-vstatus-${v.id}`}
                        defaultValue={v.status}
                        className="input-field py-1 text-xs"
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, c]) => (
                          <option key={k} value={k}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={v.id}
                  className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                        {v.category}
                      </span>
                      <h4 className="font-bold text-stone-900 text-sm mt-1">{v.businessName}</h4>
                      {v.contactInfo && (
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {v.contactInfo}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {/* Financial Mini Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100 text-[11px]">
                    <div>
                      <div className="text-stone-400">Quoted</div>
                      <div className="font-semibold text-stone-800">
                        {formatCurrency(v.quotedAmount, currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-400">Deposit Paid</div>
                      <div className="font-semibold text-emerald-700">
                        {formatCurrency(v.depositPaid, currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-400">Outstanding</div>
                      <div className="font-semibold text-amber-700">
                        {formatCurrency(v.remainingPayment, currency)}
                      </div>
                    </div>
                  </div>

                  {v.notes && (
                    <div className="text-xs text-stone-500 bg-stone-50/60 p-2 rounded border border-stone-100 leading-snug">
                      <span className="font-medium text-stone-700">Notes: </span>
                      {v.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      Target: {formatDate(v.deadline)}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(v.id)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100"
                        title="Edit vendor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(v.id)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="Delete vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
