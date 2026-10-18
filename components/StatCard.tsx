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
    <div className="bg-panel/50 hover:bg-panel flex flex-col justify-between rounded-2xl border border-white/8 p-5 transition-all duration-300 hover:border-white/15">
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs font-semibold tracking-[0.1em] uppercase">
          {title}
        </span>
        <div className="bg-accent/10 text-accent flex h-8 w-8 items-center justify-center rounded-lg">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-cream text-2xl font-bold tracking-tight">
            {value}
          </span>
          {badge && (
            <span className="bg-accent/15 text-accent rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-subtle mt-1 truncate text-xs">{subtitle}</p>}
      </div>
    </div>
  );
}
