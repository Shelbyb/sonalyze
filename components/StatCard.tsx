import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
}: StatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/8 bg-panel/50 p-5 transition-all duration-300 hover:border-white/15 hover:bg-panel">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">
          {title}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-cream">
            {value}
          </span>
          {badge && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-xs text-subtle truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
