/**
 * Bad Monk Forced Schedule Algorithm
 *
 * Generates blockedSlots entries for monks flagged as "bad".
 * Period: 20th of current month → 20th of next month (~30 days)
 * - 50% of days fully blocked
 * - On remaining days, 80% of slots blocked (only 20% available)
 * - All randomized via seeded shuffle
 */

interface ScheduleDay {
  day: string;
  start: string;
  end: string;
  active: boolean;
  slots?: string[];
}

interface BlockedSlot {
  id?: string;
  date: string;   // YYYY-MM-DD
  time: string;    // HH:mm
  forced?: boolean; // marks as auto-generated
}

/**
 * Fisher-Yates shuffle (in-place)
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Get the day name (Monday, Tuesday, etc.) for a Date object
 */
function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get available slots for a given weekday from the monk's schedule
 */
function getSlotsForDay(schedule: ScheduleDay[], dayName: string): string[] {
  const dayConfig = schedule.find(s => s.day === dayName);

  if (!dayConfig || !dayConfig.active) return [];

  // Use explicit slots if available
  if (dayConfig.slots && dayConfig.slots.length > 0) {
    return [...dayConfig.slots];
  }

  // Fallback: generate hourly slots from start/end
  const slots: string[] = [];
  const start = dayConfig.start || '00:00';
  const end = dayConfig.end || '23:59';
  let current = new Date(`2000-01-01T${start}`);
  const endTime = new Date(`2000-01-01T${end}`);

  while (current < endTime) {
    slots.push(
      current.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    );
    current.setMinutes(current.getMinutes() + 60);
  }

  return slots;
}

/**
 * Calculate the period start (20th of current or previous month)
 * and period end (20th of next month)
 */
export function getSchedulePeriod(referenceDate?: Date): { start: Date; end: Date } {
  const now = referenceDate || new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();

  let start: Date;
  let end: Date;

  if (day >= 20) {
    // We're on or past the 20th → period is this 20th to next month's 20th
    start = new Date(year, month, 20);
    end = new Date(year, month + 1, 20);
  } else {
    // Before the 20th → period is last month's 20th to this month's 20th
    start = new Date(year, month - 1, 20);
    end = new Date(year, month, 20);
  }

  return { start, end };
}

/**
 * Main algorithm: generate forced blockedSlots for a bad monk
 */
export function generateBadMonkSchedule(
  schedule: ScheduleDay[],
  referenceDate?: Date
): BlockedSlot[] {
  const { start, end } = getSchedulePeriod(referenceDate);
  const blockedSlots: BlockedSlot[] = [];

  // 1. Enumerate all dates in the period
  const allDates: Date[] = [];
  const current = new Date(start);
  while (current < end) {
    allDates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const totalDays = allDates.length;

  // 2. Randomly pick ~50% of days as fully blocked
  const shuffledDates = shuffle(allDates);
  const blockedDayCount = Math.round(totalDays * 0.5);
  const fullyBlockedDates = new Set(
    shuffledDates.slice(0, blockedDayCount).map(d => formatDate(d))
  );

  // 3. Process each date
  for (const date of allDates) {
    const dateStr = formatDate(date);
    const dayName = getDayName(date);
    const daySlots = getSlotsForDay(schedule, dayName);

    if (daySlots.length === 0) {
      // Day is already inactive in schedule, no need to block
      continue;
    }

    if (fullyBlockedDates.has(dateStr)) {
      // FULLY BLOCKED: block every slot
      for (const time of daySlots) {
        blockedSlots.push({ date: dateStr, time, forced: true });
      }
    } else {
      // PARTIALLY BLOCKED: block 80% of slots
      const shuffledSlots = shuffle(daySlots);
      const slotsToBlock = Math.round(shuffledSlots.length * 0.8);
      const blocked = shuffledSlots.slice(0, slotsToBlock);

      for (const time of blocked) {
        blockedSlots.push({ date: dateStr, time, forced: true });
      }
    }
  }

  return blockedSlots;
}

/**
 * Merge forced blocks with existing manual blocks.
 * Removes old forced blocks, keeps manual ones, adds new forced blocks.
 */
export function mergeBlockedSlots(
  existingSlots: BlockedSlot[],
  newForcedSlots: BlockedSlot[]
): BlockedSlot[] {
  // Keep only manually-created slots (not forced)
  const manualSlots = (existingSlots || []).filter(s => !s.forced);

  // Combine manual + new forced (dedupe by date+time)
  const seen = new Set<string>();
  const result: BlockedSlot[] = [];

  for (const slot of manualSlots) {
    const key = `${slot.date}|${slot.time}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(slot);
    }
  }

  for (const slot of newForcedSlots) {
    const key = `${slot.date}|${slot.time}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(slot);
    }
  }

  return result;
}
