/**
 * hoursParser.ts
 *
 * Parses store.hours (Google Maps free-text export) and returns an
 * open/closed status relative to Japan Standard Time (JST, UTC+9).
 *
 * All stores in Lost in Transit are in Japan. The user's device may be
 * in any timezone, so we convert to JST explicitly before comparing.
 *
 * Formats handled (from live DB sample, 900+ stores):
 *   "Monday: 12:00 – 8:00 PM\nTuesday: ..."   ← most common
 *   "Monday: 11:00 AM – 7:00 PM\n..."
 *   "Monday: 1:00 – 8:00 PM\n..."              ← open time drops AM/PM
 *   "Monday: 10:30 AM – 6:00 PM\n..."          ← with minutes
 *   "Monday: Closed\n..."
 *   "Monday: Open 24 hours\n..."
 *   "1:00 – 8:00 PM"                           ← no day prefix (rare)
 *
 * Time parsing rule for open times without AM/PM:
 *   Morning stores (8am, 9am, 10am, 11am) always include "AM" explicitly.
 *   Afternoon stores (12:00, 1:00, 2:00, 3:00) drop the suffix.
 *   So: no AM/PM on open time → assume PM (12:00 stays as noon).
 */

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

// ─── Types ────────────────────────────────────────────────────────────────────

export type HoursResult =
  | { status: 'open';         closesAt: string }        // "Open · Closes 8pm"
  | { status: 'opens_soon';   opensAt: string }         // "Opens at 12pm" (within 60 min)
  | { status: 'closed';       opensAt: string | null }  // "Closed · Opens 12pm" or "Closed"
  | { status: 'closed_today' }                          // "Closed today"
  | { status: 'open_24h' }                              // "Open 24hrs"
  | { status: 'unknown' };                              // no hours data / unrecognised format

// ─── JST helpers ─────────────────────────────────────────────────────────────

function getNowJST(): { dayIndex: number; minutesFromMidnight: number } {
  // toLocaleString with timeZone handles DST + offset correctly in all modern browsers.
  const jstStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });
  const jst = new Date(jstStr);
  return {
    dayIndex: jst.getDay(),                              // 0 = Sunday
    minutesFromMidnight: jst.getHours() * 60 + jst.getMinutes(),
  };
}

// ─── Time string → minutes from midnight ─────────────────────────────────────

/**
 * Parses a time string like "8:00 PM", "11:00 AM", "12:30", "1:00" into
 * minutes from midnight.
 *
 * @param raw           e.g. "8:00 PM", "12:00", "1:00"
 * @param isOpenTime    true → no AM/PM defaults to PM (afternoon store rule)
 *                      false → no AM/PM defaults to PM (close times always explicit in data,
 *                               but guard anyway)
 */
function parseTimeMinutes(raw: string, isOpenTime: boolean): number | null {
  const clean = raw.trim();

  const m = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!m) return null;

  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const period = m[3]?.toUpperCase() ?? null;

  if (period === 'AM') {
    if (h === 12) h = 0;          // 12:00 AM = midnight
  } else if (period === 'PM') {
    if (h !== 12) h += 12;        // 12:00 PM = noon (no change)
  } else {
    // No AM/PM suffix.
    // Morning stores always write "AM" explicitly; afternoon stores drop it.
    // Therefore: no suffix → afternoon → PM.
    // Exception: 12:00 without suffix = noon (already correct as-is).
    if (isOpenTime && h !== 12) {
      h += 12;                    // 1:00 → 13, 2:00 → 14, etc.
    }
    // For close times without suffix (shouldn't occur in data, but handle gracefully):
    if (!isOpenTime && h !== 12) {
      h += 12;
    }
  }

  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

// ─── Display format ───────────────────────────────────────────────────────────

/** Converts minutes-from-midnight to compact display: 720 → "12pm", 810 → "1:30pm" */
function formatTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const min = minutes % 60;
  const period = h24 >= 12 ? 'pm' : 'am';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return min === 0 ? `${h12}${period}` : `${h12}:${String(min).padStart(2, '0')}${period}`;
}

// ─── Parse a single day's range string ────────────────────────────────────────

interface DayRange {
  kind: 'hours';
  openMin: number;
  closeMin: number;
}

