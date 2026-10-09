import { AlertTriangle, Inbox } from 'lucide-react';
import EqBars from './EqBars';

export function LoadingState({ label = 'Loading your data' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/8 bg-panel/40 py-24 text-center">
      <EqBars className="h-6 text-accent" />
      <p className="text-sm text-muted">{label}…</p>
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong talking to Spotify.',
  hint,
}: {
  message?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 py-20 text-center">
      <AlertTriangle className="h-6 w-6 text-red-400" />
      <p className="text-sm font-medium text-cream">{message}</p>
      {hint && <p className="max-w-sm text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  body,
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 bg-panel/40 py-20 text-center">
      <Inbox className="h-6 w-6 text-subtle" />
      <p className="text-sm font-medium text-cream">{title}</p>
      {body && <p className="max-w-sm text-xs text-muted">{body}</p>}
    </div>
  );
}
