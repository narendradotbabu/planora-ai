import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  Utensils,
  MapPin,
  Filter,
} from 'lucide-react';
import type { SavedEvent, Guest } from '../../types';
import { generateId } from '../../services/storage';

interface GuestManagerProps {
  event: SavedEvent;
  onUpdateEvent: (updated: SavedEvent) => void;
}

export function GuestManager({ event, onUpdateEvent }: GuestManagerProps) {
  const [guests, setGuests] = useState<Guest[]>(event.guests || []);
  const [isAdding, setIsAdding] = useState(false);
  const [filterRSVP, setFilterRSVP] = useState<string>('all');

  // Form State
  const [name, setName] = useState<string>('');
  const [rsvpStatus, setRsvpStatus] = useState<Guest['rsvpStatus']>('pending');
  const [dietaryRequirements, setDietaryRequirements] = useState<string>('');
  const [seatingGroup, setSeatingGroup] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const targetCount = event.context.basics.guestCount;

  // Counts
  const confirmedCount = guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const pendingCount = guests.filter(g => g.rsvpStatus === 'pending').length;
  const declinedCount = guests.filter(g => g.rsvpStatus === 'declined').length;
  const maybeCount = guests.filter(g => g.rsvpStatus === 'maybe').length;

  const saveGuests = (newGuests: Guest[]) => {
    setGuests(newGuests);
    onUpdateEvent({
      ...event,
      guests: newGuests,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGuest: Guest = {
      id: generateId(),
      name: name.trim(),
      rsvpStatus,
      dietaryRequirements: dietaryRequirements.trim(),
      seatingGroup: seatingGroup.trim() || 'General Seating',
      notes: notes.trim(),
    };

    saveGuests([...guests, newGuest]);
    setName('');
    setDietaryRequirements('');
    setSeatingGroup('');
    setNotes('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    saveGuests(guests.filter(g => g.id !== id));
  };

  const handleStatusChange = (id: string, status: Guest['rsvpStatus']) => {
    saveGuests(guests.map(g => (g.id === id ? { ...g, rsvpStatus: status } : g)));
  };

  const filteredGuests = guests.filter(g => {
    if (filterRSVP !== 'all' && g.rsvpStatus !== filterRSVP) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* RSVP Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card p-3.5 border border-stone-200">
          <div className="text-stone-400 text-xs">Target Headcount</div>
          <div className="text-xl font-bold text-stone-900 mt-0.5">{targetCount}</div>
          <div className="text-[10px] text-stone-400">Total anticipated</div>
        </div>

        <div className="card p-3.5 border border-stone-200">
          <div className="text-emerald-600 text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Confirmed
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-0.5">{confirmedCount}</div>
          <div className="text-[10px] text-stone-400">Guaranteed attending</div>
        </div>

        <div className="card p-3.5 border border-stone-200">
          <div className="text-amber-600 text-xs font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending RSVP
          </div>
          <div className="text-xl font-bold text-amber-700 mt-0.5">{pendingCount}</div>
          <div className="text-[10px] text-stone-400">Awaiting response</div>
        </div>

        <div className="card p-3.5 border border-stone-200">
          <div className="text-blue-600 text-xs font-medium flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Tentative / Maybe
          </div>
          <div className="text-xl font-bold text-blue-700 mt-0.5">{maybeCount}</div>
          <div className="text-[10px] text-stone-400">Uncertain schedule</div>
        </div>

        <div className="card p-3.5 border border-stone-200">
          <div className="text-red-600 text-xs font-medium flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Declined
          </div>
          <div className="text-xl font-bold text-red-700 mt-0.5">{declinedCount}</div>
          <div className="text-[10px] text-stone-400">Unable to attend</div>
        </div>
      </div>

      {/* Main Guest Directory Card */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Guest Roster & RSVP Tracker</h3>
            <p className="text-xs text-stone-500">
              Only necessary dietary and seating notes are retained for guest privacy.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={filterRSVP}
                onChange={e => setFilterRSVP(e.target.value)}
                className="input-field py-1 px-2.5 text-xs w-auto bg-stone-50 border-stone-200"
              >
                <option value="all">All Responses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="maybe">Maybe</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            <button
              onClick={() => setIsAdding(true)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Guest / Group
            </button>
          </div>
        </div>

        {/* Add Guest Form */}
        {isAdding && (
          <form
            onSubmit={handleAddGuest}
            className="mb-6 p-4 rounded-xl border border-primary-200 bg-primary-50/40 space-y-3 text-xs"
          >
            <div className="font-semibold text-primary-900">Add Guest or Party</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="label text-[11px]">Guest Name / Party Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh & Family (4)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field py-1.5 text-xs"
                  required
                />
              </div>

              <div>
                <label className="label text-[11px]">RSVP Status</label>
                <select
                  value={rsvpStatus}
                  onChange={e => setRsvpStatus(e.target.value as Guest['rsvpStatus'])}
                  className="input-field py-1.5 text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="maybe">Tentative / Maybe</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="label text-[11px]">Seating / Cluster Table</label>
                <input
                  type="text"
                  placeholder="e.g. Table 4 / College Friends"
                  value={seatingGroup}
                  onChange={e => setSeatingGroup(e.target.value)}
                  className="input-field py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label text-[11px]">Dietary Accommodations (if needed)</label>
                <input
                  type="text"
                  placeholder="e.g. Strict vegan, nut allergy, Jain vegetarian"
                  value={dietaryRequirements}
                  onChange={e => setDietaryRequirements(e.target.value)}
                  className="input-field py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="label text-[11px]">Operational Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Requires ground floor seating ramp"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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
                Save to Roster
              </button>
            </div>
          </form>
        )}

        {/* Guests Table */}
        {filteredGuests.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            No guest records match current filter. Click "Add Guest / Group" to build your list.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-2 font-semibold">Guest / Party Name</th>
                  <th className="pb-2 font-semibold">RSVP Status</th>
                  <th className="pb-2 font-semibold">Seating Group</th>
                  <th className="pb-2 font-semibold">Dietary & Accessibility</th>
                  <th className="pb-2 font-semibold">Notes</th>
                  <th className="pb-2 font-semibold text-right w-16">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredGuests.map(g => (
                  <tr key={g.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 font-semibold text-stone-900">{g.name}</td>
                    <td className="py-2.5">
                      <select
                        value={g.rsvpStatus}
                        onChange={e => handleStatusChange(g.id, e.target.value as Guest['rsvpStatus'])}
                        className={`text-xs font-semibold rounded-md px-2 py-0.5 border ${
                          g.rsvpStatus === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : g.rsvpStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : g.rsvpStatus === 'maybe'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="maybe">Maybe</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>
                    <td className="py-2.5 text-stone-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {g.seatingGroup || 'General'}
                      </span>
                    </td>
                    <td className="py-2.5 text-stone-600">
                      {g.dietaryRequirements ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Utensils className="w-3 h-3 text-amber-600" />
                          {g.dietaryRequirements}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Standard</span>
                      )}
                    </td>
                    <td className="py-2.5 text-stone-500 text-[11px]">{g.notes || '—'}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
