"use client";

import React, { useState } from "react";
import { Tag, X } from "lucide-react";
import { useCapabilities } from "@/hooks/useCapabilities";

export default function TrackTags({ trackId }: { trackId: string }) {
  const { tags: enabled } = useCapabilities();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [value, setValue] = useState("");

  if (!enabled) return null;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        const res = await fetch(
          `/api/user/tags?trackId=${encodeURIComponent(trackId)}`,
        );
        if (res.ok)
          setTags(
            ((await res.json()).tags ?? []).map((t: { tag: string }) => t.tag),
          );
      } catch {
        /* ignore */
      }
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const tag = value.trim().toLowerCase();
    if (!tag) return;
    setValue("");
    if (!tags.includes(tag)) setTags((t) => [...t, tag]);
    await fetch("/api/user/tags", {
      method: "POST",
      body: JSON.stringify({ trackId, tag }),
    }).catch(() => {});
  };

  const remove = async (tag: string) => {
    setTags((t) => t.filter((x) => x !== tag));
    await fetch("/api/user/tags", {
      method: "DELETE",
      body: JSON.stringify({ trackId, tag }),
    }).catch(() => {});
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
              className="flex items-center gap-1 rounded-full bg-elevated2 px-2 py-0.5 text-[10px] text-cream"
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
              className="w-20 rounded bg-elevated2 px-2 py-0.5 text-[10px] text-cream outline-none"
            />
          </form>
        </>
      )}
      <button
        onClick={toggle}
        aria-label="Tag track"
        title="Tag this track"
        className="rounded-full p-2 text-subtle opacity-70 hover:bg-elevated2 hover:text-accent hover:opacity-100"
      >
        <Tag className="h-4 w-4" />
      </button>
    </div>
  );
}
