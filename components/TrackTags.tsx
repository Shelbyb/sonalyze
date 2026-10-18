'use client';

import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useCapabilities } from '@/hooks/useCapabilities';
import { fetchWithRetry } from '@/lib/fetch-retry';

export default function TrackTags({ trackId }: { trackId: string }) {
  const { tags: enabled } = useCapabilities();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!enabled) return null;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setError(null);
      try {
        const res = await fetchWithRetry(
          `/api/user/tags?trackId=${encodeURIComponent(trackId)}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setTags(((await res.json()).tags ?? []).map((t: { tag: string }) => t.tag));
      } catch {
        setError('Could not load tags.');
      }
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const tag = value.trim().toLowerCase();
    if (!tag) return;
    setValue('');
    setError(null);
    const added = !tags.includes(tag);
    if (added) setTags((t) => [...t, tag]);
    try {
      const res = await fetchWithRetry('/api/user/tags', {
        method: 'POST',
        body: JSON.stringify({ trackId, tag }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      if (added) setTags((t) => t.filter((x) => x !== tag));
      setError('Could not save tag.');
    }
  };

  const remove = async (tag: string) => {
    setError(null);
    setTags((t) => t.filter((x) => x !== tag));
    try {
      const res = await fetchWithRetry('/api/user/tags', {
        method: 'DELETE',
        body: JSON.stringify({ trackId, tag }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setTags((t) => (t.includes(tag) ? t : [...t, tag]));
      setError('Could not remove tag.');
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-1" data-testid="track-tags">
      {open && (
        <>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => remove(tag)}
              aria-label={`Remove tag ${tag}`}
              className="bg-elevated2 text-cream flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]"
            >
              {tag}
              <X className="h-3 w-3" />
            </button>
          ))}
          <form onSubmit={add}>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Add tag"
              aria-label="Add tag"
              maxLength={32}
              className="bg-elevated2 text-cream w-20 rounded px-2 py-0.5 text-[10px] outline-none"
            />
          </form>
          {error && (
            <span role="alert" className="text-[10px] text-red-400">
              {error}
            </span>
          )}
        </>
      )}
      <button
        onClick={toggle}
        aria-label="Tag track"
        title="Tag this track"
        className="text-subtle hover:bg-elevated2 hover:text-accent rounded-full p-2 opacity-70 hover:opacity-100"
      >
        <Tag className="h-4 w-4" />
      </button>
    </div>
  );
}
