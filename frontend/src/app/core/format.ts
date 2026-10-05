const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Local calendar date as YYYY-MM-DD. */
function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const NOW = new Date();
export const TODAY = isoDate(NOW);
export const YESTERDAY = isoDate(new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - 1));
export const TODAY_MONTH = TODAY.slice(0, 7);

/** Shifts a YYYY-MM key by a number of months. */
export function shiftMonthKey(key: string, step: number): string {
  const d = new Date(Number(key.slice(0, 4)), Number(key.slice(5)) - 1 + step, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** The current month, 12 months back and 12 months forward. */
export const MONTHS: string[] = Array.from({ length: 25 }, (_, i) =>
  shiftMonthKey(TODAY_MONTH, i - 12),
);

// Window label shown in headings, such as "Jul 2025 to Jul 2027".
export const RANGE_LABEL = `${monthLabel(MONTHS[0])} to ${monthLabel(MONTHS[MONTHS.length - 1])}`;

export function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function money(n: number): string {
  return (
    (n < 0 ? '−' : '') +
    '$' +
    Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export function money0(n: number): string {
  return (n < 0 ? '−' : '') + '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
}

export function points(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function kfmt(n: number): string {
  return n >= 1000 ? '$' + (n / 1000).toFixed(n % 1000 ? 1 : 0).replace('.0', '') + 'k' : '$' + n;
}

export function daysIn(key: string): number {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

export function monthShort(key: string): string {
  return MON[Number(key.slice(5)) - 1];
}

export function monthLabel(key: string): string {
  return `${monthShort(key)} ${key.slice(0, 4)}`;
}

export function shortDate(date: string): string {
  return `${MON[Number(date.slice(5, 7)) - 1]} ${Number(date.slice(8))}`;
}

/** Rounds a value up to a 1, 2, 2.5, 5 or 10 times a power of ten, for chart axes. */
export function niceMax(value: number): number {
  const e = Math.pow(10, Math.floor(Math.log10(value)));
  const f = value / e;
  const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return n * e;
}

export function eventValue(event: Event): string {
  return (event.target as HTMLInputElement | HTMLSelectElement).value;
}

/** Reads a number from an input, treating empty or invalid text as 0. */
export function parseNumber(value: string): number {
  const v = parseFloat(value.replace(/,/g, ''));
  return isNaN(v) ? 0 : v;
}
