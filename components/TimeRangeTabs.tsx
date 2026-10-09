'use client';

import clsx from 'clsx';
import type { TimeRange } from '@/types/spotify';

const options: { value: TimeRange; label: string }[] = [
  { value: 'short_term', label: 'Last 4 weeks' },
  { value: 'medium_term', label: 'Last 6 months' },
  { value: 'long_term', label: 'All time' },
];

export default function TimeRangeTabs({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/8 bg-panel/60 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm',
            value === opt.value ? 'bg-accent text-black' : 'text-muted hover:text-cream'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
