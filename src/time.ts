const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export const nowMs = () => Date.now();

export function toIstIso(ms: number): string {
  const shifted = new Date(ms + IST_OFFSET_MS);
  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  return (
    `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}` +
    `T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}+05:30`
  );
}

export function istParts(ms: number) {
  const shifted = new Date(ms + IST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday: WEEKDAYS[shifted.getUTCDay()] ?? "sun",
  };
}

export function istDateAt(ms: number, hour: number, minute = 0): number {
  const parts = istParts(ms);
  return Date.UTC(parts.year, parts.month - 1, parts.day, hour, minute) - IST_OFFSET_MS;
}

export function startOfIstDay(ms: number): number {
  const parts = istParts(ms);
  return Date.UTC(parts.year, parts.month - 1, parts.day) - IST_OFFSET_MS;
}

export function addDays(ms: number, days: number): number {
  return ms + days * DAY_MS;
}

export function parseInstant(value: string): number | null {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseWindow(value: string): { startHour: number; startMinute: number; endHour: number; endMinute: number } | null {
  const match = /^([0-2][0-9]):([0-5][0-9])-([0-2][0-9]):([0-5][0-9])$/.exec(value);
  if (!match) return null;
  const [, startHour, startMinute, endHour, endMinute] = match;
  if (!startHour || !startMinute || !endHour || !endMinute) return null;
  return {
    startHour: Number(startHour),
    startMinute: Number(startMinute),
    endHour: Number(endHour),
    endMinute: Number(endMinute),
  };
}

export { IST_OFFSET_MS, DAY_MS, WEEKDAYS };
