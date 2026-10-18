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
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useCapabilities } from '@/hooks/useCapabilities';

const historyLink = {
  href: '/dashboard/history',
  label: 'Trends',
  icon: TrendingUp,
};

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
  const capabilities = useCapabilities();
  const navLinks = capabilities.history ? [...links, historyLink] : links;
  const clearUser = useUserStore((s) => s.clearUser);

  const handleLogout = async () => {
    clearUser();
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="bg-base/90 sticky top-0 z-30 border-b border-white/8 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-accent flex h-7 w-7 items-center justify-center rounded-full text-black">
            <Waves className="h-3.5 w-3.5" strokeWidth={2.5} />
          </div>
          <span className="font-display text-cream text-sm font-bold tracking-tight">
            Sonalyze
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-muted hover:text-cream flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
      <nav className="flex scrollbar-none gap-1 overflow-x-auto px-3 pb-3">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                active ? 'bg-accent font-semibold text-black' : 'bg-elevated text-muted',
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
