const DAY_MS = 24 * 60 * 60 * 1000;

/** Opening dates are Japan-local dates, not timestamps. */
export function isRecentlyOpened(openingDate: string | undefined, now = new Date()): boolean {
  if (!openingDate || !/^\d{4}-\d{2}-\d{2}$/.test(openingDate)) return false;
  const openingTime = Date.parse(`${openingDate}T00:00:00Z`);
  if (!Number.isFinite(openingTime)) return false;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const todayTime = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day));
  const daysAgo = (todayTime - openingTime) / DAY_MS;
  return daysAgo >= 0 && daysAgo <= 90;
}

export function isEstimatedPrice(evidence: string | undefined): boolean {
  return /\binferred\b/i.test(evidence ?? '');
}

/** Suggestions are untrusted input, so only link to web URLs. */
export function safeWebsiteUrl(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}
