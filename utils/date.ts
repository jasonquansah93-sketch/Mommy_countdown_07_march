const TOTAL_PREGNANCY_WEEKS = 40;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_WEEK = MS_PER_DAY * 7;

export function getWeeksAndDays(dueDate: string): { weeks: number; days: number } {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { weeks: 0, days: 0 };
  }

  const totalDays = Math.ceil(diffMs / MS_PER_DAY);
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;

  return { weeks, days };
}

export function getCurrentWeek(dueDate: string): number {
  const { weeks } = getWeeksAndDays(dueDate);
  return Math.max(0, TOTAL_PREGNANCY_WEEKS - weeks);
}

export function getProgressPercent(dueDate: string): number {
  const currentWeek = getCurrentWeek(dueDate);
  return Math.min(100, Math.max(0, (currentWeek / TOTAL_PREGNANCY_WEEKS) * 100));
}

export function getTimeUntilDue(dueDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const due = new Date(dueDate);
  const now = new Date();
  let diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diffMs / MS_PER_DAY);
  diffMs -= days * MS_PER_DAY;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutes * 1000 * 60;
  const seconds = Math.floor(diffMs / 1000);

  return { days, hours, minutes, seconds };
}

export function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysRemaining(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / MS_PER_DAY);
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getJourneyProgress(startDate: string, dueDate: string): number {
  if (!startDate || !dueDate) return 0;
  const start = new Date(startDate).getTime();
  const due = new Date(dueDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(due) || due <= start) return 0;
  const now = Date.now();
  if (now >= due) return 100;
  if (now <= start) return 0;
  return Math.round(((now - start) / (due - start)) * 100);
}

/** Returns whether a milestone date is in the past, today, or future. */
export function getMilestoneDateState(dateStr: string): 'past' | 'today' | 'future' {
  if (!dateStr) return 'future';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'future';
  const now = new Date();
  const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const ms = dayStart(d);
  const today = dayStart(now);
  if (ms < today) return 'past';
  if (ms > today) return 'future';
  return 'today';
}

export function getTimeUntilDueMs(dueDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ms: number;
  totalMinutes: number;
} {
  const due = new Date(dueDate);
  const now = new Date();
  let diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0, totalMinutes: 0 };
  }

  // Calculate total minutes for alternative display mode
  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  const days = Math.floor(diffMs / MS_PER_DAY);
  diffMs -= days * MS_PER_DAY;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs -= minutes * 1000 * 60;
  const seconds = Math.floor(diffMs / 1000);
  const ms = Math.floor((diffMs % 1000) / 10);

  return { days, hours, minutes, seconds, ms, totalMinutes };
}
