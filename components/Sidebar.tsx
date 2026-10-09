'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutGrid,
  BarChart3,
  Music2,
  History,
  Compass,
  ListMusic,
  Wand2,
  LogOut,
  Waves,
} from 'lucide-react';
import clsx from 'clsx';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { href: '/dashboard/top-artists', label: 'Top artists', icon: BarChart3 },
  { href: '/dashboard/top-tracks', label: 'Top tracks', icon: Music2 },
  { href: '/dashboard/recently-played', label: 'Recently played', icon: History },
  { href: '/dashboard/taste-profile', label: 'Taste profile', icon: Compass },
  { href: '/dashboard/playlists', label: 'Your playlists', icon: ListMusic },
  { href: '/dashboard/discover', label: 'Playlist generator', icon: Wand2 },
];

export default function Sidebar({
  userName,
  userImage,
}: {
  userName?: string | null;
  userImage?: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/8 bg-panel/60 backdrop-blur lg:flex">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-6 py-6 group">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black transition-transform group-hover:scale-105">
          <Waves className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <span className="font-display text-base font-bold tracking-tight text-cream">Sonalyze</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-elevated text-cream font-semibold'
                  : 'text-muted hover:bg-elevated/60 hover:text-cream'
              )}
            >
              <Icon className={clsx('h-4 w-4', active && 'text-accent')} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/8 px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-elevated2 text-xs font-bold text-accent ring-1 ring-white/10">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="" className="h-full w-full object-cover" />
            ) : (
              (userName ?? '?').charAt(0).toUpperCase()
            )}
          </div>
          <span className="truncate text-sm font-medium text-cream">{userName ?? 'Listener'}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-elevated/60 hover:text-cream"
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}
