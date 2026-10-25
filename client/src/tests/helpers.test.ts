import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  getDaysRemaining,
  formatDate,
  getEventTypeLabel,
  getEventTypeEmoji,
} from '../utils/helpers';

describe('Helper Utilities', () => {
  it('formats currency correctly in INR without decimals', () => {
    const formatted = formatCurrency(1500000, 'INR');
    expect(formatted).toContain('15,00,000');
  });

  it('calculates days remaining accurately', () => {
    const future = new Date();
    future.setDate(future.getDate() + 15);
    const dateStr = future.toISOString().split('T')[0];
    const days = getDaysRemaining(dateStr);
    expect(days).toBeGreaterThanOrEqual(14);
    expect(days).toBeLessThanOrEqual(16);
  });

  it('identifies past dates with negative days', () => {
    const past = new Date();
    past.setDate(past.getDate() - 10);
    const days = getDaysRemaining(past.toISOString().split('T')[0]);
    expect(days).toBeLessThan(0);
  });

  it('maps event type labels and emojis correctly', () => {
    expect(getEventTypeLabel('wedding')).toBe('Wedding');
    expect(getEventTypeLabel('birthday')).toBe('Birthday Party');
    expect(getEventTypeLabel('community')).toBe('Community Event');

    expect(getEventTypeEmoji('wedding')).toBe('💒');
    expect(getEventTypeEmoji('birthday')).toBe('🎂');
    expect(getEventTypeEmoji('community')).toBe('🎪');
  });
});
