import { MonthSummary, sum } from './finance';
import { TipContent } from './feedback.service';
import {
  daysIn,
  kfmt,
  money,
  money0,
  monthLabel,
  monthShort,
  niceMax,
  pad,
  shortDate,
  TODAY,
  TODAY_MONTH,
} from './format';

/** Rounded-top bar path, the same shape as the prototype's bars. */
export function barPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, h, w / 2);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

const WEEK = { W: 380, H: 196, pt: 26, pb: 40, pl: 6, pr: 6 };

export interface WeekBar {
  index: number;
  cx: number;
  value: number;
  path: string;
  valueText: string;
  valueY: number;
  future: boolean;
  range: string;
  tip: TipContent;
}

export interface WeekView {
  baseY: number;
  bars: WeekBar[];
}

/** Number of days before the 1st that belong to the Monday-to-Sunday week it starts in (0 when it is a Monday). */
function leadingDays(key: string): number {
  const [year, month] = key.split('-').map(Number);
  return (new Date(year, month - 1, 1).getDay() + 6) % 7;
}

/** Spending grouped into the month's Monday-to-Sunday weeks. The first and last weeks may be partial. */
export function weeklyView(s: MonthSummary): WeekView {
  const { W, H, pt, pb, pl, pr } = WEEK;
  const dim = daysIn(s.key);
  const lead = leadingDays(s.key);
  const weeks = Math.ceil((dim + lead) / 7);

  const totals: number[] = Array.from({ length: weeks }, () => 0);
  for (const e of s.expenses) {
    const day = Number(e.date.slice(8));
    totals[Math.min(Math.floor((day - 1 + lead) / 7), weeks - 1)] += e.amount;
  }

  const max = niceMax(Math.max(1, ...totals));
  const step = (W - pl - pr) / weeks;
  const bw = Math.min(40, step - 18);
  const baseY = H - pb;
  const isCurrent = s.key === TODAY_MONTH;
  const todayDay = Number(TODAY.slice(8));

  const bars = totals.map((value, i): WeekBar => {
    const cx = pl + step * i + step / 2;
    const h = (H - pt - pb) * (value / max);
    const y = H - pb - h;
    const first = Math.max(1, i * 7 - lead + 1);
    const last = Math.min(dim, (i + 1) * 7 - lead);
    const future = isCurrent && first > todayDay;
    return {
      index: i,
      cx,
      value,
      path: value > 0 ? barPath(cx - bw / 2, y, bw, h) : '',
      valueText: value > 0 ? money0(value) : future ? '' : '$0',
      valueY: value > 0 ? y - 7 : baseY - 8,
      future,
      range: `${first}–${last}`,
      tip: {
        title: `Week ${i + 1} (${shortDate(`${s.key}-${pad(first)}`)}–${last})`,
        lines: [money(value)],
      },
    };
  });

  return { baseY, bars };
}

const DONUT = { cx: 100, cy: 100, R: 86, r: 56 };
const PALETTE = ['var(--s1)', 'var(--s2)', 'var(--c3)', 'var(--c4)', 'var(--c5)'];

export interface Slice {
  name: string;
  amount: number;
  pct: number;
  color: string;
  /** True when there is only one slice, which is drawn as a full ring. */
  circle: boolean;
  path: string;
  tip: TipContent;
}

function arcPath(from: number, to: number): string {
  const { cx, cy, R, r } = DONUT;
  const point = (radius: number, angle: number) =>
    `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  const large = to - from > Math.PI ? 1 : 0;
  return `M${point(R, from)} A${R},${R} 0 ${large} 1 ${point(R, to)} L${point(r, to)} A${r},${r} 0 ${large} 0 ${point(r, from)} Z`;
}

/** Top five categories by spending, with the rest grouped as "Other". */
export function donutSlices(s: MonthSummary): Slice[] {
  const items = Object.entries(s.byCat)
    .map(([name, amount]) => ({ name, amount }))
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const slices = items
    .slice(0, 5)
    .map((it, i) => ({ name: it.name, amount: it.amount, color: PALETTE[i] }));
  const rest = items.slice(5);
  if (rest.length) {
    slices.push({
      name: rest.length > 1 ? `Other (${rest.length} categories)` : rest[0].name,
      amount: sum(rest.map((x) => x.amount)),
      color: 'var(--oth)',
    });
  }

  let angle = -Math.PI / 2;
  return slices.map((sl): Slice => {
    const frac = sl.amount / s.spent;
    const pct = Math.round(frac * 100);
    const next = angle + frac * Math.PI * 2;
    const slice: Slice = {
      ...sl,
      pct,
      circle: slices.length === 1,
      path: slices.length === 1 ? '' : arcPath(angle, next),
      tip: { title: sl.name, lines: [`${money(sl.amount)} · ${pct}% of spending`] },
    };
    angle = next;
    return slice;
  });
}

const YEAR = { W: 760, H: 250, pl: 44, pr: 8, pt: 12, pb: 28 };

export interface YearBar {
  key: string;
  label: string;
  cx: number;
  hitX: number;
  hitW: number;
  selected: boolean;
  netPath: string;
  spentPath: string;
  tip: TipContent;
}

export interface YearRow {
  key: string;
  label: string;
  net: number;
  spent: number;
  profit: number;
  rate: string;
  value: number;
}

export interface YearView {
  grid: { y: number; label: string }[];
  bars: YearBar[];
  table: YearRow[];
}

/** Income and spending for each month, with the selected month highlighted. */
export function yearView(rows: MonthSummary[], selectedKey: string): YearView {
  const { W, H, pl, pr, pt, pb } = YEAR;
  const max = niceMax(Math.max(1000, ...rows.flatMap((r) => [r.net, r.spent])));
  const step = (W - pl - pr) / rows.length;
  const bw = Math.min(16, step / 2 - 3);
  const hh = H - pt - pb;

  const grid = [0, 1, 2, 3, 4].map((t) => {
    const v = (max / 4) * t;
    return { y: H - pb - hh * (v / max), label: kfmt(v) };
  });

  const bars = rows.map((r, i): YearBar => {
    const cx = pl + step * i + step / 2;
    const h1 = hh * (r.net / max);
    const h2 = hh * (r.spent / max);
    const inProgress = r.key === TODAY_MONTH;
    return {
      key: r.key,
      label: monthShort(r.key),
      cx,
      hitX: cx - step / 2,
      hitW: step,
      selected: r.key === selectedKey,
      netPath: r.net > 0 ? barPath(cx - bw - 1, H - pb - h1, bw, h1) : '',
      spentPath: r.spent > 0 ? barPath(cx + 1, H - pb - h2, bw, h2) : '',
      tip: r.any
        ? {
            title: `${monthLabel(r.key)}${inProgress ? ' (in progress)' : ''}`,
            lines: [
              `Income ${money0(r.net)}`,
              `Spent ${money0(r.spent)}`,
              `Profit ${money0(r.profit)}`,
            ],
          }
        : { title: monthLabel(r.key), lines: ['No data yet'] },
    };
  });

  const table = rows
    .filter((r) => r.any)
    .map((r): YearRow => ({
      key: r.key,
      label: monthLabel(r.key),
      net: r.net,
      spent: r.spent,
      profit: r.profit,
      rate: r.rate === null ? '–' : `${Math.round(r.rate * 100)}%`,
      value: r.value,
    }));

  return { grid, bars, table };
}
