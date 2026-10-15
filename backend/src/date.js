import { APP_TIME_ZONE } from "./config.js";

const calendarFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayKey(now = new Date()) {
  return calendarFormatter.format(now);
}

export function addDays(date, amount) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + amount)).toISOString().slice(0, 10);
}

export function tomorrowKey() {
  return addDays(todayKey(), 1);
}

export function weekdayIso(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() || 7;
}

export function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function datesDescending(from, to, offset = 0, limit = 30) {
  const values = [];
  let cursor = to;
  let skipped = 0;

  while (cursor >= from && values.length < limit) {
    if (skipped >= offset) values.push(cursor);
    else skipped += 1;
    cursor = addDays(cursor, -1);
  }

  return values;
}

