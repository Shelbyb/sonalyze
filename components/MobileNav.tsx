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
  { href: '/dashboard/top-artists', label: 'Artists', icon: BarChart3 },
  { href: '/dashboard/top-tracks', label: 'Tracks', icon: Music2 },
  { href: '/dashboard/recently-played', label: 'Recent', icon: History },
  { href: '/dashboard/taste-profile', label: 'Profile', icon: Compass },
  { href: '/dashboard/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/dashboard/discover', label: 'Generate', icon: Wand2 },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-30 border-b border-white/8 bg-base/90 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-black">
            <Waves className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
          <span className="font-display text-sm font-bold tracking-tight text-cream">Sonalyze</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-cream transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
      <nav className="scrollbar-none flex gap-1 overflow-x-auto px-3 pb-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                active ? 'bg-accent text-black font-semibold' : 'bg-elevated text-muted'
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