function parseDayHours(raw: string): DayRange | 'closed' | 'open_24h' | null {
  const s = raw.trim();

  if (/^closed$/i.test(s)) return 'closed';
  if (/open\s*24\s*hours?/i.test(s)) return 'open_24h';

  // Expect format: "HH:MM [AM|PM] – HH:MM [AM|PM]" (en-dash or hyphen)
  const parts = s.split(/\s*[–\-]\s*/);
  if (parts.length < 2) return null;

  const openMin = parseTimeMinutes(parts[0], true);
  const closeMin = parseTimeMinutes(parts[1], false);

  if (openMin === null || closeMin === null) return null;
  return { kind: 'hours', openMin, closeMin };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Given a store.hours string and the current JST time, returns an
 * HoursResult describing whether the store is open right now.
 *
 * Always returns { status: 'unknown' } rather than throwing — a bad parse
 * should never crash the approach card.
 */
export function getHoursStatus(hoursRaw: string | null | undefined): HoursResult {
  if (!hoursRaw || !hoursRaw.trim()) return { status: 'unknown' };

  const { dayIndex, minutesFromMidnight } = getNowJST();
  const todayName = DAY_NAMES[dayIndex];

  const lines = hoursRaw.split('\n').map(l => l.trim()).filter(Boolean);

  // ── Case 1: day-prefixed format ("Monday: 12:00 – 8:00 PM") ──────────────
  const hasDayPrefix = lines.some(l => /^\w+:\s/.test(l));

  if (hasDayPrefix) {
    // Build a map: dayName → raw hours string for that day
    const dayMap: Record<string, string> = {};
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      const dayPart = line.slice(0, colonIdx).trim();
      const hoursPart = line.slice(colonIdx + 1).trim();
      // Only store recognised day names
      if (DAY_NAMES.includes(dayPart)) {
        dayMap[dayPart] = hoursPart;
      }
    }

    const todayRaw = dayMap[todayName];
    if (!todayRaw) return { status: 'unknown' };

    const todayResult = parseDayHours(todayRaw);

    if (todayResult === 'open_24h') return { status: 'open_24h' };
    if (todayResult === 'closed')   return { status: 'closed_today' };
    if (todayResult === null)       return { status: 'unknown' };

    const { openMin, closeMin } = todayResult;
    const now = minutesFromMidnight;

    if (now >= openMin && now < closeMin) {
      // Open now — check if closes within 60 min (could add "closes soon" later)
      return { status: 'open', closesAt: formatTime(closeMin) };
    }

    // Closed now — find when it next opens
    if (now < openMin) {
      // Opens later today
      const minsUntilOpen = openMin - now;
      if (minsUntilOpen <= 60) {
        return { status: 'opens_soon', opensAt: formatTime(openMin) };
      }
      return { status: 'closed', opensAt: formatTime(openMin) };
    }

    // Past closing time — find the next open day
    for (let offset = 1; offset <= 7; offset++) {
      const nextDayName = DAY_NAMES[(dayIndex + offset) % 7];
      const nextRaw = dayMap[nextDayName];
      if (!nextRaw) continue;
      const nextResult = parseDayHours(nextRaw);
      if (nextResult === 'closed') continue;
      if (nextResult === 'open_24h') return { status: 'closed', opensAt: 'midnight' };
      if (nextResult === null) continue;
      return {
        status: 'closed',
        opensAt: offset === 1
          ? formatTime(nextResult.openMin)       // tomorrow, show time
          : `${nextDayName.slice(0, 3)} ${formatTime(nextResult.openMin)}`, // "Wed 12pm"
      };
    }

    return { status: 'closed', opensAt: null };
  }

  // ── Case 2: no day prefix — single range applies all days ────────────────
  // e.g. "1:00 – 8:00 PM"
  const singleResult = parseDayHours(hoursRaw.trim());

  if (singleResult === 'open_24h') return { status: 'open_24h' };
  if (singleResult === 'closed')   return { status: 'closed_today' };
  if (singleResult === null)       return { status: 'unknown' };

  const { openMin, closeMin } = singleResult;
  const now = minutesFromMidnight;

  if (now >= openMin && now < closeMin) {
    return { status: 'open', closesAt: formatTime(closeMin) };
  }
  if (now < openMin) {
    const minsUntilOpen = openMin - now;
    if (minsUntilOpen <= 60) return { status: 'opens_soon', opensAt: formatTime(openMin) };
    return { status: 'closed', opensAt: formatTime(openMin) };
  }
  return { status: 'closed', opensAt: null };
}
