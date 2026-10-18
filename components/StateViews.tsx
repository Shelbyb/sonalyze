import { AlertTriangle, Inbox } from 'lucide-react';
import EqBars from './EqBars';

export function LoadingState({ label = 'Loading your data' }: { label?: string }) {
  return (
    <div className="bg-panel/40 flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/8 py-24 text-center">
      <EqBars className="text-accent h-6" />
      <p className="text-muted text-sm">{label}…</p>
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
      <p className="text-cream text-sm font-medium">{message}</p>
      {hint && <p className="text-muted max-w-sm text-xs">{hint}</p>}
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
    <div className="bg-panel/40 flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/8 py-20 text-center">
      <Inbox className="text-subtle h-6 w-6" />
      <p className="text-cream text-sm font-medium">{title}</p>
      {body && <p className="text-muted max-w-sm text-xs">{body}</p>}
    </div>
  );
}
