/**
 * Date helper utilities for tasks
 */

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFriendlyDate(dateStr?: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
} {
  if (!dateStr) {
    return { label: 'No due date', isOverdue: false, isToday: false, isTomorrow: false };
  }

  const todayStr = getTodayDateString();
  const tomorrowStr = getTomorrowDateString();

  if (dateStr === todayStr) {
    return { label: 'Today', isOverdue: false, isToday: true, isTomorrow: false };
  }
  if (dateStr === tomorrowStr) {
    return { label: 'Tomorrow', isOverdue: false, isToday: false, isTomorrow: true };
  }

  // Parse date strings safely as UTC midnight to avoid local timezone off-by-one errors
  const [targetYear, targetMonth, targetDay] = dateStr.split('-').map(Number);
  const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);

  const targetDate = new Date(targetYear, targetMonth - 1, targetDay);
  const todayDate = new Date(todayYear, todayMonth - 1, todayDay);

  const isOverdue = targetDate < todayDate;

  // Format month and day
  const formatted = targetDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: targetYear !== todayYear ? 'numeric' : undefined,
  });

  return {
    label: isOverdue ? `${formatted} (Overdue)` : formatted,
    isOverdue,
    isToday: false,
    isTomorrow: false,
  };
}

export function isDueToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayDateString();
}

export function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return dateStr < getTodayDateString();
}

export function getHumanReadableToday(): string {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
