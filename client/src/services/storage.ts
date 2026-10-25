import type { SavedEvent } from '../types';

const STORAGE_KEY = 'planora_events';

export function loadEvents(): SavedEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveEvents(events: SavedEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function getEvent(id: string): SavedEvent | undefined {
  return loadEvents().find(e => e.id === id);
}

export function saveEvent(event: SavedEvent): void {
  const events = loadEvents();
  const index = events.findIndex(e => e.id === event.id);
  if (index >= 0) {
    events[index] = { ...event, updatedAt: new Date().toISOString() };
  } else {
    events.push(event);
  }
  saveEvents(events);
}

export function deleteEvent(id: string): void {
  const events = loadEvents().filter(e => e.id !== id);
  saveEvents(events);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
